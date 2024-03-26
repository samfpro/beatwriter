class FFT {
  constructor(size) {
    this.size = size;
  }

  // Perform the FFT operation on the provided audio samples
  forward(audioChannelData) {
    const real = audioChannelData.slice(); // Copy the input array
    const imag = new Array(this.size).fill(0); // Initialize imaginary part with zeros
    this.fftRecursive(real, imag, 0, this.size, 1); // Perform FFT recursively
  }

  // Recursive function for FFT computation
  fftRecursive(real, imag, start, size, stride) {
    if (size < 2) return; // Base case

    // Perform FFT on even and odd indices separately
    const halfSize = size / 2;
    this.fftRecursive(real, imag, start, halfSize, stride * 2);
    this.fftRecursive(real, imag, start + stride, halfSize, stride * 2);

    // Combine results of even and odd FFTs
    for (let i = 0; i < halfSize; i++) {
      const evenIndex = start + i * stride;
      const oddIndex = evenIndex + halfSize * stride;
      const theta = -2 * Math.PI * i / size; // Twiddle factor
      const wReal = Math.cos(theta);
      const wImag = Math.sin(theta);
      const tempReal = real[oddIndex] * wReal - imag[oddIndex] * wImag;
      const tempImag = real[oddIndex] * wImag + imag[oddIndex] * wReal;
      real[oddIndex] = real[evenIndex] - tempReal;
      imag[oddIndex] = imag[evenIndex] - tempImag;
      real[evenIndex] += tempReal;
      imag[evenIndex] += tempImag;
    }
  }

  // Calculate the spectrum from the FFT results
  get spectrum() {
    const spectrum = [];
    for (let i = 0; i < this.size; i++) {
      spectrum.push(Math.sqrt(real[i] * real[i] + imag[i] * imag[i]));
    }
    return spectrum;
  }
}