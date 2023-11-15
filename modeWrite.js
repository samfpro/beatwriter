class ModeWrite {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;

  }

  handleGridClick(event) {
    console.log("cell index: " + event.target.dataset.cellIndex);

    if ('' != this.beatwriter.gridView.getWord()) {
      this.processWord();
    }
    this.beatwriter.currentCell = event.target.dataset.cellIndex;


    console.log("setting current cell to " + this.beatwriter.currentCell);
    this.beatwriter.gridView.updateGrid();
    this.selectTextIfPresent();
  }

  handleKeydown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      this.processWord();
      if (event.key === 'Enter') {
        const nextRow = Math.floor((this.beatwriter.currentCell - 1) / 16) + 1;
        this.beatwriter.currentCell = nextRow * 16;
      }
      this.beatwriter.gridView.updateGrid();
      this.selectTextIfPresent();
    }
  }

  processWord() {
    const word = this.beatwriter.gridView.getWord();
    const syllables = getSyllables(word);

    for (let i = 0; i < syllables.length; i++) {
      this.beatwriter.cells[this.beatwriter.currentCell].syllable = syllables[i];
      this.beatwriter.currentCell++;
    }
    this.beatwriter.gridView.updateGrid();

  }
  selectTextIfPresent() {
    if (this.beatwriter.cells[this.beatwriter.currentCell].syllable) {
      this.beatwriter.gridView.setTextSelected(this.beatwriter.currentCell);
    }
  }
}
console.log("modeWrite.js loaded.");