class GridView {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.gridContainer = document.getElementById('grid-container');
    this.gridStartMarkerContainer = document.getElementById("start-marker-container");
    this.gridStartMarkerLabelContainer = document.getElementById("start-marker-label-container");
    this.gridEndMarkerContainer = document.getElementById("end-marker-container");
    this.gridCells = [];
    this.gridStartMarkers = [];
    this.gridEndMarkers = [];
    this.generateGrid();
    console.log("gridView Instance successful");
  }

  generateGrid() {
    this.gridContainer.innerHTML = '';
    for (let i = 0; i < 16; i++) {

      const barLabel = document.createElement('div');
      barLabel.textContent = i + 1;
      const sMarker = document.createElement('div');

      const eMarker = document.createElement('div');
      if (i === 0) {
        
sMarker.classList.add('start-marker-active');
        eMarker.classList.add('end-marker-active');
      }

      barLabel.classList.add('bar-label');
      sMarker.classList.add('start-marker')
      eMarker.classList.add('end-marker');
      sMarker.addEventListener("click", (event) => this.handleStartMarkerClick(event));
      eMarker.addEventListener("click", (event) => this.handleEndMarkerClick(event));

      sMarker.dataset.index = i;
      eMarker.dataset.index = i;

      this.gridStartMarkerContainer.appendChild(barLabel);
 this.gridStartMarkerContainer.appendChild(sMarker);
this.gridEndMarkerContainer.appendChild(eMarker);
    }
    this.gridStartMarkers = document.querySelectorAll(".start-marker");
    this.gridEndMarkers = document.querySelectorAll(".end-marker");


    for (let i = 0; i < this.beatwriter.cells.length + 32; i++) {
      if (i < 16 || i > 271){

        const gridColumnLabel = document.createElement('div');
gridColumnLabel.classList.add("grid-column-label");
let col;
        
            if (i < 16) {
         col = i + 1;        
this.gridContainer.appendChild(gridColumnLabel);
          }else{
         col = i - 271;
this.gridContainer.appendChild(gridColumnLabel);
}
        gridColumnLabel.textContent = col;


      } else {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = [i - 16];
        cell.addEventListener('click', (event) => this.handleGridClick(event));
        cell.addEventListener('keydown', (event) => this.handleGridKeydown(event));
        this.gridContainer.appendChild(cell);
      }
    }

    this.gridCells = this.gridContainer.querySelectorAll(".grid-cell");

    console.log("gridCells and StartMarkers instantiated");
  }

  setTextSelected(cellIndex) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this.gridCells[cellIndex]);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  updateGrid() {

      if (this.beatwriter.mode === 'play') {    
for (let i = this.beatwriter.startMarkerPosition; i < this.beatwriter.endMarkerPosition + 1; i++) {

        if (this.beatwriter.cells[i].stepPlaying) {
 console.log("setting cell " + i + " to stepPlaying");         
this.gridCells[i].classList.add('step-playing');


        } else {
          this.gridCells[i].classList.remove('step-playing');
          
        }
      
      }
return;
    }
    const currentGridStartMarker = this.gridStartMarkerContainer.querySelector('.start-marker-active');
    if (currentGridStartMarker.dataset.index != this.beatwriter.startMarkerPosition) {
      currentGridStartMarker.classList.remove("start-marker-active");
      this.gridStartMarkers[this.beatwriter.startMarkerPosition / 16].classList.add("start-marker-active");
    }
    const currentGridEndMarker = this.gridEndMarkerContainer.querySelector('.end-marker-active');
    if (currentGridEndMarker.dataset.index != this.beatwriter.endMarkerPosition) {
      currentGridEndMarker.classList.remove("end-marker-active");
      this.gridEndMarkers[(this.beatwriter.endMarkerPosition - 16) / 16].classList.add("end-marker-active");
    }


    for (let i = 0; i < this.beatwriter.cells.length; i++) {

      const cellElement = this.gridCells[i];
      if (i > this.beatwriter.startMarkerPosition - 1 && i < this.beatwriter.endMarkerPosition) {
        cellElement.classList.add("is-playable");
      } else {
        cellElement.classList.remove("is-playable");
      }
      cellElement.textContent = this.beatwriter.cells[i].syllable;
      if (this.beatwriter.cells[i].isCandidate && this.beatwriter.mode == 'arrange') {
        cellElement.classList.add('is-candidate');
      } else {
        this.beatwriter.cells[i].isCandidate = false;
        cellElement.classList.remove('is-candidate');
      }

      // Set focus and contenteditable based on the beatwriter.currentCell
      if (i == this.beatwriter.currentCell && this.beatwriter.mode == 'write') {
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

  blurCells() {
    this.gridCells.forEach(cell => {
      cell.blur();
    });
  }

  setModeBorders() {
    console.log(this.beatwriter.mode);
    if (this.beatwriter.mode == 'arrange') {
      this.gridCells.forEach(cell => {
        cell.classList.add('mode-arrange');
      });
    } else {
      this.gridCells.forEach(cell => {
        cell.classList.remove('mode-arrange');
      });
    }

    console.log("borders set");


  }


  handleStartMarkerClick(event) {
    this.beatwriter.startMarkerPosition = event.target.dataset.index * 16;
    console.log("new start position : " + event.target.dataset.index);
    if (this.beatwriter.endMarkerPosition < this.beatwriter.startMarkerPosition + 1) {
      this.beatwriter.endMarkerPosition = this.beatwriter.startMarkerPosition + 16;
    }
    this.beatwriter.currentCell = this.beatwriter.startMarkerPosition;
    this.updateGrid();
  }
  handleEndMarkerClick(event) {
    this.beatwriter.endMarkerPosition = event.target.dataset.index * 16 + 16;
    console.log("new end position : " + event.target.dataset.index);
    if (this.beatwriter.endMarkerPosition < this.beatwriter.startMarkerPosition + 1) {
      this.beatwriter.endMarkerPosition = this.beatwriter.startMarkerPosition + 16;
    }
    this.updateGrid();

  }


  handleGridClick(event) {
    console.log("grid click recd by gridview");
    if (this.beatwriter.mode == 'write') {
      console.log("sending to modewrite");
      this.beatwriter.modeWrite.handleGridClick(event.target.dataset.index);

    } else if (this.beatwriter.mode == 'arrange') {
      console.log("sending to modeArrange");
      this.beatwriter.modeArrange.handleGridClick(event.target.dataset.index);

    }
  }

  handleGridKeydown(event) {
    if (this.beatwriter.mode == 'write') {

      if (event.key == ' ' || event.key == 'Enter' || event.key == "Backspace") {
        this.beatwriter.modeWrite.handleGridKeydown(event.key);
      }
    }

  }
}
console.log("gridView.js loaded.");