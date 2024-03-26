class ParameterValue {
  constructor(name, defaultValue, minValue, maxValue, valType, callback = () => {}) {
    this.name = name;
    this._currentValue = defaultValue;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.valType = valType;
    this.callback = callback;
  }

  get currentValue() {
    return this._currentValue;
  }

  set currentValue(value) {
    this._currentValue = value;
    this.callback(); // Call the callback function when the value changes
  }
}