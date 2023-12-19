class Beatwriter {
  constructor() {
    console.log('Initializing beatwriter...');
    this.cells = Array.from({
      length: 256
    }, (i) => new Cell(i));
    console.log("initializing gridView");
    this.gridView = new GridView(this);
    this.mode = 'write';
    this.startMarkerPosition = 0;
    this.endMarkerPosition = 16;
    this.currentCell = 0;
    this.currentBPM = 83;
    this.projectName = "untitled.json";
    this.metronomeOn = true;
    this.isPlaying = false;
    this.previousMode = '';
    console.log("creating modeWrite instance");
    this.bpm = new ParameterValue('bpm', 240, 0, 83, 'integer');
    this.ttsVoice = new ParameterValue('ttsVoice', 6, 1, 1, 'integer');
    this.ttsRate = new ParameterValue('ttsRate', 4, 1, 3, 'float');
this.playParameterValues = [
  this.bpm,
  this.ttsVoice,
  this.ttsRate,
];
    this.beatTrackOffsetMS = new ParameterValue('beatTrackOffsetMS', 0, 0, 0, 'integer');
    this.beatTrackLeadInBars = new ParameterValue('beatTrackLeadInBars', 0, 0, 0, 'integer');
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
const beatwriter = new Beatwriter();
beatwriter.calculateMaxValues();
beatwriter.controlPanel.playValueSelector.updateDisplay();