import demucs.api
import librosa as lr
import numpy as np
import IPython.display as ipd
import torch
import soundfile as sf
import pydub
import tensorflow as tf
import essentia
import essentia.standard as es
# import os
# from pathlib import Path
# import tempocnn

# import audioread
# import numpy as np
# import soundfile as sf

# class TempoFeatures:
#     def read_features(
#         file: np.array,
#         frames: int = 256,
#         hop_length: int = 128,
#         zero_pad: bool = False,
#     ) -> np.ndarray:
#         """
#         Resample file to 11025 Hz, then transform using STFT with length 1024
#         and hop size 512. Convert resulting linear spectrum to mel spectrum
#         with 40 bands ranging from 20 to 5000 Hz.

#         Since we require at least 256 frames, shorter audio excerpts are always
#         zero padded.

#         Specifically for tempogram 128 frames each can be added at the front and
#         at the back in order to make the calculation of BPM values for the first
#         and the last window possible.

#         :param file: file
#         :param frames: 256
#         :param hop_length: 128 or shorter
#         :param zero_pad: adds 128 zero frames both at the front and back
#         :param normalize: normalization function
#         :return: feature tensor for the whole file
#         """
#         y, sr = lr.resample(file, orig_sr=44100, target_sr=11025)
#         data = lr.feature.melspectrogram(
#             y=y,
#             sr=11025,
#             n_fft=1024,
#             hop_length=512,
#             power=1,
#             n_mels=40,
#             fmin=20,
#             fmax=5000,
#         )
#         data = np.reshape(data, (1, data.shape[0], data.shape[1], 1))

#         # add frames/2 zero frames before and after the data
#         if zero_pad:
#             data = TempoFeatures._add_zeros(data, frames)

#         # zero-pad, if we have less than 256 frames to make sure we get some
#         # result at all
#         if data.shape[2] < frames:
#             data = TempoFeatures._ensure_length(data, frames)

#         # convert data to overlapping windows,
#         # each window is one sample (first dim)
#         return TempoFeatures._to_sliding_window(data, frames, hop_length)


#     def _ensure_length(data: np.ndarray, length: int) -> np.ndarray:
#         padded_data = np.zeros((1, data.shape[1], length, 1), dtype=data.dtype)
#         padded_data[0, :, 0 : data.shape[2], 0] = data[0, :, :, 0]
#         return padded_data


#     def _add_zeros(data: np.ndarray, zeros: int) -> np.ndarray:
#         padded_data = np.zeros(
#             (1, data.shape[1], data.shape[2] + zeros, 1), dtype=data.dtype
#         )
#         padded_data[0, :, zeros // 2 : data.shape[2] + (zeros // 2), 0] = data[0, :, :, 0]
#         return padded_data

#     def _to_sliding_window(
#         data: np.ndarray, window_length: int, hop_length: int
#     ) -> np.ndarray:
#         total_frames = data.shape[2]
#         windowed_data = []
#         for offset in range(
#             0, ((total_frames - window_length) // hop_length + 1) * hop_length, hop_length
#         ):
#             windowed_data.append(np.copy(data[:, :, offset : window_length + offset, :]))
#         return np.concatenate(windowed_data, axis=0)


class AudioWrapper:
    def __init__(self, path: str = "", data = None, sr = None, name: str = ''):
        if len(path) > 0:
            data, sr = AudioWrapper.load_audio(path)
            self.name = path.split('/')[1].split('.')[0]
        else:
            self.name = name
            data = np.transpose(data)
        self.data = data
        self.sr = sr
        self.buffer = np.copy(data)
        self.bpm = 100 # replace with BPM detection model
        self.key = 'A' # replace with key detection model
        self.beats = None # detect beat grid from peaks using the beat detection model
        self.confidence = None
        self.vocals = None
        self.instrumental = None

    def split(self):
        separator = demucs.api.Separator()
        print('started separation')
        # print(self.data.shape)
        # self.instrumental = self.data
        # self.vocals = self.data
        origin, splits = separator.separate_tensor(torch.from_numpy(self.data), self.sr) # split with Demucs model
        self.instrumental = (splits["drums"] + splits["bass"] + splits["other"]).numpy()
        self.vocals = (splits["vocals"]).numpy()

    def stretch_to_other(self, other: 'AudioWrapper'):
        # find energy in each band of vocals and instrumental. apply filters/EQ/whatever
        this_bpm = self.bpm
        other_bpm = other.bpm
        ratio = other_bpm / this_bpm
        print(self.beats[0] - other.beats[0])
        start = self.beats[16]
        otherstart = other.beats[16]
        fitting = (self.beats - start)[:16]
        fit_to = (other.beats - otherstart)[:16]

        if len(self.beats) > len(other.beats):
            self.beats = self.beats[:len(other.beats)]
        else:
            other.beats = other.beats[:len(self.beats)]
        X = np.vstack([fitting, np.ones_like(fitting)]).T

        coeffs, *_ = np.linalg.lstsq(X, fit_to, rcond=None)
        alpha, beta = coeffs
        # subtract beta from beat grid and stretch by alpha, just like you do with the file
        self.cut(beta)
        print(np.dot(self.beats, other.beats) / np.dot(self.beats, self.beats))
        print(alpha, beta)

        self.data = lr.effects.time_stretch(self.data, rate=alpha)
        self.beats += beta
        self.beats *= alpha

    def cut(self, sec: np.float32):
        samples = lr.time_to_samples(np.abs(sec), sr=self.sr)
        if sec > 0:
            fill = np.vstack([np.zeros(samples), np.zeros(samples)])
            self.instrumental = np.append(fill, self.instrumental)
            self.vocals = np.append(fill, self.vocals)
            self.data = np.append(fill, self.data)
        else:
            self.buffer = np.vstack([
                self.data[:, :samples],
                self.instrumental[:, :samples],
                self.vocals[:, :samples]
            ])
            self.data = self.data[:, samples:]
            self.instrumental = self.instrumental[:, samples:]
            self.vocals = self.vocals[:, samples:]
            
        self.beats += sec
    
    # def trim(self):
        # 

    def analyze(self):
        model = AudioWrapper.load_tempo()
        mono = np.mean(self.instrumental, axis=0)
        bpm, beats, beats_confidence, _, beats_intervals = model(mono)
        print("model: ", bpm, beats, beats_confidence, beats_intervals)
        bpm, beats = lr.beat.beat_track(y=mono, sr=self.sr)
        beats = lr.frames_to_time(beats)
        b0 = beats[0]
        beats -= b0
        beats /= 2
        beats = np.append(beats, (beats + beats[-1])[1:])
        beats += b0
        if bpm < 100:
            bpm *= 2
            beats /= 2
            # beats = np.append(beats, beats + beats[-1])
        self.bpm = np.round(bpm)
        self.beats = beats
        self.confidence = beats_confidence
        # test = lr.beat.beat_track(y=mono, sr=self.sr)
        # print("librosa: ", test[0], lr.frames_to_time(test[1]))
        # start = int(self.beats[0] * 44100)
        # self.beats -= self.beats[0]
        # print(self.beats)
        # self.data = self.data[:start, :]


    def playback(self):
        return self.instrumental + self.vocals
        
    def load_audio(path: str):
        print('start loading')
        dur = pydub.utils.mediainfo(path)["duration"]
        data, sr = lr.load(path, sr=44100, duration=np.floor(float(dur)), mono=False)
        print('finish loading')
        return data, sr

    def load_tempo():
        tempo_estimator = es.RhythmExtractor2013(method="multifeature")
        # graphFilename='models/beats/deeptemp/deeptemp-k16-3.pb'
        return tempo_estimator

    def write_stems(self):
        if self.instrumental and self.vocals:
            sf.write('out/' + self.name + '_vocals.wav', np.transpose(self.vocals), 44100)
            sf.write('out/' + self.name + '_instrumental.wav', np.transpose(self.vocals), 44100)

    def write_original(self):
        rate = 1.1
        sf.write('out/' + self.name + '_original.wav', np.transpose(np.vstack([lr.effects.time_stretch(self.data[0], rate=rate), lr.effects.time_stretch(self.data[1], rate=rate)])), 44100)
# test = AudioWrapper(path='input/olympian.mp3')
# test.analyze()
# test.write_original()
# print(essentia.availableAlgorithms())

# test.split()
# sf.write('out/vocals.wav', np.transpose(test.vocals), 44100)
# sf.write('out/instrumental.wav', np.transpose(test.instrumental), 44100)
# print(type(vocals))
# ipd.Audio(instrumental, rate=44100)
# ipd.Audio(vocals, rate=44100)
