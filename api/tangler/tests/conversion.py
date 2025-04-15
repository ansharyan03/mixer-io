import tensorflow as tf
import numpy as np
import ddsp
from ddsp.synths import Harmonic
import crepe

# --- Custom Pitch Conversion Functions ---
def hz_to_midi(f):
    """Convert frequency in Hz to MIDI note numbers.
    Replace non-positive frequencies to avoid log(0)."""
    f = tf.where(f <= 0, tf.ones_like(f) * 1e-7, f)
    return 69 + 12 * tf.math.log(f / 440.0) / tf.math.log(2.0)

def midi_to_hz(m):
    """Convert MIDI note numbers back to frequency in Hz."""
    return 440 * tf.pow(2.0, (m - 69) / 12)

# --- Parameters and File Paths ---
audio_path = 'input/test.wav'
output_path = 'out/test_out.wav'
sample_rate = 44100       # Adjust as needed.
frame_rate = 250          # Typical DDSP frame rate.
n_steps = -3              # Shift down 3 semitones.
shift_factor = 2 ** (n_steps / 12)  # Factor for pitch shifting.
n_harmonics = 64          # Number of harmonics for synthesis.

# --- Load Audio ---
raw_audio = tf.io.read_file(audio_path)
audio_tensor, _ = tf.audio.decode_wav(raw_audio, desired_channels=1)
audio_tensor = tf.squeeze(audio_tensor, axis=-1)  # Shape: [n_samples]
audio_np = audio_tensor.numpy().astype(np.float32)

# --- f0 Estimation using CREPE ---
hop_length = int(sample_rate / frame_rate)
step_size_ms = (hop_length / sample_rate) * 1000
# Using CREPE with viterbi disabled to avoid hmmlearn issues.
time_vals, frequency, confidence, _ = crepe.predict(
    audio_np, sample_rate, step_size=step_size_ms, viterbi=False)
# f0 (in Hz) per frame:
f0_hz = frequency

# --- Apply Pitch Shift ---
# Multiply the estimated f0 by the shift factor (for a -3 semitone shift).
shifted_f0 = f0_hz * shift_factor
shifted_f0_tf = tf.convert_to_tensor(shifted_f0, dtype=tf.float32)

# Quantize pitch: Convert Hz -> MIDI, round to nearest semitone, and convert back.
midi = hz_to_midi(shifted_f0_tf)
quantized_midi = tf.round(midi)
quantized_f0 = midi_to_hz(quantized_midi)

# --- Amplitude Extraction ---
n_samples = audio_np.shape[0]
rms = np.array([
    np.sqrt(np.mean(audio_np[i:i+hop_length] ** 2))
    for i in range(0, n_samples, hop_length)
])
# Upsample the RMS envelope to match the number of samples.
rms_upsampled = np.repeat(rms, hop_length)[:n_samples]

# --- Synthesis with DDSP's Harmonic Synthesizer ---
# The Harmonic synthesizer expects:
#   - f0 (per frame): here we provide our quantized f0.
#   - amplitude (per sample): we provide the upsampled RMS envelope.
harmonic_synth = Harmonic(n_samples=n_samples,
                          sample_rate=sample_rate,
                          n_harmonics=n_harmonics)
synth_audio = harmonic_synth(quantized_f0, rms_upsampled)
synth_audio_np = synth_audio.numpy().astype(np.float32)

# --- Save Output Audio ---
# Ensure the output is in shape [n_samples, 1] for the WAV encoder.
synth_audio_np = np.expand_dims(synth_audio_np, axis=-1)
wav_data = tf.audio.encode_wav(synth_audio_np, sample_rate)
tf.io.write_file(output_path, wav_data)

print(f'Pitch-shifted audio saved to {output_path}')
