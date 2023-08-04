class ModeArrange {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.moveFromIndex = null;
    this.moveToIndex = null;
  }

 handleGridClickArrangeMode(event) {
    console.log("Attempting to handle arrange mode click");
    const cellElement = event.target;
    const cellIndex = Array.from(cellElement.parentNode.children).indexOf(cellElement);

    if (this.moveFromIndex === null) {
      this.moveFromIndex = cellIndex;
      console.log("Set moveFromIndex to ", this.moveFromIndex);
      this.highlightPossibleMoves(cellIndex);
      this.beatwriter.gridView.updateGrid();
    } else {
      this.moveToIndex = cellIndex;
      console.log("Set moveToIndex to ", this.moveToIndex);
      this.performMove();
      this.resetCandidateCells();
      this.moveFromIndex = null;
      this.moveToIndex = null;
      this.beatwriter.gridView.updateGrid();
    }
  }



  highlightPossibleMoves(cellIndex) {
    console.log("Highlighting possible moves...");
    const blanksToRight = this.countBlanksToRight(cellIndex);
    const blanksToLeft = this.countBlanksToLeft(cellIndex);
    console.log("Blanks to the right: " + blanksToRight);
    console.log("Blanks to the left: " + blanksToLeft);
    const cellsArray = this.beatwriter.cells;
    const numberOfCells = 256;

    // Highlight possible moves to the right
    for (let i = cellIndex + 1; i <= cellIndex + blanksToRight; i++) {
      if (i < numberOfCells) {
        cellsArray[i].isCandidate = true;
      }
    }

    // Highlight possible moves to the left
    for (let i = cellIndex - 1; i >= cellIndex - blanksToLeft; i--) {
      if (i >= 0) {
        cellsArray[i].isCandidate = true;
      }
    }
  }

  countBlanksToRight(cellIndex) {
    console.log("Counting blanks to the right...");
    const cellsArray = this.beatwriter.cells;
    const rowStart = Math.floor(cellIndex / 16) * 16;
    let blanks = 0;

    for (let i = cellIndex + 1; i < rowStart + 16; i++) {
      if (!cellsArray[i].syllable.trim()) {
        blanks++;
      }
    }
    console.log("Found " + blanks + " blanks to the right.");
    return blanks;
  }

  countBlanksToLeft(cellIndex) {
    console.log("Counting blanks to the left...");
    const cellsArray = this.beatwriter.cells;
    const rowStart = Math.floor(cellIndex / 16) * 16;
    let blanks = 0;

    for (let i = cellIndex - 1; i >= rowStart; i--) {
      if (!cellsArray[i].syllable.trim()) {
        blanks++;
      }
    }
    console.log("Found " + blanks + " blanks to the left.");
    return blanks;
  }


performMove() {
  console.log("Performing move...");

  const moveDistance = this.moveToIndex - this.moveFromIndex;
  const blanksToMove = Math.abs(moveDistance);
  console.log("Move distance: " + moveDistance);
  console.log("Blanks to move: " + blanksToMove);

  const cellsArray = this.beatwriter.cells;
  const syllablesArray = cellsArray.map(cell => cell.syllable); // Create a separate array of just the syllables

  if (moveDistance > 0) {
    // Moving to the right
    let blanksRemoved = 0;
    for (let i = this.moveFromIndex + 1; i < syllablesArray.length; i++) {
      if (syllablesArray[i].trim() === '') {
        syllablesArray.splice(i, 1);
        blanksRemoved++;
        i--;
      }
      if (blanksRemoved === blanksToMove) break;
    }
    syllablesArray.splice(this.moveToIndex - blanksRemoved, 0, ...Array(blanksToMove).fill(''));
  } else if (moveDistance < 0) {
    // Moving to the left
    let blanksRemoved = 0;
    for (let i = this.moveFromIndex - 1; i >= 0; i--) {
      if (syllablesArray[i].trim() === '') {
        syllablesArray.splice(i, 1);
        blanksRemoved++;
        i++;
      }
      if (blanksRemoved === blanksToMove) break;
    }
    syllablesArray.splice(this.moveToIndex + 1, 0, ...Array(blanksToMove).fill(''));
  }

  // Update the syllables property in beatwriter.cells
  cellsArray.forEach((cell, index) => {
    cell.syllable = syllablesArray[index];
  });

  this.beatwriter.gridView.updateGrid();
}





resetCandidateCells() {
  for (const cell of this.beatwriter.cells) {
    cell.isCandidate = false;
  }
}





}
