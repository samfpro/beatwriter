class GridView {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.gridContainer = document.getElementById('grid-container');
    this.startMarkerContainer = document.getElementById("start-marker-container");
    this.endMarkerContainer = document.getElementById("end-marker-container");
    this.gridCells = [];
    this.generateGrid();

  }

  generateGrid() {
    this.gridContainer.innerHTML = '';

    // Create the grid based on beatwriter.cells array
    for (let row = 0; row < 16; row++) {
      const startMarker = document.createElement('div');
      const endMarker = document.createElement('div');
      if (row === 0) {
        startMarker.classList.add('start-marker-active');
        endMarker.classList.add('end-marker-active');
      }
      startMarker.classList.add('start-marker');
      this.startMarkerContainer.appendChild(startMarker);
      endMarker.classList.add('end-marker');
      this.endMarkerContainer.appendChild(endMarker);


      for (let col = 0; col < 16; col++) {
        const cellIndex = row * 16 + col;
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.textContent = this.beatwriter.cells[cellIndex].syllable;

        // Set the cellIndex as a data attribute on the cell element
        cell.dataset.cellIndex = cellIndex;

        this.gridContainer.appendChild(cell);
        console.log("created cell " + cellIndex);
      }
    }
  }
  setTextSelected(cellIndex) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this.gridCells[cellIndex]);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  updateGrid() {

    this.gridCells = this.gridContainer.querySelectorAll('.grid-cell');
    if (this.beatwriter.mode === 'play') {
      for (let i = this.beatwriter.startMarkerPosition; i < this.beatwriter.endMarkerPosition + 1; i++) {
        if (this.beatwriter.cells[i].stepPlaying) {
          this.gridCells[i].classList.add('stepPlaying');
          return;


        } else {
          this.gridCells[i].classList.remove('stepPlaying')
        }
      }
    }
    console.log("updating grid...");

    for (let i = 0; i < this.beatwriter.cells.length; i++) {
      const cellElement = this.gridCells[i];

      // Update the cell's syllable content
      cellElement.textContent = this.beatwriter.cells[i].syllable;

      if (this.beatwriter.cells[i].isPlayable) {
        cellElement.classList.add('playable');

      } else {

        cellElement.classList.remove('playable');

      }
      if (this.beatwriter.cells[i].isCandidate && this.beatwriter.mode == 'arrange') {
        cellElement.classList.add('isCandidate');
      } else {
        this.beatwriter.cells[i].isCandidate = false;
        cellElement.classList.remove('isCandidate');
      }

      // Set focus and contenteditable based on the beatwriter.currentCell
      if (i == this.beatwriter.currentCell) {
        console.log("currentCell = " + i);
        cellElement.contentEditable = true;
        cellElement.focus();

      } else {
        cellElement.contentEditable = false;
      }
    }
    console.log("grid updated succesfully.");
  }
  getWord() {

    return this.gridCells[this.beatwriter.currentCell].textContent;
  }
}
console.log("gridView.js loaded.");