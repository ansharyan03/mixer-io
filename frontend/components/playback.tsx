"use client";
import React, { useRef, useState, useEffect } from "react";
import WaveSurferPlayer from "@wavesurfer/react";
import { IconButton, Box, Card } from "@mui/material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";

type Props = {
  audioBuffer: Uint8Array;
};

export default function WaveformPlayer({ audioBuffer }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const wavesurferRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Convert buffer into blob URL
  useEffect(() => {
    if (!audioBuffer) return;
    const blob = new Blob([audioBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [audioBuffer]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying((prev) => !prev);
    }
  };

  const handleRestart = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
      setIsPlaying(false);
    }
  };

  return (
    <Card sx={{ p: 2, width: 600 }}>
      {audioUrl && (
        <WaveSurferPlayer
          height={80}
          waveColor="#d1d1d1"
          progressColor="#3f51b5"
          url={audioUrl}
          onReady={(ws) => (wavesurferRef.current = ws)}
        />
      )}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
        <IconButton onClick={handleRestart}>
          <RestartAltRounded />
        </IconButton>
        <IconButton onClick={togglePlay}>
          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
        </IconButton>
      </Box>
    </Card>
  );
}
