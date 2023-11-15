class Beatwriter {
  constructor() {
    console.log('Initializing beatwriter...');


    this.cells = Array.from({
      length: 256
    }, (_, i) => new Cell(i));
    this.gridView = new GridView(this);
    this.mode = 'write';
    this.startMarkerPosition = 0;
    this.endMarkerPosition = 16;
    this.lcdDisplayMode = LCD_MODE_BPM;
    this.currentCell = 0;
    this.currentBPM = 83;
    this.curCellPlaceholder = 0;
    this.verseName = "test";
    this.metronomeActive = true;
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
    this.startMarkers = document.querySelectorAll(".start-marker");
    this.endMarkers = document.querySelectorAll(".end-marker");
    this.saveButton = document.getElementById('save-button');
    this.loadButton = document.getElementById('load-button');
    this.importButton = document.getElementById('import-button');
    this.lcdValues = [0, this.currentBPM, this.modePlay.ttsSpeakingVoice, this.modePlay.ttsSpeakingRate];
    this.lcdDisplayMode = LCD_MODE_BPM;
    this.lcdButton = document.getElementById("lcd-button");
    this.lightLcdBpm = document.getElementById("light-lcd-bpm");
    this.lightLcdVoc = document.getElementById("light-lcd-voc");
    this.lightLcdRat = document.getElementById("light-lcd-rat");
    this.lcdDisplay = document.getElementById('lcd-display');
    this.metronomeSwitch = document.getElementById("metronome-switch");
    this.metronomeSwitchUp = document.getElementById("metronome-switch-up");
    this.metronomeSwitchDown = document.getElementById("metronome-switch-down");
    this.metronomeLight = document.getElementById("metronome-light");

    this.valueController = new ValueController(
      this,
      document.getElementById('lcd-up-btn'),
      document.getElementById('lcd-down-btn'),
      this.lcdDisplay, (value) => this.updateValue(value), // valueUpdater callback
      this.lcdValues[this.lcdDisplayMode]
    );


    this.initializeEventListeners();
    this.updateModeDisplay();
    this.gridView.updateGrid();
    this.setCellsPlayable();

  }

  // ... Rest of the constructor

  initializeEventListeners() {
    console.log('Initializing event listeners...');
    
this.metronomeSwitch.addEventListener('click', () => this.toggleMetronome());

this.modeButton.addEventListener('click', () => this.toggleMode());
    this.saveButton.addEventListener('click', () => this.fileManager.saveToFileWithMetadata(this.verseName, this.currentBPM, this.modePlay.beatTrackFileName, this.cells));
    this.loadButton.addEventListener('click', () => this.fileManager.loadFileWithMetadata());
    this.playButton.addEventListener('click', () => this.handlePlayButtonClick());
    this.importButton.addEventListener('click', () => this.handleImportButtonClick());

    this.lcdButton.addEventListener('click', () => this.handleLcdButtonClick());

    for (let i = 0; i < this.gridCells.length; i++) {

      if (i < 16) {

        this.startMarkers[i].id = "startMarker-" + i;
        this.startMarkers[i].addEventListener('click', (event) => this.handleStartMarkerClick(event));
        this.endMarkers[i].id = "endMarker-" + i;
        this.endMarkers[i].addEventListener('click', (event) => this.handleEndMarkerClick(event));

      }

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

   toggleMetronome(){
    if (this.metronomeActive === true){
     this.metronomeSwitchUp.classList.remove("on-off-switch-position-active");
this.metronomeSwitchDown.classList.add("on-off-switch-position-active");
    this.metronomeActive = false;
    this.metronomeLight.classList.add("metronome-light-off");

}else{

this.metronomeSwitchDown.classList.remove("on-off-switch-position-active");
this.metronomeSwitchUp.classList.add("on-off-switch-position-active");
    this.metronomeActive = true;
    this.metronomeLight.classList.remove("metronome-light-off");

}

}

  updateModeDisplay() {

    const lightToTurnOff = document.querySelectorAll(".mode-active")[0];
    lightToTurnOff.classList.remove('mode-active');

    if (this.mode == 'write') {
      this.lightModeWrite.classList.add('mode-active');
    } else if (this.mode == 'arrange') {
      this.lightModeArrange.classList.add('mode-active');
    } else if (this.mode == 'play') {
      this.lightModePlay.classList.add('mode-active');
    }
  }

  handlePlayButtonClick() {
    this.modePlay.start();
  }

  handleImportButtonClick() {
    this.fileManager.importText();
  }

  handleLcdButtonClick() {
    switch (this.lcdDisplayMode) {
      case LCD_MODE_BPM:
        this.lightLcdBpm.classList.remove('val-active');
        this.lcdDisplayMode = LCD_MODE_VOC;
        this.lightLcdVoc.classList.add('val-active');
        this.lcdDisplay.innerText = this.modePlay.ttsSpeakingVoice;

        break;
      case LCD_MODE_VOC:
        this.lightLcdVoc.classList.remove('val-active');
        this.lcdDisplayMode = LCD_MODE_RAT;
        this.lightLcdRat.classList.add('val-active');
        this.lcdDisplay.innerText = this.modePlay.ttsSpeakingRate;
        break;
      case LCD_MODE_RAT:
        this.lightLcdRat.classList.remove('val-active');
        this.lcdDisplayMode = LCD_MODE_BPM;
        this.lightLcdBpm.classList.add('val-active');
        this.lcdDisplay.innerText = this.currentBPM;
        break;
    }
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
      console.log("event.key: " + event.key);
      this.modeWrite.handleKeydown(event);
    }
  }

  handleStartMarkerClick(event) {
    console.log("startMarkerPosition: " + this.startMarkerPosition);
    let clickedIndex = parseInt(event.target.id.match(/\d+/)[0]);
    console.log("clickedIndex: " + clickedIndex)
    this.startMarkers[this.startMarkerPosition / 16].classList.remove('start-marker-active');
    event.target.classList.add('start-marker-active');

    this.startMarkerPosition = clickedIndex * 16;
    console.log("startMarkerPosition: " + this.startMarkerPosition);
    if (this.startMarkerPosition > this.endMarkerPosition - 1) {

      this.endMarkers[this.endMarkerPosition / 16 - 1].classList.remove("end-marker-active");
      this.endMarkerPosition = this.startMarkerPosition + 16;
      this.endMarkers[(this.endMarkerPosition / 16) - 1].classList.add("end-marker-active");
    }
    this.setCellsPlayable();

  }

  handleEndMarkerClick(event) {
    console.log("endMarkerPosition: " + this.endMarkerPosition);
    const clickedIndex = parseInt(event.target.id.match(/\d+/)[0]);
    if ((clickedIndex * 16) + 16 > this.startMarkerPosition) {
      console.log("clickedIndex: " + clickedIndex)
      this.endMarkers[(this.endMarkerPosition / 16) - 1].classList.remove('end-marker-active');
      event.target.classList.add('end-marker-active');

      this.endMarkerPosition = (clickedIndex * 16) + 16;
      console.log("endMarkerPosition: " + this.endMarkerPosition);
    }
    this.setCellsPlayable();
  }

  updateValue(newValue) {
    console.log("got a new value! it is: " + newValue);
    this.lcdDisplay.innerText = newValue;
    switch (this.lcdDisplayMode) {
      case LCD_MODE_BPM:
        this.currentBPM = newValue;
        this.lcdValues[LCD_MODE_BPM] = newValue;
        break;
      case LCD_MODE_VOC:
        this.modePlay.ttsSpeakingVoice = newValue;
        this.lcdValues[LCD_MODE_VOC] = newValue;
        break;
      case LCD_MODE_RAT:
        this.modePlay.ttsSpeakingRate = newValue;
        this.lcdValues[LCD_MODE_RAT] = newValue;
        break;
    }

  }

  setCellsPlayable() {

    for (let i = 0; i < this.cells.length; i++) {
      if (i > this.startMarkerPosition - 1 && i < this.endMarkerPosition) {
        this.cells[i].isPlayable = true;
        console.log("set cell " + i + " to playable.");
      } else {
        this.cells[i].isPlayable = false;
      }
    }
    this.gridView.updateGrid();

  }

}

// ... Rest of the methods
const beatwriter = new Beatwriter();