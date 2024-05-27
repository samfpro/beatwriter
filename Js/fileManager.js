class FileManager {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
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
            }))
        };
        const jsonData = JSON.stringify(projectData);
        localStorage.setItem('beatwriterData', jsonData);
    } catch (error) {
        console.error("Error saving to local storage:" + error);
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
            }))
        };
        const jsonData = JSON.stringify(projectData);
        this.downloadFile(fileName + ".json", jsonData); // Changed the file extension to .json
    } catch (error) {
        console.error("Error saving to file:" + error);
    }
}

  loadFromLocalStorage() {
    try {
      const storedData = localStorage.getItem('beatwriterData');
      if (storedData) {
        const projectData = JSON.parse(storedData);
        this.beatwriter.projectName = projectData.projectName;
        this.beatwriter.beatTrack = projectData.beatTrack;
        this.beatwriter.cells = projectData.cells.map(cellData => new Cell(cellData));
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
      }
    } catch (error) {
      console.error("Error loading from local storage:" + error);
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
    input.accept = '.txt';
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
    const data = JSON.parse(jsonData);
    Object.assign(this.beatwriter, data);
    this.beatwriter.gridView.updateGrid();
    this.beatwriter.controlPanel.updateDisplays();
  }

async loadBeatTrack() {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/mpeg'; // Accept only mp3 files
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const fileName = file.name;
                const fileExtension = fileName.split('.').pop().toLowerCase(); // Extract file extension
                const fileNameWithoutExtension = 'BeatTrack/' + fileName.substring(0, fileName.lastIndexOf('.')); // Add "BeatTrack/" before the file name
                // Resolve the promise with the file name and extension
                resolve({ fileName: fileNameWithoutExtension, fileExtension: fileExtension }); 
            } else {
                reject('No file selected');
            }
        };
        fileInput.click();
    });
}
}