import * as React from 'react';
import {FunctionComponent, useState, useMemo} from 'react';
import {AudioDropZone} from './AudioDropZone';
// @ts-ignore
import {InteractiveAudioGraph, SVGPlot, SignalGraph, Ruler} from 'scrollable-graphs';
// @ts-ignore
import FrequencyBandWorker from 'worker-loader!../frequencyBandAnalysis.worker';
import {GithubLink} from './GithubLink';
import {TopTips} from './TopTips';

// @ts-ignore
import ExampleWaveform from '../images/example.png';
import './FrequencyBandsApp.scss';
import {AiOutlineZoomIn} from 'react-icons/ai';
import {IoMdColorPalette} from 'react-icons/io';
import {BsMusicNoteBeamed} from 'react-icons/bs';

export const FrequencyBandsApp:FunctionComponent = props => {
  const [page, setPage] = useState('drop');
  const [progress, setProgress] = useState(0);
  const [audio, setAudio] = useState(null);
  const [graphs, setGraphs] = useState(null);

  const colors = useMemo(() => {
    if(graphs)
      return graphs.map((s, i) => {
        let hue = Math.round(i * 256 / graphs.length);
        let alpha = 1 - (i / graphs.length) * 4/5;

        return `hsla(${hue}, 50%, 50%, ${alpha})`;
      });
    else
        return [];
  }, [graphs]);

  

  function handleWorkerMessage(e) {
    const message = e.data;
    if(message.event == 'done') {
      e.target.terminate();
      setPage('graph');
      setGraphs(message.data);

    } else if(message.event == 'progress') {
      setProgress(message.progress);
    }
  }

  function handleAudio(audiobuffer:AudioBuffer) {

    const worker = new FrequencyBandWorker();
    setAudio(audiobuffer);

    const transferableAudio= {
      sampleRate: audiobuffer.sampleRate,
      data: audiobuffer.getChannelData(0).slice().buffer,
    }

    worker.onmessage = handleWorkerMessage;

    worker.postMessage({event: 'analyse', buffer: transferableAudio}, [transferableAudio.data]);

    setPage('loading');
  }

  if(page == 'drop')    
    return <div className="FrequencyBandsApp"><AudioDropZone onDrop={handleAudio}>
      <img src={ExampleWaveform} className="backdrop" />
      <section className='description'>
        <h1>audio-visualiser</h1>
          <p>Use this app to explore an interactive graph of the frequency content in an audio file. An audio signal is made up of energy which is distributed across the frequency spectrum and across time. In this app, time is represented along the left-to-right axis and frequency energy is represented using colour. Low frequency sound energy (bass) is represented using low frequency colour (red); high frequency sound energy (treble) is represented using high frequency colour (blue/violet). The rest of the rainbow/colour-spectrum fills out the frequencies in-between.</p>

        <p>For best results, use Google Chrome or Safari on a computer. Use trackpad scrolling to zoom in/out and get a more microscopic view of the audio. 
        </p>
      </section>
        </AudioDropZone><GithubLink/></div>

  else if(page == 'loading') {
    return <div className="FrequencyBandsApp darkmode"><div className="analysePage">
      <h2>🧐 Analysing audio...</h2>
      <progress value={progress} max={1}>
        {Math.round(progress * 100)+'%'}
        </progress>
          </div>
            <GithubLink/>
      </div>

  } else if (page == 'graph' && graphs && audio) {
    return <div className="FrequencyBandsApp">
      <InteractiveAudioGraph tMin={0} tMax={audio.duration} tLeft={0} tRight={audio.duration} audio={audio}>
        <SVGPlot>
          {graphs.map((graph, i) => <SignalGraph
            color={colors[i]} 
            data={graph} 
            interval={.01} 
            renderStyle="reflectAndFill"
            key={Math.random()} 
          />)}
          <Ruler/>
        </SVGPlot>
        </InteractiveAudioGraph>
        <TopTips>
          <li><AiOutlineZoomIn/> Scroll with your trackpad to zoom in/out and move left/right</li>
            <li><IoMdColorPalette/>The colours of the rainbow correspond to the different frequency bands.</li>
            <li><BsMusicNoteBeamed/>Click on the graph to start playing audio at that point</li>
          <li style={{color:"hsl(0, 75%, 50%)"}}>Low frequency energy is marked using the red end of the colour spectrum</li>
          <li style={{color:"hsl(230, 75%, 50%)"}}>High frequency energy is marked using the blue/violet end of the colour spectrum</li> 
        </TopTips>
        <GithubLink/>
      </div>

  } else
    return null
};
