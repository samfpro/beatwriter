class Beatwriter {
  constructor() {
    console.log('Initializing beatwriter...');
    this.cells = Array.from({
      length: 288
    }, (i) => new Cell(i));
    console.log("Cells initialized:", this.cells);
    console.log("Initializing gridView...");
    this.gridView = new GridView(this);
    console.log("GridView initialized:", this.gridView);
    this.mode = 'write';
    this.startMarkerPosition = 0;
    this.endMarkerPosition = 16;
    this.currentCell = 0;
    this.projectName = "untitled";
    this.metronomeOn = true;
    this.isPlaying = false;
    this.previousMode = '';
    this.beatTrack = "BeatTrack/Turtletuck_83BPM.mp3";
    console.log("Creating modeArrange at...");
    this.modeArrange = new ModeArrange(this);
    console.log("modeArrange initialized:", this.modeArrange);
   this.modeWrite = new ModeWrite(this);
    console.log("modeWrite initialized:", this.modeWrite);
    console.log("Creating modePlay instance...");
    this.modePlay = new ModePlay(this);
    console.log("modePlay initialized:", this.modePlay);
    console.log("Creating FileManager instance...");
    this.fileManager = new FileManager(this);
    console.log("fileManager initialized:", this.fileManager);
    this.gridView.updateGrid();
    console.log("Creating ControlPanel instance...");
    

    // Initialize ParameterValues
    this.bpm = new ParameterValue('bpm', 83, 0, 240, 'integer');
    this.ttsVoice = new ParameterValue('ttsVoice', 1, 1, 29, 'integer');
    this.ttsRate = new ParameterValue('ttsRate', 3, 1, 4, 'float');
    this.beatTrackOffsetMS = new ParameterValue('beatTrackOffsetMS', 0, 0, 2000, 'integer');
this.playParameterValues = [this.bpm, this.ttsVoice, this.ttsRate];
    this.waveFormView = new WaveFormView(this);
    console.log("waveFormView initialized:", this.waveFormView);
    this.beatTrackLeadInBars = new ParameterValue('beatTrackLeadInBars', 0, 0, 100, 'integer', () => this.waveFormView.drawRegions());

    console.log("Creating WaveFormView instance...");

    console.log("Initialization success!");

    this.beatTrackRate = new ParameterValue('beatTrackRate', 400, 25, 100, 'integer');
    this.beatTrackParameterValues = [this.beatTrackOffsetMS, this.beatTrackLeadInBars, this.beatTrackRate];
  
this.controlPanel = new ControlPanel(this, this.playParameterValues, this.beatTrackParameterValues);
    console.log("controlPanel initialized:", this.controlPanel);
    this.controlPanel.updateDisplays();



}

  calculateMaxValues() {
    // Assuming this.bpm is defined in your class
    const beatTrackLengthMS = (60 / this.bpm.currentValue) * 4 * 1000; // Calculate beatTrack length in MS
    this.beatTrackParameterValues[0].maxValue = beatTrackLengthMS;

    // Calculate the number of bars based on beatTrack length
    const bars = beatTrackLengthMS / (60 / this.bpm.currentValue) / 4;
    this.beatTrackParameterValues[1].maxValue = Math.ceil(bars);
    console.log("Max values calculated:", this.beatTrackParameterValues);
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
beatwriter.controlPanel.beatTrackValueSelector.updateDisplay();
beatwriter.fileManager.loadFromLocalStorage();