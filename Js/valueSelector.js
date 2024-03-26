class ValueSelector {
    constructor(gridView, lcdContainer, parameterValues, fileManager) {
        this.gridView = gridView;
        this.lcdContainer = lcdContainer;
        this.parameterValues = parameterValues;
        this.fileManager = fileManager;
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
        // Store the current selection start and end positions
        const selectionStart = this.lcdDisplay.selectionStart;
        const selectionEnd = this.lcdDisplay.selectionEnd;

        // Keep only digits and dots
        let validInput = this.lcdDisplay.value.replace(/[^\d.]/g, '');

        // If the input value is a dot at the beginning, add a leading zero
        if (validInput.startsWith('.')) {
            validInput = '0' + validInput;
        }

        // Update the value of the input element without reversing it
        this.lcdDisplay.value = validInput;

        // Calculate the new cursor position based on the difference in text length
        const diff = validInput.length - (selectionEnd - selectionStart);
        const newSelectionStart = Math.max(0, Math.min(selectionStart + diff, validInput.length));

        // Set the new selection range to adjust the cursor position
        this.lcdDisplay.setSelectionRange(newSelectionStart, newSelectionStart);
    }

    handleLcdDisplayClick() {
        this.lcdDisplay.focus();
        this.lcdDisplay.select();
    }

    handleLcdDisplayKeyDown(event) {
        if (event.key === 'Enter') {
            this.lcdDisplay.blur();
        }
    }

    handleToggleButtonClick() {
        let currentIndex = Array.from(this.lightArray).findIndex((element) => element.classList.contains("mode-active"));
        let nextIndex = (currentIndex + 1);

        if (nextIndex == 3) {
            nextIndex = 0;
        }
        console.log("nextIndex: " + nextIndex);
        this.lightArray[currentIndex].classList.remove("mode-active");
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
        const inputValue = parseFloat(this.lcdDisplay.value);
        if (!isNaN(inputValue)) {
            const clampedValue = Math.max(this.activeValue.minValue, Math.min(this.activeValue.maxValue, inputValue));
            this.activeValue.currentValue = clampedValue;
        } else {
            // Display an error message or revert to the previous valid value
            console.error('Invalid input value');
            // Optionally, revert to the previous valid value:
            // this.lcdDisplay.value = this.activeValue.currentValue;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.gridView.updateGrid();
        console.log("updating display yeah.");
        this.lcdDisplay.value = this.activeValue.currentValue;
        this.fileManager.saveToLocalStorage();
    }
}
console.log("valueSelector.js loaded");