// Fetch syllables for a given word directly from the text file
async function getSyllables(word) {
    console.log("Fetching syllables for word: " + word);
    let response;
    try {
        response = await fetch('Src/Syllables.txt'); // Corrected path
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error fetching the text file:', error);
        return [word];
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Log the first few lines of the text file
    console.log("First few lines of the text file:");
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        console.log(lines[i]);
    }

    const trimmedWord = word.trim().toLowerCase(); // Trim and lowercase the word for case-insensitive comparison
    console.log("Searching for word: " + trimmedWord);

    for (const line of lines) {
        const [fileWord, syllableStr] = line.split('=');
        if (fileWord && syllableStr) {
            const trimmedFileWord = fileWord.trim().toLowerCase(); // Trim and lowercase the file word
            if (trimmedFileWord === trimmedWord) {
                const syllableArray = syllableStr.trim().split(/[^a-zA-Z]+/);
                console.log("Word found in file: " + word + " with syllables: " + syllableArray);
                return syllableArray;
            }
        }
    }

    console.log("Word not found in file: " + word);
    return [word];
}
// ModeWrite class definition
class ModeWrite {
    constructor(beatwriter) {
        this.beatwriter = beatwriter;
    }

    async handleGridClick(cellIndex) {
        console.log("Grid cell clicked: " + cellIndex);
        if ('' != this.beatwriter.gridView.getWord()) {
            console.log("Processing word...");
            await this.processWord();
        } else {
            this.beatwriter.cells[this.beatwriter.currentCell].syllable = "";
            console.log("No word found. Clearing syllable.");
        }
        this.beatwriter.currentCell = cellIndex;
        console.log("Setting current cell to " + this.beatwriter.currentCell);
        this.beatwriter.gridView.updateGrid();
        this.selectTextIfPresent();
        this.beatwriter.gridView.focusCurrentCell();
    }

    async handleGridKeydown(key) {
        console.log("Keydown event: " + key);
        if ((key == 'Backspace' || key == " ") && this.beatwriter.gridView.getWord() == '') {
            console.log("Handling backspace or space with no word present.");
            this.beatwriter.cells[this.beatwriter.currentCell].syllable = '';
            if (key == "Backspace") {
                this.beatwriter.currentCell--;
            } else {
                this.beatwriter.currentCell++;
            }
            this.beatwriter.gridView.updateGrid();
            this.selectTextIfPresent();
            this.beatwriter.gridView.focusCurrentCell();
            return;
        } else if (key === ' ' || key === 'Enter') {
            if (this.beatwriter.gridView.getWord() == '') {
                console.log("Moving to next cell/row as no word is present.");
                this.beatwriter.currentCell++;
                if (key == 'Enter') {
                    this.moveToNextRow();
                }
            } else {
                console.log("Processing word due to space/enter key press.");
                await this.processWord();
                if (key === 'Enter') {
                    this.moveToNextRow();
                }
            }
            this.beatwriter.gridView.updateGrid();
            this.selectTextIfPresent();
        }
    }

    async processWord() {
        const word = this.beatwriter.gridView.getWord();
        console.log("Processing word: " + word);
        const syllables = await getSyllables(word);

        for (let i = 0; i < syllables.length; i++) {
            console.log("Setting syllable: " + syllables[i] + " at cell " + this.beatwriter.currentCell);
            this.beatwriter.cells[this.beatwriter.currentCell].syllable = syllables[i];
            this.beatwriter.currentCell++;
        }
        this.beatwriter.gridView.updateGrid();
        this.beatwriter.gridView.focusCurrentCell();
    }

    selectTextIfPresent() {
        if (this.beatwriter.cells[this.beatwriter.currentCell].syllable) {
            console.log("Selecting text at cell " + this.beatwriter.currentCell);
            this.beatwriter.gridView.setTextSelected(this.beatwriter.currentCell);
        }
    }

    moveToNextRow() {
        const nextRow = Math.floor((this.beatwriter.currentCell - 1) / 16) + 1;
        this.beatwriter.currentCell = nextRow * 16;
        console.log("Moving to next row. Current cell is now " + this.beatwriter.currentCell);
    }
}

console.log("modeWrite.js loaded.");