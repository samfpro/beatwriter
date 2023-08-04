//-----project files---------//
// -----------------beatWriter.js

class Beatwriter {
  constructor() {
    // Initialize any necessary properties here
    this.cells = []; // Initialize the cells array here
    for (let i = 0; i < 256; i++) {
      // Initialize each cell as a Cell object
      this.cells.push(new Cell(i));
    }
    this.gridView = new GridView(this); // Create an instance of the gridView class
    this.mode = 'write'; // Set the initial mode to 'write'
    this.currentCell = 0; // Set the initial current cell index to 0
    this.curCelPlaceHolder = 0;
    this.modeWrite = new ModeWrite(this); // Create an instance of modeWrite class
    this.modeArrange = new ModeArrange(this); // Create an instance of modeArrange class
    this.initializeEventListeners(); // Set up event listeners
    this.gridView.updateGrid(); // Updated to show the initial grid
  }

  // Other functions will go here...

  initializeEventListeners() {
    // Add event listener for the mode toggle button
    const toggleButton = document.getElementById('toggle-mode-button');
    toggleButton.addEventListener('click', () => {
      this.toggleMode();
    });

    this.gridView.gridContainer.addEventListener('click', (event) => {
      if (this.mode === 'write') {
        const cellElement = event.target;
        const cellIndex = Array.from(cellElement.parentNode.children).indexOf(cellElement);
        this.currentCell = cellIndex;
        this.modeWrite.handleGridClickWriteMode(cellIndex);
      } else if (this.mode === 'arrange') {
        // Pass the event to modeArrange
        this.modeArrange.handleGridClickArrangeMode(event);
      }
    });

    // Add event listener for the keydown event
    this.gridView.gridContainer.addEventListener('keydown', (event) => {
      if (this.mode === 'write') {
        this.modeWrite.handleKeyDown(event);
      }
    });
  }

  // Function to switch between write and arrange modes
 toggleMode() {
  this.mode = this.mode === 'write' ? 'arrange' : 'write';
  const modeTextDiv = document.querySelector('.mode-text');
  modeTextDiv.textContent = `Current Mode: ${this.mode.charAt(0).toUpperCase() + this.mode.slice(1)} Mode`;

  if (this.mode === 'arrange') {
    console.log("switching to arrange mode.");
    this.curCelPlaceHolder = this.currentCell;
    this.currentCell = 256;
    console.log("done. currentCell set to " + this.currentCell);
  } else if (this.mode === 'write') {
    console.log("switching to write mode");
    this.currentCell = this.curCelPlaceHolder;
    this.modeArrange.resetCandidateCells(); // Fixed the reference to modeArrange
    this.modeArrange.moveFromIndex = null; // Fixed the reference to modeArrange
    this.modeArrange.moveToIndex = null; // Fixed the reference to modeArrange
    console.log("done.");
  }

  this.gridView.updateGrid(); // Move this line here to update the grid after the mode is toggled
}
}

this.beatwriter = new Beatwriter();
