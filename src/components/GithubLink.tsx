import * as React from 'react';
import {FunctionComponent} from 'react';
import {AiFillGithub, AiFillBug} from 'react-icons/ai';



export const GithubLink:FunctionComponent = () => <div className='source-code-link'>
  <a href="https://github.com/joelyjoel/audio-visualiser"><AiFillGithub /> view source code</a>
  /
    <a href="https://github.com/joelyjoel/audio-visualiser/issues"><AiFillBug/>report a bug</a>
</div>

