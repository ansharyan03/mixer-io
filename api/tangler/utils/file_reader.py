import requests
from pydub import AudioSegment
import numpy as np
import io

def read_tunnel(url: str, format: str):
    response = requests.get(url)
    response.raise_for_status()
    # test = response.content
    # print(test)
    audio = AudioSegment.from_file(io.BytesIO(response.content), format=format)
    samples = np.array(audio.get_array_of_samples(), dtype=np.int16).astype(np.float32) / 32768.0
    print(np.mean(samples))
    sample_rate = audio.frame_rate
    if audio.channels == 2:
        samples = samples.reshape((-1, 2))
    return samples, sample_rate

# read_tunnel('http://localhost:9000'

