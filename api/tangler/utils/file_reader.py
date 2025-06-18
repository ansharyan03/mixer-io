import requests
from pydub import AudioSegment
import numpy as np
import io

def download_range(url, start, end):
    headers = {'Range': f'bytes={start}-{end}'}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.content

def download_fragmented_mp4_audio(url, init_start, init_end, total_size, chunk_size=1024 * 1024):
    # Step 1: Download init segment
    init_segment = download_range(url, int(init_start), int(init_end))
    
    # Step 2: Download media chunks
    media_start = int(init_end) + 1
    media_end = int(total_size) - 1
    chunks = [init_segment]
    
    for start in range(media_start, media_end + 1, chunk_size):
        end = min(start + chunk_size - 1, media_end)
        chunk = download_range(url, start, end)
        chunks.append(chunk)
        print(f"Downloaded media bytes {start}-{end}")
    
    return b''.join(chunks)

def read_fragmented_audio(url_info):
    url = url_info['url']
    init_range = url_info['initRange']
    total_size = int(url_info['contentLength'])
    
    # Download and decode
    audio_data = download_fragmented_mp4_audio(
        url,
        init_range['start'],
        init_range['end'],
        total_size
    )
    
    audio = AudioSegment.from_file(io.BytesIO(audio_data), format="mp4")
    samples = np.array(audio.get_array_of_samples(), dtype=np.int16).astype(np.float32) / 32768.0
    sample_rate = audio.frame_rate
    
    if audio.channels == 2:
        samples = samples.reshape((-1, 2))
    
    print(f"Audio mean level: {np.mean(samples)}")
    return samples, sample_rate

def get_adaptive_formats(data):
    data_obj = None
    formats = data['streamingData']['adaptiveFormats']
    for format in formats:
        if format['mimeType'].split(';')[0] == 'audio/mp4':
            print(format)
            data_obj = format
            return data_obj

def read_tunnel(url: str):
    # separate into:
    # get video ID from URL
    # form request body with API key
    # post to API
    # response handling
    video_id = url.split('v=')[-1]

    headers = {"Content-Type": "application/json", "Authorization": "Bearer " + os.getenv('API_KEY')}
    body = {"videoId": video_id}
    response = requests.post(url=url, json=body, headers=headers, timeout=None)
    response.raise_for_status()
    # test = response.content
    # print(test)
    data = response.json()
    data_obj = get_adaptive_formats(data)
    samples, sr = read_fragmented_audio(data_obj)
    if samples.ndim == 2:
        samples = samples.reshape((-1, 2))
    return samples, sr

# read_tunnel('http://localhost:9000'

