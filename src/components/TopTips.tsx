import * as React from 'react';
import {FunctionComponent, useState, useEffect} from 'react';
import styled from 'styled-components';

const TipsBar = styled.div`
  position:absolute;
  bottom:0;
  left:0;
  background-color:black;
  color:white;
  padding:3px;
  svg {
    height:1em;
  }
`

export const TopTips:FunctionComponent = ({children}) => {
  const [n, setN] = useState(0);

  const tips = React.Children.toArray(children);

  useEffect(() => {
    const interval = setInterval(() => setN(n => n+1), 5000);
    return () => clearInterval(interval);
  });

  return <TipsBar>
    {tips[n%tips.length]}
  </TipsBar>
};
