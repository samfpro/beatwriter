

class ValueController {
  constructor(beatwriter, upButton, downButton, valueElement, valueUpdater, initialValue = 120, incrementStep = 1) {
    this.beatwriter = beatwriter;
    console.log("initialValue: " + initialValue);
console.log(LCD_MODE_RAT);
    this.value = initialValue;
    this.incrementStep = incrementStep;
    this.intervalId = null;
    this.valueElement = valueElement;
    this.upButton = upButton;
    this.downButton = downButton;
    this.valueUpdater = valueUpdater;

    this.initializeEventListeners();
    this.updateDisplay();
    console.log("vc instantiated.");
  }

  initializeEventListeners() {
    this.upButton.addEventListener('click', () => this.incrementValue());
    this.downButton.addEventListener('click', () => this.decrementValue());

  console.log("vc event listeners initialized.")
}

  incrementValue() {
    this.value = parseInt(this.valueElement.innerText, 10);
    this.value += this.incrementStep;
    this.updateDisplay();
    this.valueUpdater(this.value); // Call the callback to update the parent variable
  }

  decrementValue() {
    this.value = parseInt(this.valueElement.innerText, 10);
    this.value -= this.incrementStep;
    this.updateDisplay();
    this.valueUpdater(this.value); // Call the callback to update the parent variable
  }

updateDisplay() {
    console.log("lcdDisplayMode: " + this.beatwriter.lcdDisplayMode); 
    switch (this.beatwriter.lcdDisplayMode) {
      case LCD_MODE_BPM:
        console.log("Updating display for BPM");
        this.valueElement.innerText = this.beatwriter.currentBPM;
        break;
      case LCD_MODE_VOC:
        console.log("Updating display for VOC");
        this.valueElement.innerText = this.beatwriter.modePlay.ttsSpeakingVoice;
        break;
      case LCD_MODE_RAT:
        console.log("Updating display for RAT");
        this.valueElement.innerText = this.beatwriter.modePlay.ttsSpeakingRate;
        break;
      default:
        console.error("Invalid lcdDisplayMode");
        // Handle default case or log an error
        break;
    }
  }
}

console.log("valueController.js loaded");