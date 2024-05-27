class BpmCalculator {
    constructor() {
        this.audioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100 * 45, 44100);
        this.fftSizes = [2048, 4096, 8192]; // Different FFT sizes to try
        this.renderTimeout = 10000; // 10 seconds timeout for rendering
    }

    async calculateBpm(audioUrl) {
        console.log("Starting BPM calculation for: " + audioUrl);

        try {
            const audioBuffer = await this._fetchAndDecodeAudio(audioUrl);
            const trimmedBuffer = this._extractCenterAudio(audioBuffer, 45);
            const peaks = await this._analyzePeaks(trimmedBuffer);
            const bpm = this._calculateBpmFromPeaks(peaks);
            console.log("Estimated BPM: " + bpm);
            return bpm;
        } catch (error) {
            console.error("Error during BPM calculation: " + error);
        }
    }

    async _fetchAndDecodeAudio(audioUrl) {
        console.log("Fetching audio from: " + audioUrl);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        console.log("Audio fetched, decoding...");
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log("Audio decoded");
        return audioBuffer;
    }

    _extractCenterAudio(audioBuffer, durationInSeconds) {
        console.log("Extracting center audio...");
        const sampleRate = audioBuffer.sampleRate;
        const centerStart = Math.max((audioBuffer.length - sampleRate * durationInSeconds) / 2, 0);
        const trimmedBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels, sampleRate * durationInSeconds, sampleRate
        );

        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            trimmedBuffer.copyToChannel(audioBuffer.getChannelData(i).subarray(centerStart, centerStart + sampleRate * durationInSeconds), i, 0);
        }

        console.log("Center audio extracted");
        return trimmedBuffer;
    }

    async _analyzePeaks(audioBuffer) {
        console.log("Analyzing peaks...");
        const peaks = [];

        for (const fftSize of this.fftSizes) {
            console.log("Trying FFT size: " + fftSize);
            const offlineContext = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = offlineContext.createAnalyser();
            analyser.fftSize = fftSize;
            analyser.smoothingTimeConstant = 0.0;

            source.connect(offlineContext.destination);
            source.start(0);

            try {
                const renderedBuffer = await this._startRenderingWithTimeout(offlineContext, this.renderTimeout);

                const channelData = renderedBuffer.getChannelData(0);
                const step = Math.floor(channelData.length / fftSize);

                for (let i = 0; i < channelData.length; i += step) {
                    const segment = channelData.slice(i, i + step);
                    const peak = this._findPeak(segment);
                    peaks.push({ amplitude: peak, timestamp: i });
                }

                if (peaks.length > 0) {
                    break;
                }
            } catch (error) {
                console.error("Rendering failed or timed out for FFT size: " + fftSize);
            }
        }

        console.log("Peaks detected: " + JSON.stringify(peaks));
        return peaks;
    }

    async _startRenderingWithTimeout(context, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error("Rendering timed out"));
            }, timeout);

            context.startRendering().then(buffer => {
                clearTimeout(timer);
                resolve(buffer);
            }).catch(error => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    _findPeak(data) {
        let max = -Infinity;
        for (let i = 0; i < data.length; i++) {
            if (data[i] > max) {
                max = data[i];
            }
        }
        return max;
    }

_calculateBpmFromPeaks(peaks) {
    console.log("Calculating BPM from peaks...");

    peaks.sort((a, b) => b.amplitude - a.amplitude);
    const highestPeak = peaks[0].amplitude;
    const threshold = highestPeak - 0.05;

    const filteredPeaks = peaks.filter(peak => peak.amplitude >= threshold);
    console.log("Filtered peaks: " + JSON.stringify(filteredPeaks));

    filteredPeaks.sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp
    console.log("Sorted filtered peaks by timestamp: " + JSON.stringify(filteredPeaks));

    const intervals = [];
    for (let i = 1; i < filteredPeaks.length; i++) {
        const interval = filteredPeaks[i].timestamp - filteredPeaks[i - 1].timestamp;
        if (interval > 10000) {
            intervals.push(interval);
        }
    }

    console.log("Intervals between peaks (longer than 1000): " + JSON.stringify(intervals));

    const modeInterval = this._calculateMode(intervals);
    let bpm = (60 * this.audioContext.sampleRate) / modeInterval;
    while (bpm < 60) {
        bpm *= 2;
    }
    while (bpm > 120) {
        bpm /= 2;
    }

    return Math.round(bpm);
}

    _calculateMode(array) {
        const frequency = {};
        let maxFreq = 0;
        let mode = array[0];

        array.forEach(value => {
            frequency[value] = (frequency[value] || 0) + 1;
            if (frequency[value] > maxFreq) {
                maxFreq = frequency[value];
                mode = value;
            }
        });
        console.log("Mode: " + mode);
        return mode;
    }
}

