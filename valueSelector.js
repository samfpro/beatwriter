class ValueSelector {
  constructor(gridView, lcdContainer, parameterValues) {
    this.gridView = gridView;
    this.lcdContainer = lcdContainer;
    this.parameterValues = parameterValues;
    console.log(parameterValues);
    this.activeValue = parameterValues[0]; // Assuming the first parameter is the default active value
    this.toggleButton = lcdContainer.querySelector(".toggle-button");
    this.lightArray = lcdContainer.querySelectorAll(".light");
    this.lcdDisplay = lcdContainer.querySelector(".lcd-display");
    this.lcdDisplay.contentEditable = true;

    this.upButton = lcdContainer.querySelector(".lcd-up-btn");
    this.downButton = lcdContainer.querySelector(".lcd-down-btn");

    this.toggleButton.addEventListener("click", () => this.handleToggleButtonClick());
    this.upButton.addEventListener("click", () => this.handleUpButtonClick());
    this.downButton.addEventListener("click", () => this.handleDownButtonClick());
    this.lcdDisplay.addEventListener('blur', () => this.handleLcdDisplayBlur());
    this.lcdDisplay.addEventListener('click', () => this.handleLcdDisplayClick());

    this.lcdDisplay.addEventListener('input', () => this.handleLcdDisplayInput());
    this.lcdDisplay.addEventListener('keydown', (event) => this.handleLcdDisplayKeyDown(event));
  }

  handleLcdDisplayInput() {
    const validInput = this.lcdDisplay.textContent.replace(/[^\d.]/g, ''); // Keep only digits and dots
    this.lcdDisplay.textContent = validInput;
  }

  handleLcdDisplayClick() {
    this.lcdDisplay.focus();
    document.execCommand('selectAll', false, null);
  }

  handleLcdDisplayKeyDown(event) {
    if (event.key === 'Enter') {
      this.lcdDisplay.blur();
    }
  }

  handleToggleButtonClick() {
    let index = Array.from(this.lightArray).findIndex((element) => element.classList.contains("mode-active"));
    let nextIndex = (index + 1);

    if (nextIndex == 3) {
      nextIndex = 0;
    }
    console.log("nextIndex: " + nextIndex);
    this.lightArray[index].classList.remove("mode-active");
    this.lightArray[nextIndex].classList.add("mode-active");
    this.activeValue = this.parameterValues[nextIndex];
    this.updateDisplay();
  }

  handleUpButtonClick() {
    if (this.activeValue.valType === 'integer') {
      this.activeValue.currentValue = Math.min(this.activeValue.currentValue + 1, this.activeValue.maxValue);
    } else if (this.activeValue.valType === 'float') {
      this.activeValue.currentValue = Math.min(this.activeValue.currentValue + 0.1, this.activeValue.maxValue);
    }
    console.log("activeValue.currentValue" + this.activeValue.currentValue);

    this.updateDisplay();
  }

  handleDownButtonClick() {
    if (this.activeValue.valType === 'integer') {
      this.activeValue.currentValue = Math.max(this.activeValue.currentValue - 1, this.activeValue.minValue);
    } else if (this.activeValue.valType === 'float') {
      this.activeValue.currentValue = Math.max(this.activeValue.currentValue - 0.1, this.activeValue.minValue);
    }
    console.log("activeValue.currentValue" + this.activeValue.currentValue);
    this.updateDisplay();
  }

  handleLcdDisplayBlur() {
    const inputValue = parseFloat(this.lcdDisplay.textContent);
    if (!isNaN(inputValue)) {
      this.activeValue.currentValue = Math.max(this.activeValue.minValue, Math.min(this.activeValue.maxValue, inputValue));
    }
    this.updateDisplay();
  }

  updateDisplay() {
    this.gridView.updateGrid();
    console.log("updating display yeah.");
    this.lcdDisplay.textContent = this.activeValue.currentValue;
  }
}