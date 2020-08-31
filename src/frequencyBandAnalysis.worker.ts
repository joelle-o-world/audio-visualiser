import {frequencyBandAnalysis} from './frequencyBandAnalysis';
import AudioBuffer from 'audiobuffer';


const ctx: Worker = self as any;

// Post data to parent thread

// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
  const sampleRate = event.data.buffer.sampleRate

  const data = new Float32Array(event.data.buffer.data);

  const audio = AudioBuffer.fromArray([data], sampleRate);

  const {promises, progressEmitter} = frequencyBandAnalysis(audio);

  progressEmitter.on('progress', progress => {

    ctx.postMessage({event:'progress', progress});
  });

  Promise.all(promises).then(results => {
    ctx.postMessage({event:'done', data:results});
  })

  ctx.postMessage({event: "start"});
});
