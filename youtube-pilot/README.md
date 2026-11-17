# YouTube pilot: "How Your Credit Score Really Works"

Free pipeline, no paid tools:

1. `script.json` — scenes and narration lines.
2. `tts.py` — English voiceover with Kokoro TTS (open source). Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from github.com/thewh1teagle/kokoro-onnx releases into `tts/`, then `pip install kokoro-onnx soundfile` and run `python3 tts.py <this folder>`. Writes `video/public/voice.wav` and `video/src/timeline.json` (subtitle timings).
3. `video/` — Remotion project (animated infographics, subtitles, thumbnail).
   - `npm i remotion@4.0.300 @remotion/cli@4.0.300 react@18.3.1 react-dom@18.3.1`
   - `npx remotion render src/index.ts Main out/video.mp4`
   - `npx remotion still src/index.ts Thumb out/thumbnail.png`
4. Loudness: `ffmpeg -i out/video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac final.mp4`
5. `youtube-upload.md` — title, description, chapters, tags.
