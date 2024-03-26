class BPMCalculator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    async calculateBPM(audioFilePath) {
        try {
            const { audioBuffer, sampleRate } = await this.loadAudioFile(audioFilePath);
            if (!audioBuffer || !sampleRate) {
                throw new Error("Error loading audio file");
            }
            
            console.log("Calculating BPM...");
            const sliceDuration = 45;
            const sliceStart = 60;
            const sliceEnd = sliceStart + sliceDuration;
            console.log("Getting slices...");
            const slices = await this.getSlice(audioBuffer, sliceStart, sliceEnd);
            
            // Extract times of slices with highest samples
            const peakTimes = slices.map(slice => slice.time);
            console.log("Peak Times:" + peakTimes);
            
            // Calculate BPM from peak times
            const bpm = this.calculateBPMFromPeaks(peakTimes);
            console.log("BPM calculation complete:" + bpm);
            
            return bpm;
        } catch (error) {
            console.error("Error calculating BPM:" + error);
            throw error;
        }
    }

    async loadAudioFile(filePath) {
        try {
            const baseUrl = window.location.href.replace(/\/[^\/]*$/, '/');
            const audioUrl = new URL(filePath, baseUrl).href;

            console.log("Loading audio file from:" + audioUrl);
            const response = await fetch(audioUrl);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const arrayBuffer = await response.arrayBuffer();
            console.log("ArrayBuffer:" + arrayBuffer);

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const sampleRate = audioBuffer.sampleRate;
            console.log("Sample Rate:" + sampleRate);

            return { audioBuffer, sampleRate };
        } catch (error) {
            console.error("Error loading audio file:" + error);
            return null;
        }
    }

 async getSlice(audioBuffer, startTime, endTime) {
    const slices = [];
    const sampleRate = audioBuffer.sampleRate;
    const sliceDuration = 1; // 1 second slice duration
    const tolerance = 0.01; // Tolerance range around the highest amplitude

    for (let t = startTime; t < endTime; t += sliceDuration) {
        const startFrame = Math.floor(t * sampleRate);
        const endFrame = Math.min(Math.floor((t + sliceDuration) * sampleRate), audioBuffer.length);
        const slice = audioBuffer.getChannelData(0).subarray(startFrame, endFrame);
        
        let highestSample = -Infinity;
        let highestSampleTime = 0;
        
        // Find the highest sample in the slice
        for (let i = 0; i < slice.length; i++) {
            const sample = slice[i];
            if (sample > highestSample) {
                highestSample = sample;
                highestSampleTime = (startFrame + i) / sampleRate; // Calculate time of highest sample
            }
        }
        
        console.log("Highest Amplitude in Slice:", highestSample.toFixed(2)); // Log the highest amplitude in the slice rounded to two decimal places
        console.log("Time of Highest Amplitude:", highestSampleTime); // Log the time of the highest amplitude
        
        // Record all samples within the tolerance range of the highest amplitude in the slice
        const matchingSamples = slice
            .map((sample, index) => ({ sample, time: (startFrame + index) / sampleRate }))
            .filter(({ sample }) => Math.abs(sample - highestSample) <= tolerance);
        
        slices.push(...matchingSamples); // Add all matching samples to slices array
    }

    console.log("Slices:", slices);
    return slices;
}

    calculateBPMFromPeaks(peakTimes) {
        const timeDifferences = [];

        for (let i = 1; i < peakTimes.length; i++) {
            const timeDiff = peakTimes[i] - peakTimes[i - 1];
            timeDifferences.push(timeDiff);
        }

        const timeDifferenceCounts = {};
        for (let i = 0; i < timeDifferences.length; i++) {
            const timeDiff = timeDifferences[i];
            timeDifferenceCounts[timeDiff] = (timeDifferenceCounts[timeDiff] || 0) + 1;
        }

        let modeTimeDifference;
        let maxCount = 0;
        for (const timeDiff in timeDifferenceCounts) {
            if (timeDifferenceCounts[timeDiff] > maxCount) {
                modeTimeDifference = Number(timeDiff);
                maxCount = timeDifferenceCounts[timeDiff];
            }
        }

        const bpm = 60 / modeTimeDifference;

        console.log("Mode Time Difference:" + modeTimeDifference);
        console.log("BPM:" + bpm);
        return bpm;
    }
}