class FileManager {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.autoSaveInterval = null; // Declare autoSaveInterval in the constructor
  }

  saveToLocalStorage() {
    try {
      const projectData = {
        projectName: this.beatwriter.projectName,
        beatTrack: this.beatwriter.beatTrack,
        cells: this.beatwriter.cells.map(cell => ({
          uniqueId: cell.uniqueId,
          syllable: cell.syllable,
          isCandidate: cell.isCandidate,
          stepPlaying: cell.stepPlaying,
          isPlayable: cell.isPlayable
        })),
        playParameterValues: this.beatwriter.playParameterValues.map(parameter => ({
          name: parameter.name,
          value: parameter.currentValue,
          minValue: parameter.minValue,
          maxValue: parameter.maxValue,
          type: parameter.type
        })),
        beatTrackParameterValues: this.beatwriter.beatTrackParameterValues.map(parameter => ({
          name: parameter.name,
          value: parameter.currentValue,
          minValue: parameter.minValue,
          maxValue: parameter.maxValue,
          type: parameter.type
        })),
        bpm: this.beatwriter.bpm // Save the bpm value
      };
      const jsonData = JSON.stringify(projectData);
      localStorage.setItem('beatwriterData', jsonData);
      console.log("Auto-saved to local storage at " + new Date().toLocaleString());
    } catch (error) {
      console.error("Error saving to local storage: " + error);
    }
  }

  saveToFile(fileName) {
    try {
      const projectData = {
        projectName: this.beatwriter.projectName,
        beatTrack: this.beatwriter.beatTrack,
        cells: this.beatwriter.cells.map(cell => ({
          uniqueId: cell.uniqueId,
          syllable: cell.syllable,
          isCandidate: cell.isCandidate,
          stepPlaying: cell.stepPlaying,
          isPlayable: cell.isPlayable
        })),
        playParameterValues: this.beatwriter.playParameterValues.map(parameter => ({
          name: parameter.name,
          value: parameter.currentValue,
          minValue: parameter.minValue,
          maxValue: parameter.maxValue,
          type: parameter.type
        })),
        beatTrackParameterValues: this.beatwriter.beatTrackParameterValues.map(parameter => ({
          name: parameter.name,
          value: parameter.currentValue,
          minValue: parameter.minValue,
          maxValue: parameter.maxValue,
          type: parameter.type
        })),
        bpm: this.beatwriter.bpm // Save the bpm value
      };
      const jsonData = JSON.stringify(projectData);
      this.downloadFile(fileName + ".json", jsonData);
    } catch (error) {
      console.error("Error saving to file: " + error);
    }
  }

  loadFromLocalStorage() {
    try {
      const storedData = localStorage.getItem('beatwriterData');
      if (storedData) {
        const projectData = JSON.parse(storedData);
        console.log("Project data loaded: " + JSON.stringify(projectData));
        
        this.beatwriter.projectName = projectData.projectName;
        this.beatwriter.beatTrack = projectData.beatTrack;
        this.beatwriter.cells = projectData.cells.map(cellData => new Cell(cellData));
        this.beatwriter.bpm = projectData.bpm || 120; // Assign bpm with default value if not present
        console.log("BPM loaded: " + this.beatwriter.bpm);

        // Assign play parameter values
        projectData.playParameterValues.forEach(parameterData => {
          const parameter = this.beatwriter.playParameterValues.find(p => p.name === parameterData.name);
          if (parameter) {
            parameter.currentValue = parameterData.value;
            parameter.minValue = parameterData.minValue;
            parameter.maxValue = parameterData.maxValue;
            parameter.type = parameterData.type;
          }
        });

        // Assign beat track parameter values
        projectData.beatTrackParameterValues.forEach(parameterData => {
          const parameter = this.beatwriter.beatTrackParameterValues.find(p => p.name === parameterData.name);
          if (parameter) {
            parameter.currentValue = parameterData.value;
            parameter.minValue = parameterData.minValue;
            parameter.maxValue = parameterData.maxValue;
            parameter.type = parameterData.type;
          }
        });

        this.beatwriter.gridView.updateGrid();
        this.beatwriter.controlPanel.updateDisplays();
        console.log("Loaded state from local storage");
      }
    } catch (error) {
      console.error("Error loading from local storage: " + error);
    }
  }

  downloadFile(fileName, data) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const jsonData = event.target.result;
          this.loadDataFromJSON(jsonData);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  loadDataFromJSON(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      console.log("Data loaded from JSON: " + JSON.stringify(data));

      this.beatwriter.projectName = data.projectName;
      this.beatwriter.beatTrack = data.beatTrack;
      this.beatwriter.cells = data.cells.map(cellData => new Cell(cellData));
      this.beatwriter.bpm = data.bpm || 120; // Assign bpm with default value if not present

      data.playParameterValues.forEach(parameterData => {
        const parameter = this.beatwriter.playParameterValues.find(p => p.name === parameterData.name);
        if (parameter) {
          parameter.currentValue = parameterData.value;
          parameter.minValue = parameterData.minValue;
          parameter.maxValue = parameterData.maxValue;
          parameter.type = parameterData.type;
        }
      });

      data.beatTrackParameterValues.forEach(parameterData => {
        const parameter = this.beatwriter.beatTrackParameterValues.find(p => p.name === parameterData.name);
        if (parameter) {
          parameter.currentValue = parameterData.value;
          parameter.minValue = parameterData.minValue;
          parameter.maxValue = parameterData.maxValue;
          parameter.type = parameterData.type;
        }
      });

      this.beatwriter.gridView.updateGrid();
      this.beatwriter.controlPanel.updateDisplays();
      console.log("State loaded from JSON file");
    } catch (error) {
      console.error("Error loading data from JSON: " + error);
    }
  }

  loadBeatTrack() {
    return new Promise((resolve, reject) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'audio/*,.mp3,.wav,.ogg'; // Accept common audio file types
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const fileUrl = URL.createObjectURL(file);
          const fileName = file.name;
          resolve({ fileUrl, fileName });
        } else {
          reject('No file selected');
        }
      };
      fileInput.click();
    });
  }

  startAutoSave(interval = 30000) {
    this.autoSaveInterval = setInterval(() => {
      this.saveToLocalStorage();
    }, interval);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  start() {
    this.loadFromLocalStorage(); // Load state
    this.startAutoSave(); // Start auto-save after loading
  }
}