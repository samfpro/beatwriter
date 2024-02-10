class WaveFormView {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.canvas = document.getElementById('beat-track-wave-view');
    this.ctx = this.canvas.getContext('2d');
    this.audioDurationInSeconds = 0; // Initialize audio duration

    // Draw waveform upon instantiation
    this.drawWaveForm(this.beatwriter.modePlay.beatTrackName)
      .then(() => {
        console.log("Waveform drawn");
        this.updateWaveFormWindow();
      })
      .catch(error => console.error('Error drawing waveform:', error));
  }

  updateWaveFormWindow() {
    console.log("Updating waveform window");

    const bpm = this.beatwriter.bpm.currentValue;
    const barsToDisplay = 18; // Number of bars to display
    const secondsPerBar = 240 / bpm;
    const timeFor18Bars = secondsPerBar * barsToDisplay;
    const canvasWidth = this.canvas.width;
    const totalWaveformWidth = canvasWidth * (timeFor18Bars / this.audioDurationInSeconds); // Total width of the waveform box
    
    const beatTrackLeadInBars = this.beatwriter.beatTrackLeadInBars.currentValue;
    const beatTrackOffsetMs = this.beatwriter.beatTrackOffsetMS.currentValue;
    const startPositionInSeconds = (beatTrackOffsetMs / 1000) + (beatTrackLeadInBars * secondsPerBar);
    const startPositionPercentage = ((startPositionInSeconds - (beatTrackOffsetMs / 1000)) / this.audioDurationInSeconds) * 100; // Start position as percentage including offset
    console.log("Start position percentage:" + startPositionPercentage);

    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, this.canvas.height);

    // Redraw waveform
    this.drawWaveForm(this.beatwriter.modePlay.beatTrackName)
        .then(() => {
            // Draw red box
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            const xOffset = (startPositionPercentage / 100) * canvasWidth; // Calculate x-coordinate offset
            console.log("X Offset:" + xOffset);
            this.ctx.fillRect(xOffset, 0, totalWaveformWidth, this.canvas.height); // Adjust x-coordinate using xOffset
        })
        .catch(error => console.error('Error redrawing waveform:', error));
  }

  async drawWaveForm(audioFile) {
    console.log("Drawing waveform");
    const audioContext = new AudioContext();
    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    try {
      const response = await fetch(audioFile);
      const buffer = await response.arrayBuffer();
      const decodedData = await audioContext.decodeAudioData(buffer);

      console.log("Decoded audio data:" + decodedData);
      this.audioDurationInSeconds = decodedData.duration;
      console.log("Duration in seconds:" + this.audioDurationInSeconds);

      const data = decodedData.getChannelData(0);
      const step = Math.ceil(data.length / canvasWidth);
      const amp = canvasHeight / 2;
      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();
      let x = 0;
      for (let i = 0; i < canvasWidth; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.moveTo(x, (1 + min) * amp);
        ctx.lineTo(x, (1 + max) * amp);
        x += 1;
      }
      ctx.stroke();
    } catch (error) {
      console.error('Error fetching or decoding audio file:' + error);
      throw error; // Propagate the error
    }
  }
}

console.log("WaveformView.js loaded");