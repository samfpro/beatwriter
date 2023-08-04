class GridView {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.gridContainer = document.getElementById('grid-container');
    this.generateGrid();

  }

generateGrid() {
  this.gridContainer.innerHTML = '';

  // Create the grid based on beatwriter.cells array
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const cellIndex = row * 16 + col;
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.textContent = this.beatwriter.cells[cellIndex].syllable;
      this.gridContainer.appendChild(cell);
    }
  }
}


  updateGrid() {
        console.log("updating grid...");
        this.moveFromIndex = null;
    this.moveToIndex = null;const gridCells = this.gridContainer.querySelectorAll('.grid-cell');
    for (let i = 0; i < gridCells.length; i++) {
      const cellElement = gridCells[i];

      // Update the cell's syllable content
      cellElement.textContent = this.beatwriter.cells[i].syllable;

      // Add or remove "isCandidate" class based on the "isCandidate" property
      if (this.beatwriter.cells[i].isCandidate) {
        cellElement.classList.add('isCandidate');
      } else {
        cellElement.classList.remove('isCandidate');
      }

      // Set focus and contenteditable based on the beatwriter.currentCell
      if (i === this.beatwriter.currentCell) {
        cellElement.setAttribute('contenteditable', 'true');
        cellElement.focus();
      } else {
        cellElement.setAttribute('contenteditable', 'false');
      }
    }
  console.log("grid updated succesfully.");
  }
 getWord() {
    const currentCell = this.gridContainer.querySelector('.grid-cell[contenteditable="true"]');
    return currentCell.textContent.trim();
  }
}