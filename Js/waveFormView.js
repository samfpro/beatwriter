class WaveFormView {
    constructor(beatwriter) {
        this.beatwriter = beatwriter;
        console.log(beatwriter.beatTrack);
        this.audioFile = beatwriter.beatTrack;
        this.waveformCanvas = document.getElementById('waveform-canvas');
        this.regionCanvas = document.getElementById('region-canvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
        this.regionCtx = this.regionCanvas.getContext('2d');
        this.audioDurationInSeconds = 0;
        this.ac = beatwriter.ac;
        this.drawWaveForm(beatwriter.beatTrack);
    }

    drawWaveForm(audioFile) {
        
    this.audioFile = audioFile;
    console.log("drawing waveform for" + this.audioFile.fileName);
        const canvasWidth = this.waveformCanvas.width;
        const canvasHeight = this.waveformCanvas.height;
       

        (async () => {
            try {
         console.log("fetching audioFile for drawing");       
         const response = await fetch(this.audioFile.fileUrl);
         console.log("gotem." + response);       
                
         console.log("awaiting array buffer for drawing");       
const buffer = await response.arrayBuffer();
         console.log("gotem.");       
                
         console.log("awaiting aujo decode");       

const decodedData = await this.ac.decodeAudioData(buffer);
         console.log("gotem.");       
                this.audioDurationInSeconds = decodedData.duration;

                const data = decodedData.getChannelData(0);
                const step = Math.ceil(data.length / canvasWidth);
                const amp = canvasHeight / 2;
                this.waveformCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                this.waveformCtx.lineWidth = 1;
                this.waveformCtx.strokeStyle = 'green';
                         console.log("megan du paff");       
                this.waveformCtx.beginPath();
                let x = 0;
                for (let i = 0; i < canvasWidth; i++) {
                    let min = 1.0;
                    let max = -1.0;
                    for (let j = 0; j < step; j++) {
                        const datum = data[(i * step) + j];
                        if (datum < min) min = datum;
                        if (datum > max) max = datum;
                    }
                    this.waveformCtx.moveTo(x, (1 + min) * amp);
                    this.waveformCtx.lineTo(x, (1 + max) * amp);
                    x += 1;
                }
                this.waveformCtx.stroke();
            } catch (error) {
                console.error('Error fetching or decoding audio file:', error);
            }
        })();
        this.drawRegions();
    }

    drawRegions() {
        const canvasWidth = this.regionCanvas.width;
        const barsToDisplay = 18;
        const secondsPerBar = 240 / this.beatwriter.bpm.currentValue;
        const totalBars = this.audioDurationInSeconds / secondsPerBar;
        const startPositionInSeconds = this.beatwriter.beatTrackOffsetMS.currentValue / 1000 +
            this.beatwriter.beatTrackLeadInBars.currentValue * secondsPerBar;
        const startPositionPercentage = (startPositionInSeconds / this.audioDurationInSeconds) * 100;
        const totalRegionWidth = canvasWidth * (barsToDisplay / totalBars);
        const xOffset = (startPositionPercentage / 100) * canvasWidth;
        const startMarkerPosition = this.beatwriter.startMarkerPosition;
        const endMarkerPosition = this.beatwriter.endMarkerPosition;
        const x = xOffset + (startMarkerPosition / 16) / 18 * totalRegionWidth;
        const y = xOffset + (endMarkerPosition / 16) / 18 * totalRegionWidth;

        this.regionCtx.clearRect(0, 0, canvasWidth, this.regionCanvas.height);

        this.regionCtx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Red box color with alpha
        this.regionCtx.fillRect(xOffset, 0, totalRegionWidth, this.regionCanvas.height); // Red box
        this.regionCtx.fillStyle = 'rgba(255, 255, 255, 0.5'; // Green box color with alpha
        this.regionCtx.fillRect(x, 0, y - x, this.regionCanvas.height); // Green box
    }
}

console.log("waveformview.js loaded");