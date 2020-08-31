import * as React from 'react';
import * as ReactDOM from 'react-dom';
// @ts-ignore
import {Hopper} from 'ts-dsp';
import {FrequencyBandsApp} from './components/FrequencyBandsApp';

import {InteractiveAudioGraph, SVGPlot, Ruler, SignalGraph} from 'scrollable-graphs';

window.onload = () => {

  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);

  const app = <FrequencyBandsApp />

  ReactDOM.render(app, wrapper);
}
