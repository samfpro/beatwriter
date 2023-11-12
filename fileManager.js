class FileManager {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
  }

  saveToFileWithMetadata(fileName, BPM, beatTrackFileName, beatwriterCells) {
    // Create an object to include the metadata and the array of cells
    var data = {
      fileName: fileName,
      BPM: BPM,
      beatTrackFileName: beatTrackFileName,
      beatwriterCells: beatwriterCells
    };

    // Convert the data (object) into a JSON string
    var jsonData = JSON.stringify(data);
    console.log('JSON Data:', jsonData); // Log the JSON data

    // Create a Blob with the JSON data
    var blob = new Blob([jsonData], {
      type: 'text/plain'
    });

    // Create a URL for the Blob
    var url = URL.createObjectURL(blob);

    // Create an anchor element for downloading
    var a = document.createElement('a');
    a.href = url;
    a.download = this.beatwriter.verseName; // Set the desired file name

    // Trigger a click event on the anchor element to initiate the download
    a.click();

    // Clean up by revoking the Blob URL
    URL.revokeObjectURL(url);
  }

loadFileWithMetadata() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt'; // Specify the accepted file type
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonData = event.target.result;
        console.log('Loaded JSON Data:', jsonData);

        const data = JSON.parse(jsonData, (key, value) => {
          if (key === "beatwriterCells") {
            // Use the custom deserialization method to restore Cell objects
            return value.map(cellData => Cell.fromJSON(cellData));
          }
          return value;
        });

        // Now, data.beatwriterCells should contain Cell objects
        this.beatwriter.verseName = data.fileName;
        this.beatwriter.currentBPM = data.BPM;
        this.beatwriter.modePlay.beatTrackFileName = data.beatTrackFileName;
        this.beatwriter.cells = data.beatwriterCells;
        console.log('Updated Data:', this.beatwriter.verseName, this.beatwriter.currentBPM, this.beatwriter.modePlay.beatTrackFileName, this.beatwriter.cells);

        // Move the grid update inside the onload event handler
        this.beatwriter.gridView.updateGrid();
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

  importText() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';

    // Trigger the file picker
    input.click();

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const fileContent = e.target.result;
          const lines = fileContent.split('\n');

          let i = this.beatwriter.currentCell;

          lines.forEach(line => {
            const words = line.split(' ');

            words.forEach(word => {
              const syllables = getSyllables(word);

              syllables.forEach(syllable => {
                this.beatwriter.cells[i].syllable = syllable;
                i++;
              });
            });
            i = (Math.floor(i / 16) * 16) + 16;
          });

          this.beatwriter.currentCell = i;
          this.beatwriter.gridView.updateGrid();

          if (this.beatwriter.mode === 'write') {
            this.beatwriter.toggleMode();
          }

        };
        reader.readAsText(file);
      }

    });
  }


}
console.log("fileManager.js loaded");