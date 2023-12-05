class ModeWrite {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;

  }

  handleGridClick(cellIndex) {


    if ('' != this.beatwriter.gridView.getWord()) {
      this.processWord();
    }
    this.beatwriter.currentCell = cellIndex;


    console.log("setting current cell to " + this.beatwriter.currentCell);
    this.beatwriter.gridView.updateGrid();
    this.selectTextIfPresent();
  }

  handleGridKeydown(key) {
    if (key == 'Backspace' && this.beatwriter.gridView.getWord() == '') {
      this.beatwriter.currentCell--;
      this.beatwriter.cells[this.beatwriter.currentCell].syllable = '';
      this.beatwriter.gridView.updateGrid();
      return;

    } else if (key === ' ' || key === 'Enter') {
      if (this.beatwriter.gridView.getWord() == '') {
        this.beatwriter.currentCell++;
        if (key == 'Enter') {
          this.moveToNextRow();
        }
      } else {
        this.processWord();
        if (key === 'Enter') {
          this.moveToNextRow();
        }
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
  moveToNextRow() {
    const nextRow = Math.floor((this.beatwriter.currentCell - 1) / 16) + 1;
    this.beatwriter.currentCell = nextRow * 16;
  }


}
console.log("modeWrite.js loaded.");