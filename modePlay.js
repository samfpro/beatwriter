class ModePlay {
  constructor(beatwriter) {
    console.log('Initializing ModePlay...');
    this.beatwriter = beatwriter;
    this.scheduledEvents = [];
    this.playbackDuration = 0;
    this.ttsSpeakingRate = 3;
    this.ttsSpeakingVoice = 2;
    this.lastSyllableIndex = 0;
    this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
    console.log(this.audioContext.state);
    this.audioGraphBuilt = false;
    this.sineGain = null;
    this.sawGain = null;
    this.ttsGain = null;
    this.beatTrackGain = null;
    this.sineOsc = null;
    this.sawOsc = null;
    this.clickDuration = 0.01;
    this.sineNoteInterval = 4;
    this.sawNoteInterval = 8;
    this.beatTrackFileName = 'Turtletuck_83BPM.wav';
    this.ttsCache = new Map();
    console.log('ModePlay initialized.');
    this.stepInterval = 0;
  }

  createOscillator(oscType, frequency) {
    console.log(`Creating ${oscType} oscillator with frequency ${frequency}...`);
    try {
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = oscType;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      return oscillator;
    } catch (error) {
      console.error('Error in createOscillator:', error);
    }
  }

  resumeAudioContext() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('AudioContext resumed successfully.');
      }).catch((err) => {
        console.error('Failed to resume AudioContext:', err);
      });
    }
    if (!this.audioGraphBuilt) {
      this.sineGain = this.createGainNode();
      this.sawGain = this.createGainNode();
      this.ttsGain = this.createGainNode();
      this.beatTrackGain = this.createGainNode();
      this.sineGain.connect(this.audioContext.destination);
      this.sawGain.connect(this.audioContext.destination);
      this.ttsGain.connect(this.audioContext.destination);
      this.beatTrackGain.connect(this.audioContext.destination);
      this.sineGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.sawGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.ttsGain.gain.setValueAtTime(1, this.audioContext.currentTime);
      this.beatTrackGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      this.audioGraphBuilt = true;
    }
  }


  createGainNode() {
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    return gainNode;
  }

  schedulePlayback() {
    console.log('Scheduling playback...');
    const cellsArray = this.beatwriter.cells;
    this.stepInterval = (60 / this.beatwriter.currentBPM) / 4;
    const startTime = this.audioContext.currentTime + (this.stepInterval * 8);
    this.clickDuration = this.stepInterval / 8;
    this.playbackDurationInTicks = this.beatwriter.endMarkerPosition - this.beatwriter.startMarkerPosition;
    this.playbackDuration = (this.playbackDurationInTicks * this.stepInterval) + (this.stepInterval * 8);
    let firstRun = true;
    for (let step = this.beatwriter.startMarkerPosition; step < this.beatwriter.endMarkerPosition; step++) {
      const time = startTime + ((step - this.beatwriter.startMarkerPosition) * this.stepInterval);

      if (firstRun) {
        this.scheduleBeatTrack(time);
        this.scheduleOscillators(time);
        firstRun = false;
      }

      if ((step + 4) % this.sineNoteInterval === 0) {
        this.scheduleGain(this.sineGain, 0.75, 0, time, this.clickDuration);
      }

      if ((step + 4) % this.sawNoteInterval === 0) {
        this.scheduleGain(this.sawGain, 0.75, 0, time, this.clickDuration);
      }

      if (cellsArray[step].syllable) {
        this.scheduleTts(time, cellsArray[step].syllable, this.ttsSpeakingRate);
      }

      console.log('Scheduled Time:', time * 1000);
      console.log('Current Time:', this.audioContext.currentTime * 1000);

      const calculatedTimeout = (time * 1000) - this.audioContext.currentTime * 1000;
      console.log('Calculated Timeout:', calculatedTimeout);

      (() => {
        setTimeout(() => this.showBeatCursor(step), (time * 1000) - this.audioContext.currentTime * 1000);
      })();
    }



    setTimeout(() => {

      this.stopSequencer();
      console.log('Sequencer stopped.');
    }, this.playbackDuration * 1000);
    console.log('Playback scheduled.');
  }

scheduleBeatTrack(time) {
  console.log('Scheduling beat track...');
  const audioFile = this.beatTrackFileName;

  fetch(audioFile)
    .then(response => response.arrayBuffer())
    .then(data => this.audioContext.decodeAudioData(data))
    .then(buffer => {
      const beatTrackSource = this.audioContext.createBufferSource();
      beatTrackSource.buffer = buffer;
      beatTrackSource.connect(this.beatTrackGain);

const trackOffset = this.beatwriter.startMarkerPosition * this.stepInterval;
beatTrackSource.start(time, trackOffset);
      beatTrackSource.stop(time + this.playbackDuration);
    })
    .catch(error => console.error('Error loading audio file:', error));
  console.log('Beat track scheduled.');
}

  scheduleOscillators(time) {
    this.sineOsc = this.createOscillator("sine", 430);
    this.sawOsc = this.createOscillator("sawtooth", 430);
    this.sineOsc.connect(this.sineGain);
    this.sawOsc.connect(this.sawGain);
    this.sineOsc.start(time);
    this.sawOsc.start(time);
    this.sineOsc.stop(time + this.playbackDuration);
    this.sawOsc.stop(time + this.playbackDuration);


  }

  async scheduleTts(time, textToConvert, ttsSpeakingRate) {
    console.log(`Scheduling TTS for "${textToConvert}"...`);
    try {
      const trimmedText = textToConvert.trim();
      if (trimmedText !== "") {
        if (this.ttsCache.has(trimmedText)) {
          console.log('TTS found in cache.');
          const cachedBuffer = this.ttsCache.get(trimmedText);
          this.playCachedTts(time, cachedBuffer);
        } else {
          console.log('TTS not found in cache. Requesting TTS conversion...');
          const audioBlob = await textToAudioBlob(trimmedText, ttsSpeakingRate);
          console.log(`TTS conversion successful for "${trimmedText}". Decoding audio data...`);
          const ttsArrayBuffer = await audioBlob.arrayBuffer();
          this.audioContext.decodeAudioData(ttsArrayBuffer, (buffer) => {
            console.log('Decoding successful. Caching TTS data...');
            this.ttsCache.set(trimmedText, buffer);
            this.playCachedTts(time, buffer);
          });
        }
      } else {
        console.log('Skipping TTS scheduling for blank syllable.');
      }
    } catch (error) {
      console.error('Error in scheduleTTS:', error);
    }
    console.log('TTS scheduled.');
  }

  playCachedTts(time, buffer) {
    const ttsSource = this.audioContext.createBufferSource();
    ttsSource.buffer = buffer;
    ttsSource.connect(this.ttsGain);
    ttsSource.start(time);
    ttsSource.stop(time + this.stepInterval);
  }

  scheduleGain(gainNode, val1, val2, time, noteOnTime) {
    gainNode.gain.setValueAtTime(val1, time);
    gainNode.gain.setValueAtTime(0, time + noteOnTime);
  }

  stopSequencer() {
    console.log('Stopping sequencer...');
    this.beatwriter.setCellsPlayable();
    this.beatwriter.mode = this.previousMode;
    this.beatwriter.updateModeDisplay();
    console.log('Sequencer stopped.');
    console.log('audioContext state: ' + this.audioContext.state);
  }

  start() {
    console.log('Starting ModePlay...');
    this.previousMode = this.beatwriter.mode;
    this.beatwriter.mode = 'play';
    this.beatwriter.updateModeDisplay();
    this.resumeAudioContext();
    this.schedulePlayback();
    console.log('ModePlay started.');
  }

  showBeatCursor(step) {
    console.log("showBeatCursor called for step:", step);

    this.beatwriter.cells[step].isPlayable = false;
    console.log("playing step: " + step + "at audioContext time:" + this.audioContext.currentTime);

    this.beatwriter.cells[step].stepPlaying = true;

    if (step > 0) {
      this.beatwriter.cells[step - 1].stepPlaying = false;
      this.beatwriter.cells[step - 1].isPlayable = true;
    }
    if (step == this.beatwriter.endMarkerPosition-1) {
      beatwriter.cells[step].stepPlaying = false;
    }
    this.beatwriter.gridView.updateGrid();

  }
}


console.log("modePlay.js loaded.");