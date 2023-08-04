class ModePlay {
  constructor(beatwriter) {
    this.beatwriter = beatwriter;
    this.dataArray = this.beatwriter.cells;
    this.bpmPickerValue = 120; // Default BPM value, you can change it as needed
    this.ticksPerBeat = 4; // 4 1/16 ticks per beat
    this.tickDelay = (60 * 1000) / (this.ticksPerBeat * this.bpmPickerValue); // Delay in milliseconds per 1/16 tick
  }

  // Step 1: Generate the sound files and update the objects in the array
  createSoundFile(syllable) {
    // Implement your text-to-speech utility here, returning the file path of the generated sound file.
  }

  generateSoundFiles() {
    this.dataArray.forEach((obj) => {
      if (obj.stringProperty && !obj.soundFilePath) {
        // Check if the sound file already exists in your library to avoid duplicates.
        // If it doesn't exist, create the sound file and save it locally.
        obj.soundFilePath = this.createSoundFile(obj.stringProperty);
      }
    });
  }

  // Step 2: Set up a timed sequence to play the sound files
  playSoundFile(filePath) {
    // Implement code to play the sound file using an audio library or an HTML5 audio element.
  }

  // Step 3: Function to play the timed sequence of sound files
  playSoundSequence() {
    let index = 0;

    const playNextSound = () => {
      if (index < this.dataArray.length) {
        const obj = this.dataArray[index];
        if (obj.stringProperty) {
          this.playSoundFile(obj.soundFilePath);
        }

        index++;
        setTimeout(playNextSound, obj.stringProperty ? this.tickDelay : this.tickDelay * 2); // Add pause for empty strings
      }
    };

    playNextSound();
  }

  // Step 4: Call the function to play the sound sequence
  start() {
    this.generateSoundFiles();
    this.playSoundSequence();
  }
}



