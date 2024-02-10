class Beatwriter {
  constructor() {
    console.log('Initializing beatwriter...');
    this.cells = Array.from({
      length: 288
    }, (i) => new Cell(i));
    console.log("initializing gridView");
    this.gridView = new GridView(this);
    this.mode = 'write';
    this.startMarkerPosition = 0;
    this.endMarkerPosition = 16;
    this.currentCell = 0;
    this.projectName = "untitled.json";
    this.metronomeOn = true;
    this.isPlaying = false;
    this.previousMode = '';
    console.log("creating modeWrite instance");
    this.bpm = new ParameterValue('bpm', 83, 0, 240, 'integer');
    this.ttsVoice = new ParameterValue('ttsVoice', 29, 1, 1, 'integer');
    this.ttsRate = new ParameterValue('ttsRate', 4, 1, 3, 'float');
    this.playParameterValues = [
      this.bpm,
      this.ttsVoice,
      this.ttsRate,
    ];
this.beatTrackOffsetMS = new ParameterValue('beatTrackOffsetMS', 0, 0, 0, 'integer');
this.beatTrackLeadInBars = new ParameterValue('beatTrackLeadInBars', 0, 0, 0, 'integer', () => this.waveFormView.updateWaveFormWindow());
this.beatTrackRate = new ParameterValue('beatTrackRate', 400, 25, 100, 'integer');
    this.beatTrackParameterValues = [
      this.beatTrackOffsetMS,
      this.beatTrackLeadInBars,
      this.beatTrackRate,
    ];
    this.modeWrite = new ModeWrite(this);
    console.log("creating modeArrange instance");
    this.modeArrange = new ModeArrange(this);
    console.log("creating modePlay instance");
    this.modePlay = new ModePlay(this);
    console.log("creating FileManager instance");
    this.fileManager = new FileManager(this);
    this.gridView.updateGrid();
    console.log("creating ControlPanel instance");
    this.controlPanel = new ControlPanel(this);
    this.controlPanel.updateDisplays();
    console.log("creating waveFormView instance");
    this.waveFormView = new WaveFormView(this);
    console.log("success");
  }
  calculateMaxValues() {
    // Assuming this.bpm is defined in your class
    const beatTrackLengthMS = (60 / this.bpm.currentValue) * 4 * 1000; // Calculate beatTrack length in MS
    this.beatTrackParameterValues[0].maxValue = beatTrackLengthMS;

    // Calculate the number of bars based on beatTrack length
    const bars = beatTrackLengthMS / (60 / this.bpm.currentValue) / 4;
    this.beatTrackParameterValues[1].maxValue = Math.ceil(bars);
  }
}

console.log("beatwriter.js loaded");

const consolePanel = document.getElementById('console-panel');
const oldConsoleLog = console.log;

console.log = function(message) {
  oldConsoleLog.apply(console, arguments);
  consolePanel.insertAdjacentHTML('afterbegin', `<div class="console-message">${message}</div>`);
};

window.onerror = function(message, source, lineno, colno, error) {
  const errorMessage = `${message} at ${source}:${lineno}:${colno}`;
  console.error(errorMessage);
  consolePanel.insertAdjacentHTML('afterbegin', `<div class="error console-message">${errorMessage}</div>`);
  return true;
};


const beatwriter = new Beatwriter();
beatwriter.calculateMaxValues();
beatwriter.controlPanel.playValueSelector.updateDisplay();