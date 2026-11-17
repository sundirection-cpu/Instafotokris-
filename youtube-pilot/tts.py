import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
S = sys.argv[1]
k = Kokoro(f"{S}/tts/kokoro-v1.0.onnx", f"{S}/tts/voices-v1.0.bin")
script = json.load(open(f"{S}/script.json"))
SR = 24000
gap_line = np.zeros(int(0.30*SR), dtype=np.float32)
gap_scene = np.zeros(int(0.6*SR), dtype=np.float32)
out, timeline, t = [], [], 0.0
for sc in script:
    start = t; subs = []
    for line in sc["lines"]:
        a, sr = k.create(line, voice="af_heart", speed=1.0, lang="en-us")
        a = a.astype(np.float32)
        subs.append({"text": line.replace("annual credit report dot com", "annualcreditreport.com"), "start": round(t-start,3), "end": round(t-start+len(a)/SR,3)})
        out += [a, gap_line]; t += (len(a)+len(gap_line))/SR
    out.append(gap_scene); t += len(gap_scene)/SR
    timeline.append({"id": sc["id"], "start": round(start,3), "duration": round(t-start,3), "subs": subs})
audio = np.concatenate(out)
sf.write(f"{S}/video/public/voice.wav", audio, SR)
json.dump(timeline, open(f"{S}/video/src/timeline.json","w"), indent=1)
print("total sec", round(t,1)); [print(x["id"], x["duration"]) for x in timeline]
