import * as React from 'react';
import {FunctionComponent, useState, useMemo} from 'react';
import {AudioDropZone} from './AudioDropZone';
// @ts-ignore
import {InteractiveAudioGraph, SVGPlot, SignalGraph, Ruler} from 'scrollable-graphs';
// @ts-ignore
import FrequencyBandWorker from 'worker-loader!../frequencyBandAnalysis.worker';

import './FrequencyBandsApp.scss';


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

        return `hsla(${hue}, 50%, 50%, ${alpha}`;
      });
    else
        return [];
  }, [graphs]);

  function handleWorkerMessage(e) {
    const message = e.data;
    if(message.event == 'done') {
      setPage('graph');
      console.log('graph data:', message.data);
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
      data: audiobuffer.getChannelData(0).buffer,
    }

    worker.onmessage = handleWorkerMessage;

    worker.postMessage({event: 'analyse', buffer: transferableAudio}, [transferableAudio.data]);

    setPage('loading');
  }

  if(page == 'drop')    
    return <AudioDropZone onDrop={handleAudio} />

  else if(page == 'loading') {
    return <div className="FrequencyBandsApp"><div className="analysePage">
      <h2>Analysing audio...</h2>
      <progress value={progress} max={1}>
        {Math.round(progress * 100)+'%'}
      </progress>
        </div></div>

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
      </div>

  } else
    return null
};
