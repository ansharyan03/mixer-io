import demucs.api
import librosa as lr
import numpy as np
import IPython.display as ipd
import torch
import soundfile as sf
import pydub

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
        self.vocals = None
        self.instrumental = None

    def split(self):
        separator = demucs.api.Separator()
        print('started separation')
        print(self.data.shape)
        # self.instrumental = self.data
        # self.vocals = self.data
        origin, splits = separator.separate_tensor(torch.from_numpy(self.data), self.sr) # split with Demucs model
        self.instrumental = (splits["drums"] + splits["bass"] + splits["other"]).numpy()
        self.vocals = (splits["vocals"]).numpy()

    def mix(self, other: 'AudioWrapper'):
        # find energy in each band of vocals and instrumental. apply filters/EQ/whatever
        pass
    
    def playback(self):
        return self.instrumental + self.vocals
        
    def load_audio(path: str):
        print('start loading')
        dur = pydub.utils.mediainfo(path)["duration"]
        data, sr = lr.load(path, sr=44100, duration=np.floor(float(dur)), mono=False)
        print('finish loading')
        return data, sr

    def write_stems(self):
        if self.instrumental and self.vocals:
            sf.write('out/' + self.name + '_vocals.wav', np.transpose(self.vocals), 44100)
            sf.write('out/' + self.name + '_instrumental.wav', np.transpose(self.vocals), 44100)

# test = AudioWrapper(path='input/olympian.mp3')
# test.split()
# sf.write('out/vocals.wav', np.transpose(test.vocals), 44100)
# sf.write('out/instrumental.wav', np.transpose(test.instrumental), 44100)
# print(type(vocals))
# ipd.Audio(instrumental, rate=44100)
# ipd.Audio(vocals, rate=44100)
