
class BPMCalculator {
    constructor() {
        console.log("Initializing BPMCalculator...");
        this.audioContext = new AudioContext();
        this.peakThreshold = 0.8; // Adjust manually (between 0 and 1)
        console.log("BPMCalculator initialized successfully.");
    }

    async calculateBPM(audioFilePath) {
        try {
            console.log("Calculating BPM...");
            const audioData = await fetch(audioFilePath);
            console.log("Audio file fetched successfully.");
            const arrayBuffer = await audioData.arrayBuffer();
            console.log("Audio data loaded successfully.");

            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 2048;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyser.getFloatTimeDomainData(dataArray); // Get time-domain data

            // Find peaks
            const peaks = [];
            for (let i = 1; i < bufferLength - 1; i++) {
                if (dataArray[i] > this.peakThreshold && dataArray[i] > dataArray[i - 1] && dataArray[i] > dataArray[i + 1]) {
                    peaks.push(i);
                }
            }

            // Calculate intervals between peaks
            const peakIntervals = peaks.map((peak, index, array) => index === 0 ? peak : peak - array[index - 1]);

            // Calculate mode of peak intervals
            const modeInterval = calculateModeInterval(peakIntervals);

            // Calculate BPM
            const bpm = calculateBPMFromInterval(modeInterval, this.audioContext.sampleRate);

            console.log('BPM: ' + bpm.toFixed(2));

        } catch (error) {
            console.error('Error calculating BPM: ' + error);
            throw error;
        }
    }
}

function calculateModeInterval(intervals) {
    const intervalCounts = {};
    intervals.forEach(interval => {
        intervalCounts[interval] = (intervalCounts[interval] || 0) + 1;
    });

    let modeInterval;
    let maxCount = 0;

    for (const interval in intervalCounts) {
        if (intervalCounts[interval] > maxCount) {
            maxCount = intervalCounts[interval];
            modeInterval = parseFloat(interval);
        }
    }

    return modeInterval;
}

function calculateBPMFromInterval(interval, sampleRate) {
    return 60 / (interval / sampleRate);
}

console.log("BPMCalculator class loaded");

