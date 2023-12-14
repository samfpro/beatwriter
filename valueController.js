class ValueController {
  constructor(controlPanel) {
    this.controlPanel = controlPanel;
    this.lcdContainer = document.getElementById("lcd-container");
    this.valueButton = this.lcdContainer.querySelector("#lcd-button");
    this.upButton = document.getElementById("lcd-up-btn");
    this.downButton = this.lcdContainer.querySelector("#lcd-down-btn");
    this.lcdDisplay = this.lcdContainer.querySelector("#lcd-display");
    this.lcdLightB = this.lcdContainer.querySelector("#lcd-light-b");
    this.lcdLightV = this.lcdContainer.querySelector("#lcd-light-v");
    this.lcdLightR = this.lcdContainer.querySelector("#lcd-light-r");

    this.bpmValue = {
      value: this.controlPanel.beatwriter.currentBPM,
      min: 0,
      max: 200,
      type: 'integer',
      light: this.lcdLightB
    };

    this.ttsVoiceValue = {
      value: this.controlPanel.beatwriter.modePlay.ttsSpeakingVoice,
      min: 1,
      max: 10,
      type: 'integer',
      light: this.lcdLightV
    };

    this.ttsRateValue = {
      value: this.controlPanel.beatwriter.modePlay.ttsSpeakingRate,
      min: 1,
      max: 10,
      type: 'float',
      light: this.lcdLightR
    };

    this.values = {
      val1: this.bpmValue,
      val2: this.ttsVoiceValue,
      val3: this.ttsRateValue
    }

    this.activeValObject = this.values.val1;
    this.initializeEventListeners();
    this.updateDisplay();
  }

  initializeEventListeners() {
    this.valueButton.addEventListener('click', () => this.handleValueButtonClick());
    this.upButton.addEventListener('click', () => this.incrementValue());
    this.downButton.addEventListener('click', () => this.decrementValue());
  }

  incrementValue() {
    const valueToChange = this.activeValObject.value;
    if (this.activeValObject.type == 'integer') {
      this.activeValObject.value += 1;
    } else if (this.activeValObject.type == 'float') {
      this.activeValObject.value = parseFloat((this.activeValObject.value + 0.1).toFixed(1));
    }
    this.updateDisplay();
  }

  decrementValue() {
    const valueToChange = this.activeValObject.value;
    if (this.activeValObject.type == 'integer') {
      this.activeValObject.value -= 1;
    } else if (this.activeValObject.type == 'float') {
      this.activeValObject.value = parseFloat((this.activeValObject.value - 0.1).toFixed(1));
    }
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.activeValObject.type =='float'){
      this.lcdDisplay.textContent = this.activeValObject.value.toFixed(1);
    }else if(this.activeValObject.type == 'integer'){
      this.lcdDisplay.textContent =this.activeValObject.value;
    }// Round to one decimal place
    Object.values(this.values).forEach((valObj) => {
      if (valObj != this.activeValObject) {
        valObj.light.classList.remove("val-active");
      } else {
        valObj.light.classList.add("val-active");
      }

    });
  }


  handleValueButtonClick() {
    switch (this.activeValObject) {
      case this.bpmValue:
        this.activeValObject = this.ttsVoiceValue;
        break;
      case this.ttsVoiceValue:
        this.activeValObject = this.ttsRateValue;
        break;
      case this.ttsRateValue:
        this.activeValObject = this.bpmValue;
        break;
    }
    this.updateDisplay();
  }
}

console.log("valueController.js loaded");