// cell.js

class Cell {
  constructor(uniqueId) {
    this.uniqueId = uniqueId;
    this.syllable = '';
    this.isCandidate = false;
    this.stepPlaying = false;
 
  }
 static fromJSON(data) {
    const cell = new Cell(data.uniqueId);
    cell.syllable = data.syllable;
    cell.isCandidate = data.isCandidate;
    return cell;
  }
}


;
console.log("cell.js loaded");