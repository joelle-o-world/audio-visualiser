// TODO: Allow passing an FFT stream so that other analyses can share resources.

import { Readable, Transform } from 'stream';
import {EventEmitter} from 'events';


import {Hopper, Windower, FFT, SpectralBandIntensity, collect, normalise} from 'ts-dsp';

const defaultCutOffs = [
  0, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 22000
]


export interface FrequencyBandAnalysisOptions {
  /** Size of FFT window to be used (in samples) */
  windowSize?: number;

  /** Spacing of the FFT frames/windows in time (in samples) */
  hopSize?: number;

  /** The cut off frequencies dividing the frequency bands. (in Hz) */
  cutOffFrequencies?: number[];
}


/**
 * Seperates an audio buffer into an arbitrary set of frequency bands and measures their intensity over time. Uses spectral (FFT) filters.
 */
export function frequencyBandAnalysis(
  audio: AudioBuffer,
  {
    windowSize=2048, 
    hopSize=441, 
    cutOffFrequencies=defaultCutOffs,
  }: FrequencyBandAnalysisOptions = {},
) {

  // Prepare audio for FFT stream
  const hopper = new Hopper( windowSize, hopSize );
  const windower = new Windower(windowSize);
  const fft = new FFT(windowSize);
  fft.setMaxListeners(cutOffFrequencies.length);
  hopper.pipe(windower).pipe(fft);

  // Set up frequency band filters.
  const bandFilters = [];
  for(let i=1; i<cutOffFrequencies.length; ++i) {
    let lo = cutOffFrequencies[i-1];
    let hi = cutOffFrequencies[i];
    let filter = new SpectralBandIntensity(lo, hi)
    const destructurer = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        callback(null, chunk.channelIntensities[0]);
      }
    })


    fft.pipe(filter)
    bandFilters.push(filter);
  }

  // Pass the audio to the hopper
  hopper.end(audio);

  const progressEmitter = new EventEmitter();
  hopper.on('data', chunk => {
    let progress = chunk.time / audio.length;
    progressEmitter.emit('progress', progress);
  });


  const promises = bandFilters.map(stream => collect(stream, 'channelIntensities.0').then(signal => normalise(signal)));

  return {promises, progressEmitter}

}
