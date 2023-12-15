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
    this.metronomeGain = null;
    this.buildAudioGraph();
    console.log("modePlay Ready");
  }

  async start() {
    await this.resumeAudioContext();
    await this.schedulePlayback();
  }

  async resumeAudioContext() {
    if (this.ac.state === "suspended") {
      this.ac.resume();
      console.log("AudioContext resumed.");
    }
  }

  buildAudioGraph() {
    
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
    this.stepDuration = 60 / (this.beatwriter.currentBPM * 4);

    this.playbackDuration = stepsToPlay * this.stepDuration;
    let startTime = this.ac.currentTime + (16 * this.stepDuration);
    const beatTrackOffset = this.beatwriter.startMarkerPosition * this.stepDuration;
 const beatTrackNode = await this.createBeatTrack();
 this.scheduleBeatTrack(beatTrackNode, startTime, beatTrackOffset);

   if (beatTrackScheduled){
   for (let step = this.beatwriter.startMarkerPosition; step < this.beatwriter.endMarkerPosition + 1; step++) {
      const time = startTime + (step - this.beatwriter.startMarkerPosition) * this.stepDuration;

      if (step == this.beatwriter.endMarkerPosition) {
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
  }

  async scheduleOsc(node, type, gainNode, time) {
    node = this.ac.createOscillator();
    node.type = type;
    node.frequency.setValueAtTime(335, this.ac.currentTime);

    node.connect(gainNode);

    node.start(time);
    node.stop(time + this.metronomeTickDuration);

    console.log(`Scheduled ${type} oscillator at ${time}s.`);
  }


  async createBeatTrack() {
    try {
      
console.log("creating beatTrackNode")
const beatTrackNode = this.ac.createBufferSource();

      if (this.beatTrackBuffer == null) {
       "this.beatTrackBuffer id null" 

try {
    console.log("awaiting fetch response");     
   const response = await fetch(this.beatTrackName);
    console.log("setting arrayBuffer");               
     const btArrayBuffer = await
response.arrayBuffer();
          
    console.log("decoding arrayBuffer");     
this.beatTrackBuffer = await this.ac.decodeAudioData(btArrayBuffer);
        } catch (fetchError) {
          console.error('Error fetching and decoding audio data:', fetchError);


        }
      }

      console.log(this.beatTrackBuffer);



      if (this.beatTrackBuffer) {
        beatTrackNode.buffer = this.beatTrackBuffer;
        beatTrackNode.connect(this.beatTrackGain);

      }

    } catch (error) {
      console.error('Error loading beat track:', error);
    }
    return beatTrackNode;
  }

scheduleBeatTrack(node, time, offset){
    node.start(time);
    node.stop(time + this.playbackDuration, offset);
     
}

  async scheduleTts(time, textToConvert) {
    console.log(`Scheduling TTS for "${textToConvert}" at ${time}s...`);
    try {
      const trimmedText = textToConvert.trim();
      if (trimmedText != "") {
        const cachedBuffer = this.ttsCache.get(trimmedText);
        if (cachedBuffer) {
          console.log('TTS found in cache.');
          await this.playCachedTts(time, cachedBuffer);
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

  async playCachedTts(time, buffer) {
    let ttsSource = this.ac.createBufferSource();
    ttsSource.buffer = buffer;
    console.log("set the ttsSource");
    ttsSource.connect(this.ttsGain);
    ttsSource.start(time);
    ttsSource.stop(time + this.stepDuration);

    console.log(`Scheduled TTS playback at ${time}s.`);
  }

  async showCursor(step, time) {
    console.log("attempting showCursor");
    setTimeout(() => {
      this.beatwriter.cells[step].stepPlaying = true;

      if (step > 0) {
        this.beatwriter.cells[step - 1].stepPlaying = false;

        console.log('timeout teddy');
      }
      this.beatwriter.gridView.updateGrid();
    }, (time - this.ac.currentTime) * 1000);

  }


  async hideCursor(step, time) {
    console.log("attempting hideCursor");
    setTimeout(() => {
      this.beatwriter.cells[step].stepPlaying = false;
      this.beatwriter.gridView.updateGrid();

      console.log(step + ' step cursor orlf');
      this.beatwriter.mode = this.beatwriter.previousMode;
      this.beatwriter.controlPanel.updateModeDisplay();

      // Keep the vibe flowing
    }, (time - this.ac.currentTime) * 1000);
  } // Adjusted timeout based on sequencer time

  async stopSequencer() {

    this.beatwriter.mode = this.beatwriter.previousMode;
    this.beatwriter.controlPanel.updateModeDisplay();
  }

  updateGain(gain, gainValue) {
    gainValue = gainValue;
    gain.gain.setValueAtTime(gainValue, this.ac.currentTime);
    console.log(gain + "set to " + gainValue);
  }
}

console.log("modePlay.js loaded");