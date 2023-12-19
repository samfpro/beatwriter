class ControlPanel {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.modeButton = document.getElementById('mode-button');
    this.lightModePlay = document.getElementById('light-mode-play');
    this.lightModeWrite = document.getElementById('light-mode-write');
    this.lightModeArrange = document.getElementById('light-mode-arrange');
    this.speakingRateSlider = document.getElementById('speaking-rate-slider');
    this.playButton = document.getElementById('play-button');
    this.gridCells = document.querySelectorAll('.grid-cell');
    this.startMarkers = document.querySelectorAll(".start-marker");
    this.endMarkers = document.querySelectorAll(".end-marker");
    this.saveButton = document.getElementById('save-button');
    this.loadButton = document.getElementById('load-button');
    this.importButton = document.getElementById('import-button');
    this.exportButton = document.getElementById("export-button");
    this.projectNameInput = document.getElementById("project-name-input");
    this.metronomeSwitch = document.getElementById("metronome-switch");
    this.metronomeSwitchUp = document.getElementById("metronome-switch-up");
    this.metronomeSwitchDown = document.getElementById("metronome-switch-down");
    this.metronomeLight = document.getElementById("metronome-light");
    this.beatTrackFader = document.getElementById('beat-track-fader');
    this.ttsFader = document.getElementById('tts-fader');
    this.metronomeFader = document.getElementById('metronome-fader');
    this.masterFader = document.getElementById('master-fader');
    this.beatTrackInput = document.getElementById('beat-track-input');
    this.beatTrackLoadButton = document.getElementById('beat-track-load-button');
    console.log("instantiating value controller");
this.playValueSelector = new ValueSelector(this.controlPanel, document.getElementById('lcd-container'), this.beatwriter.playParameterValues);
    this.beatTrackValueSelector = new ValueSelector(this.controlPanel, document.getElementById('beat-track-container'), this.beatwriter.beatTrackParameterValues);
    this.initializeEventListeners();
    this.beatwriter.gridView.updateGrid();


}

  initializeEventListeners() {
    this.projectNameInput.addEventListener('keydown', (event) => this.handleProjectNameInputInput());

    this.projectNameInput.addEventListener('click', (event) => this.handleProjectNameInputClick());

    this.modeButton.addEventListener('click', () => this.handleModeButtonClick());
    this.playButton.addEventListener('click', () => this.handlePlayButtonClick());
    this.saveButton.addEventListener('click', () => this.handleSaveButtonClick());
    this.loadButton.addEventListener('click', () => this.handleLoadButtonClick());
    this.importButton.addEventListener('click', () => this.handleImportButtonClick());
    this.exportButton.addEventListener('click', () => this.handleExportButtonClick());
    this.metronomeSwitch.addEventListener('click', () => this.toggleMetronome());

this.beatTrackLoadButton.addEventListener('click', () => this.handleBeatTrackLoadButtonClick());

    this.beatTrackFader.addEventListener('input', (event) => this.handleGainChange(event));

    this.metronomeFader.addEventListener('input', (event) => this.handleGainChange(event));

    this.ttsFader.addEventListener('input', (event) => this.handleGainChange(event));

    this.masterFader.addEventListener('input', (event) => this.handleGainChange(event));
  }

  toggleMetronome() {
    if (this.beatwriter.metronomeOn === true) {
      this.metronomeSwitchUp.classList.remove("metronome-switch-position-active");
      this.metronomeSwitchDown.classList.add("metronome-switch-position-active");
      this.beatwriter.metronomeOn = false;
      this.metronomeLight.classList.add("metronome-light-off");

    } else {

      this.metronomeSwitchDown.classList.remove("metronome-switch-position-active");
      this.metronomeSwitchUp.classList.add("metronome-switch-position-active");
      this.beatwriter.metronomeOn = true;
      this.metronomeLight.classList.remove("metronome-light-off");

    }

  }

  handleModeButtonClick() {
    console.log("handling mode button click");
    if (this.beatwriter.mode === 'write') {
      this.beatwriter.mode = 'arrange';
      this.lightModeWrite.classList.remove('mode-active');
      this.lightModeArrange.classList.add('mode-active');

    } else if (this.beatwriter.mode === 'arrange') {
      this.beatwriter.mode = 'write';
      this.lightModeWrite.classList.add('mode-active');
      this.lightModeArrange.classList.remove('mode-active');
    }
    //checking if referenced value is changed.
    console.log("mode changed to " + this.beatwriter.mode);
    this.beatwriter.gridView.updateGrid();

    console.log("attempting to set borders");
    this.beatwriter.gridView.setModeBorders();
  }

  updateModeDisplay() {
    if (this.beatwriter.mode == 'write') {
      this.lightModeWrite.classList.add("mode-active");

      this.lightModeArrange.classList.remove("mode-active");

      this.lightModePlay.classList.remove("mode-active");


    } else if (this.beatwriter.mode == 'arrange') {
      this.lightModeArrange.classList.add("mode-active");
      this.lightModePlay.classList.remove("mode-active");

      this.lightModeWrite.classList.remove("mode-active");

    } else if (this.beatwriter.mode = 'play') {
      this.lightModePlay.classList.add("mode-active");
      this.lightModeWrite.classList.remove("mode-active");
      this.lightModeArrange.classList.remove("mode-active");

    }

  }

  handleSaveButtonClick() {
    this.beatwriter.projectName = this.projectNameInput.textContent;
    this.beatwriter.fileManager.saveToFileWithMetadata(this.beatwriter.projectName, this.beatwriter.currentBPM, this.beatwriter.modePlay.beatTrackFileName, this.beatwriter.cells);

  }


  handlePlayButtonClick() {

    if (this.beatwriter.mode != 'play') {
      this.beatwriter.previousMode = this.beatwriter.mode;
      const lightToTurnOff = document.querySelectorAll('.mode-active')[0];
      lightToTurnOff.classList.remove("mode-active");

      this.beatwriter.mode = 'play';
      this.updateModeDisplay();
      this.beatwriter.modePlay.start();
    } else {
      this.beatwriter.modePlay.stopSequencer();
      console.log("cp handled play button click");
    }
  }

  handleLoadButtonClick() {
    this.beatwriter.fileManager.loadFileWithMetadata();
  }

  handleProjectNameInputInput(event) {
    this.beatwriter.projectName = this.projectNameInput.value;
  }

  handleProjectNameInputClick() {
    this.projectNameInput.focus();

  }

  handleBeatTrackLoadButtonClick(){
   this.beatwriter.fileManager.loadBeatTrack();
this.updateDisplays();

}


  handleGainChange(event) {

    const fader = event.target;
    console.log(fader.id);
    const newGain = fader.value / 100;
    let gain = null;


    switch (fader.id) {
      case 'beat-track-fader':
        gain = this.beatwriter.modePlay.beatTrackGain;
        break;
      case 'tts-fader':
        gain = this.beatwriter.modePlay.ttsGain;
        break;
      case 'metronome-fader':
        gain = this.beatwriter.modePlay.sineGain;
        this.beatwriter.modePlay.updateGain(gain, newGain);
        gain = this.beatwriter.modePlay.sawGain;
        break;
      case 'master-fader':
        gain = this.beatwriter.modePlay.masterGain;
        break;
      default:
    }
    this.beatwriter.modePlay.updateGain(gain, newGain);

  }


  updateDisplays() {

    this.beatTrackInput.textContent = this.beatwriter.modePlay.beatTrackName;

    this.projectNameInput.textContent = this.beatwriter.projectName;



  }
}

  console.log("controlPanel.js.loaded");