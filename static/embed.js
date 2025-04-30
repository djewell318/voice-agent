import Recorder from 'mic-recorder-to-mp3';

const API = "https://YOUR-CLOUD-RUN-URL/voice";
const Mp3Recorder = new Recorder({ bitRate: 128 });

const recBtn = document.getElementById("rec");
const replyBox = document.getElementById("reply");
const scoreBox = document.getElementById("score");

recBtn.onclick = async () => {
  recBtn.disabled = true;
  await Mp3Recorder.start();
  recBtn.textContent = "🛑 Stop";
  recBtn.onclick = stopRecording;
};

async function stopRecording() {
  const [buffer, blob] = await Mp3Recorder.stop().getMp3();
  recBtn.textContent = "Uploading…";

  const form = new FormData();
  form.append("audio", blob, "speech.mp3");
  const res = await fetch(API, { method: "POST", body: form });
  const data = await res.json();

  replyBox.textContent = "Agent: " + data.reply;
  scoreBox.textContent = "Score: " + JSON.stringify(data.score);

  // Play TTS
  const audio = new Audio(`/tts?text=${encodeURIComponent(data.reply)}`);
  audio.play();

  recBtn.textContent = "🎙️ Speak";
  recBtn.onclick = () => location.reload();  // quick-n-dirty reset
  recBtn.disabled = false;
}
