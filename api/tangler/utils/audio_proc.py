import demucs.api
import librosa as lr
import numpy as np
import torch
import soundfile as sf
import pydub
import essentia
import essentia.standard as es
import scipy as sp
from tempocnn.classifier import TempoClassifier
from .tempo_features import TempoFeatures
import pyrubberband as pyrb
import os

torch.hub.set_dir('models')
os.environ["TORCH_HOME"] = os.path.abspath("models")

class AudioWrapper:
    def __init__(self, path: str = "", data = None, sr = None, name: str = ''):
        torch.hub.set_dir('')
        if len(path) > 0:
            data, sr = AudioWrapper.load_audio(path)
            self.name = path.split('/')[1].split('.')[0]
        else:
            self.name = name
            data = np.transpose(data)
        self.data = data
        max_min = 3.0
        end = lr.time_to_samples(max_min * 60, sr=sr)
        self.data = self.data[:, :end]
        print("shape: " + str(self.data.shape))
        self.sr = sr
        # self.buffer = np.copy(data)
        self.bpm = 100 # replace with BPM detection model
        self.key = 'A' # replace with key detection model
        self.beats = None # detect beat grid from peaks using the beat detection model
        self.error = None
        self.vocals = None
        self.instrumental = None
        self.start = 0
        self.beat_start = 0
        self.db_floor = 55

    def split(self):
        separator = demucs.api.Separator()
        print('started separation')
        # print(self.data.shape)
        # self.instrumental = np.copy(self.data)
        # self.vocals = np.copy(self.data)
        origin, splits = separator.separate_tensor(torch.from_numpy(self.data), self.sr) # split with Demucs model
        self.instrumental = (splits["drums"] + splits["bass"] + splits["other"]).numpy()
        self.vocals = (splits["vocals"]).numpy()

    def fit_beatgrid(self, other: 'AudioWrapper'):
        start = self.beats[0]
        otherstart = other.beats[0]

        # fitting = (self.beats - start)
        # fit_to = (other.beats - otherstart)

        # if len(fitting) > len(fit_to):
        #     fitting = fitting[:len(fit_to)]
        # else:
        #     fit_to = fit_to[:len(fitting)]
        # X = np.vstack([fitting, np.ones_like(fitting)]).T

        # coeffs, *_ = np.linalg.lstsq(X, fit_to, rcond=None)
        # alpha, beta = coeffs
        # # self.cut(beta)
        # # print(np.dot(self.beats, other.beats) / np.dot(self.beats, self.beats))
        # offset_diff = lr.time_to_samples(start - otherstart, sr=self.sr)
        beat_threshold = 12
        # self.set_start()
        self.set_beat_start(threshold=beat_threshold)
        # other.set_start()
        other.set_beat_start(threshold=beat_threshold)

        beat_diff = self.beat_start - other.beat_start
        print("other offset diff: " + str(beat_diff))
        return beat_diff
    
    @staticmethod
    def get_key(data: np.ndarray):
        pass

    def pitchshift(self, tones: float):
        pass

    def timestretch(self, rate: float):
        self.data = lr.effects.time_stretch(self.data, rate=rate)
        self.instrumental = lr.effects.time_stretch(self.instrumental, rate=rate)
        self.vocals = lr.effects.time_stretch(self.vocals, rate=rate)
        # self.data = pyrb.time_stretch(y=np.transpose(self.data), sr=self.sr, rate=rate)
        # self.instrumental = pyrb.time_stretch(y=np.transpose(self.instrumental), sr=self.sr, rate=rate)
        # self.vocals = pyrb.time_stretch(y=np.transpose(self.vocals), sr=self.sr, rate=rate)
        self.beats /= rate

    def stretch_to_other(self, other: 'AudioWrapper'):
        # find energy in each band of vocals and instrumental. apply filters/EQ/whatever
        this_bpm = self.bpm
        other_bpm = other.bpm
        ratio = other_bpm / this_bpm
        if ratio > 1.4:
            this_bpm *= 2
        elif ratio < (1/1.4):
            other_bpm *= 2
        this_bpm = np.round(this_bpm * 2) / 2
        other_bpm = np.round(other_bpm * 2) / 2
        ratio = other_bpm / this_bpm

        print("this bpm: " + str(this_bpm) + "\nother bpm: " + str(other_bpm) + "\nratio: " + str(ratio))
        self.timestretch(rate=ratio)
        diff = self.fit_beatgrid(other=other)
        if diff > 0:
            # this song starts later than the other song
            # we need to pad the other song to get it to start at the same time
            other.cut(diff)
        else:
            # otherwise, pad our current song to get it to start at the same time
            self.cut(diff*(-1))
        print("offset diff: " + str(diff))
    
    def set_start(self):
        silence_threshold = 47
        data, index = lr.effects.trim(self.instrumental, top_db=silence_threshold)
        print("indices sliced: " + str(index))
        
        self.start = index[0]
        self.beats -= self.beats[0]
        self.beats += lr.samples_to_time(self.start, sr=self.sr)
        
    @staticmethod
    def get_db(y: np.ndarray = None) -> np.ndarray:
        mse = lr.feature.rms(y=y, frame_length=2048, hop_length=512)
        db: np.ndarray = lr.core.amplitude_to_db(mse[..., 0, :], ref=np.max, top_db=None)
        return db
    
    def set_beat_start(self, threshold: float = 30):
        print(AudioWrapper.get_db(self.instrumental))
        data, idx = lr.effects.trim(self.instrumental, top_db=threshold)
        # self.beat_start = lr.effects.trim()
        self.beat_start = idx[0]
        print(self.name + " beat start: " + str(lr.samples_to_time(self.beat_start, sr=self.sr)) + " sec")

    def cut(self, samples: np.integer):
        if samples > 0:
            fill = np.vstack([np.zeros(samples), np.zeros(samples)])
            self.instrumental = np.append(fill, self.instrumental, axis=1)
            self.vocals = np.append(fill, self.vocals, axis=1)
            self.data = np.append(fill, self.data, axis=1)
        else:
            self.data = self.data[:, samples:]
            self.instrumental = self.instrumental[:, samples:]
            print("vocal shape: " + str(self.vocals.shape))
            self.vocals = self.vocals[:, samples:]

        print(self.name + " cut to " + str(self.vocals.shape))
        self.beats += lr.samples_to_time(samples, sr=self.sr)

    def analyze(self):
        model = AudioWrapper.load_rhythm()
        data, index = lr.effects.trim(self.instrumental, top_db=self.db_floor)
        
        print("indices sliced: " + str(index))
        mono = np.mean(data, axis=0)
        bpm, beats, beats_confidence, estimates, beats_intervals = model(mono)
        # print("model: ", bpm, beats, beats_confidence, estimates, beats_intervals)
        # print("stdev: " + str(np.std(beats_intervals)))
        beats += lr.samples_to_time(index[0], sr=self.sr)
        # bpm, beats = lr.beat.beat_track(y=mono, sr=self.sr)
        # beats = lr.frames_to_time(beats)
        # b0 = beats[0]
        # beats -= b0
        # beats /= 2
        # beats = np.append(beats, (beats + beats[-1])[1:])
        # beats += b0
            # beats = np.append(beats, beats + beats[-1])
        self.error = np.abs(bpm - (np.round(bpm * 2) / 2))
        self.bpm = np.round(bpm * 2) / 2
        self.beats = beats
        print(self.name)
        print("rhythm extractor bpm: " + str(self.bpm))
        print("rhythm extractor error: " + str(self.error))
        self.confidence = beats_confidence

        chromagram = lr.feature.chroma_stft(y=self.vocals, sr=self.sr)


        # test = lr.beat.beat_track(y=mono, sr=self.sr)
        # print("librosa: ", test[0], lr.frames_to_time(test[1]))
        # start = int(self.beats[0] * 44100)
        # self.beats -= self.beats[0]
        # print(self.beats)
        # self.data = self.data[:start, :]

    def analyze_tempocnn(self):
        model = AudioWrapper.load_tempocnn()
        # mono = np.mean(self.instrumental, axis=0)
        data, index = lr.effects.trim(self.instrumental, top_db=self.db_floor)
        features = TempoFeatures.read_features(data)
        bpm = model.estimate_tempo(features, interpolate=True)
        local_tempo_classes = model.estimate(features)

        # find argmax per frame and convert class index to BPM value
        max_predictions = np.argmax(local_tempo_classes, axis=1)
        local_tempi = model.to_bpm(max_predictions)
        print("test bpm: " + str(np.mean(local_tempi[4:-4])))
        print(f"Estimated local tempo classes: {local_tempi}")
        print("tempocnn bpm: " + str(bpm))
        print("tempocnn error: " + str(bpm - (np.round(bpm * 2) / 2)))
        if self.bpm > 100 and self.bpm % 1 == 0.5:
            self.bpm = np.round(bpm * 2) / 2
        if np.abs(bpm - (np.round(bpm * 2) / 2)) < self.error:
            self.bpm = np.round(bpm * 2) / 2

    def playback(self):
        return np.mean(np.vstack([self.instrumental, self.vocals]), axis=0)
    
    @staticmethod
    def load_audio(path: str):
        print('start loading')
        dur = pydub.utils.mediainfo(path)["duration"]
        data, sr = lr.load(path, sr=44100, duration=np.floor(float(dur)), mono=False) # load np.ndarray of stereo data (2, length) and store sample rate
        data, idx = lr.effects.trim(data) # trim silence from start and end
        print('finish loading')
        return data, sr
    
    @staticmethod
    def load_tempocnn():
        tempo_estimator = TempoClassifier('cnn')
        return tempo_estimator
    
    @staticmethod
    def load_rhythm():
        tempo_estimator = es.RhythmExtractor2013(method="multifeature")
        return tempo_estimator

    @staticmethod
    def to_db_safe(x, min_db=-120):
        """
        Convert to dB, handling zero values and setting a minimum dB threshold.

        Parameters:
        x (numpy.ndarray): Input array.
        min_db (float): Minimum decibel value.

        Returns:
        numpy.ndarray: Array in decibels.
        """
        
        db = 20 * np.log10(np.maximum(np.abs(x), 1e-6)) # Avoid log10(0)
        return np.maximum(db, min_db)

    # for local testing
    def write_stems(self):
        if self.instrumental and self.vocals:
            sf.write('out/' + self.name + '_vocals.wav', np.transpose(self.vocals), 44100)
            sf.write('out/' + self.name + '_instrumental.wav', np.transpose(self.vocals), 44100)

    def write_original(self):
        rate = 1.1
        sf.write('out/' + self.name + '_original.wav', np.transpose(np.vstack([lr.effects.time_stretch(self.data[0], rate=rate), lr.effects.time_stretch(self.data[1], rate=rate)])), 44100)