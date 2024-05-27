fft(real, imag) {
    const size = real.length;
    if (size <= 1) return;

    const halfSize = size / 2;

    // Split signal into even and odd parts
    const evenReal = new Float32Array(halfSize);
    const evenImag = new Float32Array(halfSize);
    const oddReal = new Float32Array(halfSize);
    const oddImag = new Float32Array(halfSize);
    for (let i = 0; i < halfSize; i++) {
        evenReal[i] = real[i * 2];
        evenImag[i] = imag[i * 2];
        oddReal[i] = real[i * 2 + 1];
        oddImag[i] = imag[i * 2 + 1];
    }

    // Recursively compute FFT on even and odd parts
    this.fft(evenReal, evenImag);
    this.fft(oddReal, oddImag);

    // Combine results
    for (let k = 0; k < halfSize; k++) {
        const tReal = Math.cos(-2 * Math.PI * k / size);
        const tImag = Math.sin(-2 * Math.PI * k / size);
        const evenComplexReal = evenReal[k];
        const evenComplexImag = evenImag[k];
        const oddComplexReal = oddReal[k] * tReal - oddImag[k] * tImag;
        const oddComplexImag = oddReal[k] * tImag + oddImag[k] * tReal;
        
        // Add logging statements to inspect intermediate values
        console.log(`k: ${k}, tReal: ${tReal}, tImag: ${tImag}, evenComplexReal: ${evenComplexReal}, evenComplexImag: ${evenComplexImag}, oddComplexReal: ${oddComplexReal}, oddComplexImag: ${oddComplexImag}`);

        real[k] = evenComplexReal + oddComplexReal;
        imag[k] = evenComplexImag + oddComplexImag;
        real[k + halfSize] = evenComplexReal - oddComplexReal;
        imag[k + halfSize] = evenComplexImag - oddComplexImag;
    }
}