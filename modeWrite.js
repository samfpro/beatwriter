class ModeWrite {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;

  }
  handleGridClickWriteMode(cellIndex) {
    this.beatwriter.currentCell = cellIndex;
    this.beatwriter.gridView.updateGrid();
  }

handleKeyDown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    // Get the contents of the current cell as word
    const word = this.beatwriter.gridView.getWord();
    // Get syllables from the word
    const syllables = getSyllables(word);

    for (let i = 0; i < syllables.length; i++) {
      this.beatwriter.cells[this.beatwriter.currentCell].syllable = syllables[i];
      // Move to the next available cell in the row
      this.beatwriter.currentCell = (this.beatwriter.currentCell + 1) % 256;
    }

    // If the key is Enter, move to the first cell of the next row
    if (event.key === 'Enter') {
      const nextRow = Math.floor(this.beatwriter.currentCell / 16) + 1;
      this.beatwriter.currentCell = nextRow * 16;
    }

    this.beatwriter.gridView.updateGrid(this.beatwriter.cells);
  }
}


// Other functions for write mode can be added here...
}