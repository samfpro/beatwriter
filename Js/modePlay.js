class ModePlay {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.ac = beatwriter.ac;
    this.ttsSpeakingRate = 3;
    this.playbackDuration = 0;
    this.stepDuration = 0;
    this.resumeAudioContext();
    this.sineNodes = Array.from({ length: 256 }, () => null);
    this.sawNodes = Array.from({ length: 256 }, () => null);
    this.ttsNodes = Array.from({ length: 256 }, () => null);
    this.beatTrackBuffer = null;
    this.ttsCache = new Map();
    this.metronomeTickDuration = 0.05; // Just enough for that tick sound.
    this.sineGain = null;
    this.sawGain = null;
    this.ttsGain = null;
    this.beatTrackGain = null;
    this.masterGain = null;
    this.metronomeGain = null;
    this.recording = false;
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.scheduledNodes = []; // Array to keep track of scheduled nodes
    this.cursorTimeouts = []; // Array to keep track of cursor update timeouts
    this.buildAudioGraph();
    console.log("modePlay Ready");
  }

  async start() {
    await this.resumeAudioContext();
    await this.schedulePlayback();
  }

  async resumeAudioContext() {
    if (this.ac.state === "suspended") {
      await this.ac.resume();
      console.log("AudioContext resumed.");
    }
  }

  async buildAudioGraph() {
    console.log("creating gains");

    this.metronomeGain = this.ac.createGain();
    this.sineGain = this.ac.createGain();
    this.sawGain = this.ac.createGain();
    this.ttsGain = this.ac.createGain();
    this.beatTrackGain = this.ac.createGain();
    this.masterGain = this.ac.createGain();
    console.log(this.ac);

    console.log("connecting graph");

    this.sineGain.connect(this.metronomeGain);
    this.sawGain.connect(this.metronomeGain);
    this.metronomeGain.connect(this.masterGain);
    this.ttsGain.connect(this.masterGain);
    this.beatTrackGain.connect(this.masterGain);
    this.masterGain.connect(this.ac.destination);

    this.metronomeGain.gain.setValueAtTime(0.5, this.ac.currentTime);
    this.ttsGain.gain.setValueAtTime(1, this.ac.currentTime);
    this.beatTrackGain.gain.setValueAtTime(0.5, this.ac.currentTime);
    this.masterGain.gain.setValueAtTime(1, this.ac.currentTime);
  }

async schedulePlayback() {
  console.log("scheduling playback");

  const stepsToPlay = this.beatwriter.endMarkerPosition - this.beatwriter.startMarkerPosition;
  console.log("the number of steps to play is: " + stepsToPlay);

  this.stepDuration = 60 / (this.beatwriter.bpm.currentValue * 4);
  this.playbackDuration = stepsToPlay * this.stepDuration;

  let startTime = this.ac.currentTime + (16 * this.stepDuration);
  console.log("this.beatwriter.startMarkerPosition:" + typeof this.beatwriter.startMarkerPosition + this.beatwriter.startMarkerPosition);
  console.log("this.beatwriter.beatTrackLeadInBars.currentValue:" + typeof this.beatwriter.beatTrackLeadInBars.currentValue + this.beatwriter.beatTrackLeadInBars.currentValue);
  console.log("this.beatwriter.beatTrackOffsetMS.currentValue:" + typeof this.beatwriter.beatTrackOffsetMS.currentValue + this.beatwriter.beatTrackOffsetMS.currentValue);
  console.log("this.stepDuration:" + typeof this.stepDuration + this.stepDuration);

  let beatTrackOffsetS = 0;

  if (this.beatwriter.startMarkerPosition !== 0 || this.beatwriter.beatTrackLeadInBars.currentValue !== 0) {
    beatTrackOffsetS = (this.beatwriter.startMarkerPosition + (this.beatwriter.beatTrackLeadInBars.currentValue * 16)) * this.stepDuration;
  }

  if (this.beatwriter.beatTrackOffsetMS.currentValue !== 0) {
    beatTrackOffsetS += this.beatwriter.beatTrackOffsetMS.currentValue / 1000;
  }

  console.log(beatTrackOffsetS);

  let beatTrackStartTime = startTime;

  if (this.beatwriter.startMarkerPosition === 0 && this.beatwriter.beatTrackLeadInBars.currentValue === 0) {
    beatTrackStartTime = startTime;  // No additional delay if starting from the very beginning
  }

  const beatTrackNode = await this.createBeatTrack();
  console.log("beatTrackNode returned!! attempting to schedule");
  await this.scheduleBeatTrack(beatTrackNode, beatTrackStartTime, beatTrackOffsetS);

  for (let step = this.beatwriter.startMarkerPosition; step < this.beatwriter.endMarkerPosition + 1; step++) {
    const time = startTime + (step - this.beatwriter.startMarkerPosition) * this.stepDuration;

    if (step === this.beatwriter.endMarkerPosition) {
      this.hideCursor(step - 1, time);
      return;
    }

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


  async scheduleOsc(node, type, gainNode, time) {
    node = this.ac.createOscillator();
    node.type = type;
    node.frequency.setValueAtTime(335, this.ac.currentTime);

    node.connect(gainNode);

    node.start(time);
    node.stop(time + this.metronomeTickDuration);

    this.scheduledNodes.push(node); // Keep track of the node
    console.log(`Scheduled ${type} oscillator at ${time}s.`);
  }

  async createBeatTrack() {
    try {
      console.log("creating beatTrackNode");
      let beatTrackNode = this.ac.createBufferSource();

      if (this.beatTrackBuffer == null) {
        console.log("this.beatTrackBuffer is null");
        try {
          console.log("awaiting fetch response");
          const response = await fetch(this.beatwriter.beatTrack.fileUrl);
          console.log(response);
          console.log("setting arrayBuffer");
          const btArrayBuffer = await response.arrayBuffer();

          console.log("decoding arrayBuffer");
          this.beatTrackBuffer = await this.ac.decodeAudioData(btArrayBuffer);
        } catch (fetchError) {
          console.error('Error fetching and decoding audio data:' + fetchError);
        }
      }

      console.log(this.beatTrackBuffer);

      if (this.beatTrackBuffer != null) {
        console.log("ok the buffer no nullman");
        beatTrackNode.buffer = this.beatTrackBuffer;
        beatTrackNode.connect(this.beatTrackGain);
        console.log("beatTrackNode is connected to this.beatTrackGain");
      }
      return beatTrackNode;
    } catch (error) {
      console.error('Error loading beat track:' + error);
    }
  }

  async scheduleBeatTrack(node, time, offset) {
    console.log("scheduling....and the node is " + node + "and the time is " + time + "and the offset is " + offset);
    node.start(time, offset);
    node.stop(time + this.playbackDuration, offset);
    this.scheduledNodes.push(node); // Keep track of the node
    console.log("scheduled beatTrack start at " + time + " with offset: " + offset);
  }

  async scheduleTts(time, textToConvert) {
    console.log(`Scheduling TTS for "${textToConvert}" at ${time}s...`);
    try {
      const trimmedText = textToConvert.trim();
      if (trimmedText != "") {
        // Check if the voice has changed
        if (this.beatwriter.ttsVoice.currentValue !== this.currentTtsVoice) {
          console.log('TTS voice has changed. Clearing cache.');
          this.ttsCache.clear();
          this.currentTtsVoice = this.beatwriter.ttsVoice.currentValue;
        }

        const cachedBuffer = this.ttsCache.get(trimmedText);
        if (cachedBuffer) {
          console.log('TTS found in cache.');
          await this.playCachedTts(time, cachedBuffer);
        } else {
          console.log('TTS not found in cache. Requesting TTS conversion...');
          const audioBlob = await textToAudioBlob(trimmedText, this.ttsSpeakingRate, this.beatwriter.ttsVoice.currentValue);
          const ttsArrayBuffer = await audioBlob.arrayBuffer();
          this.ac.decodeAudioData(ttsArrayBuffer, (buffer) => {
            console.log('Decoding successful. Caching TTS data...');
            this.ttsCache.set(trimmedText, buffer);
            this.playCachedTts(time, buffer);
          });
        }
      } else {
        console.log('Skipping TTS scheduling for a blank syllable.');
      }
    } catch (error) {
      console.error('Error in scheduleTTS:' + error);
    }
    console.log('TTS scheduled.');
  }

  async playCachedTts(time, buffer) {
    let ttsSource = this.ac.createBufferSource();
    ttsSource.buffer = buffer;
    console.log("set the ttsSource");
    ttsSource.connect(this.ttsGain);
    ttsSource.start(time);
    ttsSource.stop(time + (this.stepDuration * 4));
    this.scheduledNodes.push(ttsSource); // Keep track of the node
    console.log(`Scheduled TTS playback at ${time}s.`);
  }

  async showCursor(step, time) {
    console.log("attempting showCursor");
    const timeoutId = setTimeout(() => {
      this.beatwriter.cells[step].stepPlaying = true;

      if (step > 0) {
        this.beatwriter.cells[step - 1].stepPlaying = false;
        console.log('timeout teddy');
      }
      this.beatwriter.gridView.updateGrid();
    }, (time - this.ac.currentTime) * 1000);
    this.cursorTimeouts.push(timeoutId); // Keep track of the timeout
  }

  async hideCursor(step, time) {
    console.log("attempting hideCursor");
    const timeoutId = setTimeout(() => {
      this.beatwriter.cells[step].stepPlaying = false;
      this.beatwriter.gridView.updateGrid();

      console.log(step + ' step cursor off');
      this.beatwriter.mode = this.beatwriter.previousMode;
      this.beatwriter.controlPanel.updateModeDisplay();
    }, (time - this.ac.currentTime) * 1000);
    this.cursorTimeouts.push(timeoutId); // Keep track of the timeout
  } // Adjusted timeout based on sequencer time

  async stopSequencer() {
    console.log("Stopping sequencer...");
    // Stop all scheduled nodes
    this.scheduledNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        console.error("Error stopping node: " + e);
      }
    });
    this.scheduledNodes = []; // Clear the array

    // Clear cursor timeouts
    this.cursorTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.cursorTimeouts = []; // Clear the array

    // Reset cursor position
    this.beatwriter.cells.forEach(cell => cell.stepPlaying = false);

    this.beatwriter.gridView.updateGrid();

    // Reset the mode
    this.beatwriter.mode = this.beatwriter.previousMode;
    this.beatwriter.previousMode = this.beatwriter.mode;
    this.beatwriter.controlPanel.updateModeDisplay();
    console.log("Sequencer stopped and cursor reset.");
  }

  updateGain(gain, gainValue) {
    gainValue = gainValue;
    gain.gain.setValueAtTime(gainValue, this.ac.currentTime);
    console.log(gain + " set to " + gainValue);
  }

  startRecording() {
    try {
      this.recordedChunks = [];
      const stream = this.beatwriter.ac.destination.stream;
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.start();
      this.recording = true;
      console.log('Recording started...');
    } catch (error) {
      console.error('Error starting recording:' + error);
    }
  }

  stopRecording() {
    try {
      this.mediaRecorder.stop();
      this.recording = false;
      console.log('Recording stopped...');
      this.exportWav();
    } catch (error) {
      console.error('Error stopping recording:' + error);
    }
  }

  async exportWav() {
    try {
      const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recorded_audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Recording exported as WAV file.');
    } catch (error) {
      console.error('Error exporting WAV file:' + error);
    }
  }

  setSineGain(value) {
    this.updateGain(this.sineGain, value);
  }

  setSawGain(value) {
    this.updateGain(this.sawGain, value);
  }

  setTtsGain(value) {
    this.updateGain(this.ttsGain, value);
  }

  setBeatTrackGain(value) {
    this.updateGain(this.beatTrackGain, value);
  }

  setMasterGain(value) {
    this.updateGain(this.masterGain, value);
  }
}

async function textToAudioBlob(text, rate, voice) {
  // Placeholder for the actual text-to-speech API call
  // This function should return a Blob containing the audio data
  // Example:
  // return new Blob([audioData], { type: 'audio/wav' });
}

// Assuming that beatwriter is defined somewhere in your code
const modePlay = new ModePlay(beatwriter);

// Example usage:
// modePlay.start();
// modePlay.stopSequencer();