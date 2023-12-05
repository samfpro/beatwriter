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
    this.verseName = "untitled.json";
    this.metronomeOn = true;
    this.isPlaying = false;
    this.previousMode = '';
    console.log("creating modeWrite instance");
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

  }
}
const beatwriter = new Beatwriter();
