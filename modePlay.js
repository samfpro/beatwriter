class ModePlay {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.ac = new AudioContext();
    this.ttsSpeakingRate = 3;
    this.ttsSpeakingVoice = 1;

    this.beatTrackName = "Turtletuck_83BPM.wav";
    this.playbackDuration = 0;
    this.stepDuration = 0;
    this.resumeAudioContext();
    this.sineNodes = Array.from({
      length: 256
    }, () => null);
    this.sawNodes = Array.from({
      length: 256
    }, () => null);
    this.ttsNodes = Array.from({
      length: 256
    }, () => null);
    this.beatTrackBuffer = null;
    this.ttsCache = new Map();
    this.metronomeTickDuration = 0.05; // Just enough for that tick sound.
    this.sineGain = null;
    this.sawGain = null;
    this.ttsGain = null;
    this.beatTrackGain = null;
    this.masterGain = null;
    this.buildAudioGraph();
    console.log("modePlayReady");
  }

  start() {
    this.resumeAudioContext();
    this.schedulePlayback();
  }

  resumeAudioContext() {
    if (this.ac.state === "suspended") {
      this.ac.resume();
      console.log("AudioContext resumed.");
    }
  }

  buildAudioGraph() {
    this.sineGain = this.ac.createGain();
    this.sawGain = this.ac.createGain();
    this.ttsGain = this.ac.createGain();
    this.beatTrackGain = this.ac.createGain();
    this.masterGain = this.ac.createGain();

    this.sineGain.connect(this.masterGain);
    this.sawGain.connect(this.masterGain);
    this.ttsGain.connect(this.masterGain);
    this.beatTrackGain.connect(this.masterGain);

this.masterGain.connect(this.ac.destination);
    this.sineGain.gain.setValueAtTime(0.5, this.ac.currentTime);
    this.sawGain.gain.setValueAtTime(0.5, this.ac.currentTime);
    this.ttsGain.gain.setValueAtTime(1, this.ac.currentTime);
    this.beatTrackGain.gain.setValueAtTime(0.5, this.ac.currentTime);

this.masterGain.gain.setValueAtTime(1, this.ac.currentTime);

}

  schedulePlayback() {
  const stepsToPlay = this.beatwriter.endMarkerPosition - this.beatwriter.startMarkerPosition;
  this.stepDuration = 60 / (this.beatwriter.currentBPM * 4);

  this.playbackDuration = stepsToPlay * this.stepDuration;
  const startTime = this.ac.currentTime + (8 * this.stepDuration);
  const beatTrackOffset = this.beatwriter.startMarkerPosition * this.stepDuration;

  this.scheduleBeatTrack(startTime, beatTrackOffset);  // Schedule beat track first

  for (let step = this.beatwriter.startMarkerPosition; step < this.beatwriter.endMarkerPosition; step++) {
    const time = startTime + (step - this.beatwriter.startMarkerPosition) * this.stepDuration;

    if (this.beatwriter.metronomeOn) {
      if ((step + 2) % 2 === 0) {
        this.scheduleOsc(this.sineNodes[step], "sine", this.sineGain, time);
      }

      if ((step + 4) % 8 === 0) {
        this.scheduleOsc(this.sawNodes[step], "saw", this.sawGain, time);
      }
    }

    if (this.beatwriter.cells[step].syllable !== "") {
      this.scheduleTts(time, this.beatwriter.cells[step].syllable);
    }

    this.showCursor(step, time);
  }
}

  scheduleOsc(node, type, gainNode, time) {
    node = this.ac.createOscillator();
    node.type = type;
    node.frequency.setValueAtTime(335, this.ac.currentTime);

    node.connect(gainNode);

    node.start(time);
    node.stop(time + this.metronomeTickDuration);

    console.log(`Scheduled ${type} oscillator at ${time}s.`);
  }


async scheduleBeatTrack(time, offset) {
  try {
    const beatTrackNode = this.ac.createBufferSource();

    if (this.beatTrackBuffer === null) {
      console.log("Loading the beatTrack...");

      // Check if the buffer already exists before making the XML request
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.beatTrackName, true);
      xhr.responseType = "arraybuffer";

      xhr.onload = async () => {
        const data = xhr.response;
        this.beatTrackBuffer = await this.ac.decodeAudioData(data);

        beatTrackNode.buffer = this.beatTrackBuffer;
        beatTrackNode.connect(this.beatTrackGain);
        beatTrackNode.start(time, offset);
        beatTrackNode.stop(time + this.playbackDuration);
        console.log(`Scheduled beat track starting at ${time}s with offset ${offset}s.`);
      };

      xhr.onerror = (error) => {
        console.error('Error loading beat track:', error);
      };

      xhr.send();
    } else {
      // Use the existing buffer without making the request
      beatTrackNode.buffer = this.beatTrackBuffer;
      beatTrackNode.connect(this.beatTrackGain);
      beatTrackNode.start(time, offset);
      beatTrackNode.stop(time + this.playbackDuration);
      console.log(`Scheduled beat track starting at ${time}s with offset ${offset}s using existing buffer.`);
    }
  } catch (error) {
    console.error('Error loading beat track:', error);
  }
}

  async scheduleTts(time, textToConvert) {
    console.log(`Scheduling TTS for "${textToConvert}" at ${time}s...`);
    try {
      const trimmedText = textToConvert.trim();
      if (trimmedText !== "") {
        const cachedBuffer = this.ttsCache.get(trimmedText);
        if (cachedBuffer) {
          console.log('TTS found in cache.');
          this.playCachedTts(time, cachedBuffer);
        } else {
          console.log('TTS not found in cache. Requesting TTS conversion...');
          const audioBlob = await textToAudioBlob(trimmedText, this.ttsSpeakingRate);
          const ttsArrayBuffer = await audioBlob.arrayBuffer();
          this.ac.decodeAudioData(ttsArrayBuffer, (buffer) => {
            console.log('Decoding successful. Caching TTS data...');
            this.ttsCache.set(trimmedText, buffer);
            console.log("set the ttsCache");
            this.playCachedTts(time, buffer);
          });
        }
      } else {
        console.log('Skipping TTS scheduling for a blank syllable.');
      }
    } catch (error) {
      console.error('Error in scheduleTTS:', error);
    }
    console.log('TTS scheduled.');
  }

  playCachedTts(time, buffer) {
    const ttsSource = this.ac.createBufferSource();
    ttsSource.buffer = buffer;
    console.log("set the ttsSource");
    ttsSource.connect(this.ttsGain);
    ttsSource.start(time);
    ttsSource.stop(time + this.stepDuration);

    console.log(`Scheduled TTS playback at ${time}s.`);
  }

  showCursor(step, time) {
  
  console.log("attempting showCursor");
  setTimeout(() => {
    this.beatwriter.cells[step].stepPlaying = true;

    if (step > 0) {
      this.beatwriter.cells[step - 1].stepPlaying = false;

console.log ('timeout teddy');
    }

    this.beatwriter.gridView.updateGrid(); // Keep the vibe flowing
  }, (time - this.ac.currentTime) * 1000); // Adjusted timeout based on sequencer time
}
  
  stopSequencer() {

    this.beatwriter.mode = this.beatwriter.previousMode;
    this.beatwriter.controlPanel.updateModeDisplay();

  }

updateGain(gain, gainValue) {
gainValue = gainValue/100;    gain.gain.setValueAtTime(gainValue, this.ac.currentTime);
   console.log(gain + "set to " + gainValue);
  }
}

console.log("modePlay.js loaded");