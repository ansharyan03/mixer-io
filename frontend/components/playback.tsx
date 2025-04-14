"use client";
import React, { useRef, useState, useEffect } from "react";
import { Card, IconButton, Box, Slider } from "@mui/material";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";

export default function PlaybackWidget() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(120); 

  // Simulate audio playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            clearInterval(intervalRef.current!);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSliderChange = (_: Event, value: number | number[]) => {
    const newTime = typeof value === "number" ? value : value[0];
    setCurrentTime(newTime);
  };

  return (
    <Card sx={{ display: "flex", alignItems: "center", p: 2, width: 400 }}>
      <Box sx={{ width: "100%" }}>
        <Slider
          size="small"
          value={currentTime}
          max={duration}
          onChange={handleSliderChange}
        />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <IconButton onClick={handleRestart}>
            <RestartAltRounded />
          </IconButton>
          <IconButton onClick={handlePlayPause}>
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
