// src/app/api/youtube/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { Readable } from 'stream';
import fs from 'fs';
//import path from 'path';

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
  }

  const outputPath = '/tmp/audio.wav';

  return new Promise((resolve) => {
    const cmd = `yt-dlp -f bestaudio -x --audio-format wav -o ${outputPath} "${videoUrl}"`;

    exec(cmd, async (err) => {
      if (err) {
        console.error(err);
        return resolve(NextResponse.json({ error: 'Download failed' }, { status: 500 }));
      }

      const stream = fs.createReadStream(outputPath);
      const wavBuffer = await streamToBuffer(stream);

      resolve(
        new NextResponse(wavBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'attachment; filename="audio.wav"',
          },
        })
      );
    });
  });
}
