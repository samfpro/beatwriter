class Beatwriter {
  constructor() {
    console.log('Initializing Beatwriter...');
    this.cells = Array.from({
      length: 256
    }, (_, i) => new Cell(i));
    this.gridView = new GridView(this);
    this.mode = 'write';
    this.currentCell = 0;
    this.verseLength = 0;
    this.currentBPM = 83;
    this.curCellPlaceholder = 0;
    this.verseName = "test";
    console.log("creating modeWrite instance");
    this.modeWrite = new ModeWrite(this);
    console.log("creating modeArrange instance");
    this.modeArrange = new ModeArrange(this);
    console.log("creating modePlay instance");
    this.modePlay = new ModePlay(this);
    console.log("getting DOM elements");
    this.fileManager = new FileManager(this);
    this.modeButton = document.getElementById('mode-button');
    this.lightModePlay = document.getElementById('light-mode-play');
    this.lightModeWrite = document.getElementById('light-mode-write');
    this.lightModeArrange = document.getElementById('light-mode-arrange');
    this.bpmSlider = document.getElementById('bpm-slider');
    this.speakingRateSlider = document.getElementById('speaking-rate-slider');
    this.playButton = document.getElementById('play-button');
    this.gridCells = document.querySelectorAll('.grid-cell');
    this.saveButton = document.getElementById('save-button');
    this.loadButton = document.getElementById('load-button');
    this.importButton = document.getElementById('import-button');
    this.initializeEventListeners();
    this.updateModeDisplay();
    this.gridView.updateGrid();

  }

  // ... Rest of the constructor

  initializeEventListeners() {
    console.log('Initializing event listeners...');
    this.modeButton.addEventListener('click', () => this.toggleMode());
    this.saveButton.addEventListener('click', () => this.fileManager.saveToFileWithMetadata(this.verseName, this.currentBPM, this.modePlay.beatTrackFileName, this.cells));
    this.loadButton.addEventListener('click', () => this.fileManager.loadFileWithMetadata());
    this.playButton.addEventListener('click', () => this.handlePlayButtonClick());
    this.importButton.addEventListener('click', () => this.handleImportButtonClick());
    this.bpmSlider.addEventListener('input', () => this.updateBPM(parseInt(this.bpmSlider.value)));
    this.speakingRateSlider.addEventListener('input', () => {
      const newSpeakingRate = parseFloat(this.speakingRateSlider.value);
      this.modePlay.ttsSpeakingRate = newSpeakingRate;
      document.getElementById('speaking-rate-value').textContent = newSpeakingRate.toFixed(1);
    });

    for (let i = 0; i < this.gridCells.length; i++) {
      this.gridCells[i].addEventListener('click', (event) => this.handleGridClick(event));
      this.gridCells[i].addEventListener('keydown', (event) => this.handleGridKeydown(event));
    }
  }


  toggleMode() {
    if (this.mode === 'arrange') {
      this.mode = 'write';
    } else if (this.mode === 'write') {
      this.mode = 'arrange';
    }
    this.updateModeDisplay();


  }

  updateModeDisplay() {
    
    const lightToTurnOff = document.querySelectorAll(".mode-active")[0];
    lightToTurnOff.classList.remove('mode-active')

    if (this.mode == 'write') {
       this.lightModeWrite.classList.add('mode-active');
    }else if (this.mode == 'arrange'){
              this.lightModeArrange.classList.add('mode-active');
    }else if (this.mode == 'play'){
              this.lightModePlay.classList.add('mode-active');
    }
  }

  handlePlayButtonClick() {
    this.modePlay.start();
  }

  handleImportButtonClick() {
    this.fileManager.importText();
  }


  handleGridClick(event) {
    if (this.mode === 'arrange') {
      this.modeArrange.handleGridClick(event);
    } else if (this.mode === 'write') {
      this.modeWrite.handleGridClick(event);
    }
  }
  handleGridKeydown(event) {
    if (this.mode === 'write') {
      this.modeWrite.handleKeydown(event);
    }
  }

  updateBPM(newBPM) {
    this.currentBPM = newBPM;
    this.bpmDisplayValue = newBPM;
  }

  // ... Rest of the methods
}
const beatwriter = new Beatwriter();