class ControlPanel {
  constructor(beatwriter, playParameterValues, beatTrackParameterValues) {
    this.beatwriter = beatwriter;
    this.playParameterValues = playParameterValues;
    this.beatTrackParameterValues = beatTrackParameterValues;
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
    this.autoBpmButton = document.getElementById("auto-bpm-button");
    console.log("instantiating value controller");
    this.playValueSelector = new ValueSelector(beatwriter.gridView, document.getElementById('lcd-container'), beatwriter.playParameterValues, this.beatwriter.fileManager);
    this.beatTrackValueSelector = new ValueSelector(beatwriter.gridView, document.getElementById('beat-track-container'), beatwriter.beatTrackParameterValues, this.beatwriter.fileManager);
    this.bpmCalculator = new BPMCalculator(this.beatwriter);
    this.initializeEventListeners();
    this.displaySvgContent();

  }

  displaySvgContent() {
    embedSVG("save-button", "Img/save-button.svg");
    embedSVG("load-button", "Img/load-button.svg");
    embedSVG("import-button", "Img/import-button.svg");
    embedSVG("export-button", "Img/export-button.svg");
    embedSVG("bt-lcd-button", "Img/toggle-button.svg");
    embedSVG("beat-track-load-button", "Img/load-button.svg");
    embedSVG("auto-bpm-button", "Img/auto-bpm-button.svg");
    embedSVG("mode-button", "Img/toggle-button.svg");
    embedSVG("lcd-button", "Img/toggle-button.svg");
    embedSVG("play-button", "Img/play-button.svg");
    embedSVG("stop-button", "Img/stop-button.svg");
    embedSVG("bounce-button", "Img/bounce-button.svg");





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
    this.autoBpmButton.addEventListener('click', () => this.handleAutoBpmButtonClick());
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
      this.beatwriter.gridView.updateGrid();

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
    this.beatwriter.fileManager.saveToFile(this.beatwriter.projectName);

  }


  async handlePlayButtonClick() {

    if (this.beatwriter.mode != 'play') {
      this.beatwriter.previousMode = this.beatwriter.mode;
      const lightToTurnOff = document.querySelectorAll('.mode-active')[0];
      lightToTurnOff.classList.remove("mode-active");

      this.beatwriter.mode = 'play';
      this.updateModeDisplay();
      await this.beatwriter.modePlay.start();
    } else {
      await this.beatwriter.modePlay.stopSequencer();
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

  async handleBeatTrackLoadButtonClick() {
const fileInfo = await this.beatwriter.fileManager.loadBeatTrack();
const fileName = fileInfo.fileName + '.' + fileInfo.fileExtension;
this.beatwriter.beatTrack = fileName;
    this.beatwriter.waveFormView.drawWaveForm(fileName);
this.updateDisplays();
  }
  

   async handleAutoBpmButtonClick() {
const bpm = await this.bpmCalculator.calculateBPM(this.beatwriter.beatTrack);
   

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

    this.beatTrackInput.textContent = this.beatwriter.beatTrack;

    this.projectNameInput.textContent = this.beatwriter.projectName;



  }
  handleExportButtonClick() {
    console.log('Export button clicked'); // Add this line for debugging

    const exportFormats = ['Text (.txt)', 'MP3 (.mp3)', 'WAV (.wav)'];
    const defaultFileName = this.beatwriter.projectName;

    // Create select element for export format
    const select = document.createElement('select');
    console.log('Select element created:', select); // Add this line for debugging
    exportFormats.forEach((format, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = format;
      select.appendChild(option);
    });

    // Create input element for file name
    const fileNameInput = document.createElement('input');
    fileNameInput.type = 'text';
    fileNameInput.value = defaultFileName;
    console.log('File name input element created:', fileNameInput); // Add this line for debugging

    // Create container for select and input elements
    const container = document.createElement('div');
    container.appendChild(select);
    container.appendChild(fileNameInput);

    // Create modal dialog
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div>${container.outerHTML}</div>
            <button id="export-confirm-btn">Export</button>
        </div>
    `;

    // Create container for modal dialog
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');
    modalContainer.appendChild(modal);

    document.body.appendChild(modalContainer); // Append modal container to body

    // Display modal dialog
    modal.style.display = 'block';

    // Close modal when close button or outside modal is clicked
    const closeButton = modal.querySelector('.close');
    closeButton.onclick = () => {
      modal.style.display = 'none';
      document.body.removeChild(modalContainer);
    };
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.removeChild(modalContainer);
      }
    };
    // Handle export button click
    const exportButton = modal.querySelector('#export-confirm-btn');
    exportButton.onclick = () => {
      const selectedIndex = parseInt(select.value, 10);
      const selectedFormat = exportFormats[selectedIndex].split(' ')[0].toLowerCase(); // Extract format from selected option

      let fileName = fileNameInput.value.trim();
      if (fileName === '') {
        fileName = defaultFileName; // Use default file name if empty
      }

      console.log('Selected format:', selectedFormat); // Add this line for debugging
      console.log('File name:', fileName); // Add this line for debugging

      switch (selectedFormat) {
        case 'text':
          // Logic to export as .txt
          this.beatwriter.modePlay.exportAudio(fileName + '.mp3');
          break;
        case 'mp3':
          // Logic to export as .mp3
          this.beatwriter.modePlay.exportAudio(fileName + '.mp3');
          break;
        case 'wav':
          // Logic to export as .wav
          // You can add your logic here to trigger exporting as WAV
          break;
        default:
          alert('Invalid export format selected.');
      }

      modal.style.display = 'none';
      document.body.removeChild(modalContainer);
    };
  }
}

console.log("controlPanel.js.loaded");