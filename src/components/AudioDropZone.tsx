import * as React from 'react';
import {FunctionComponent, useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import {keyframes} from 'styled-components';
import {RiDragDropLine} from 'react-icons/ri';
import {FaRegHandPointer} from 'react-icons/fa';

// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;

const complaints = {
  tooManyFiles: "Please only drop one file at a time",
  badFileType: "File is not an audio file",
  readAborted: "Something went wrong reading the file", // aborted
  readErrored: "Unable to read file", // error
  decodeError: "There was a problem decoding the audio data",
  noAudioFile: "Could not find any audio file."
}

const Blinking = keyframes`
  0% {
    opacity:1;
  }
  90% {
    opacity:1;
  }
  95% {
    opacity: 0;
  }
`


const Container = styled.div`
  border: 1px dashed;

  position:absolute;
  left: 0;
  right: 0;
  top:0;
  bottom:0;

  display: flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;

  p.instruction {
    font-size: 25px;
    margin-right:25px;
    margin-left:25px;
    text-align:center;
    animation: ${Blinking} 8s linear infinite;
    background-color:black;
    color: white;
    padding:3px;
    svg {
      vertical-align:middle;
      margin:5px;
    }
  }
`

const LoadingDiv = styled.div`
  color: white;
  background-color: #333;
  font-weight: bold;

  position:absolute;
  left: 0;
  right: 0;
  top:0;
  bottom:0;

  display: flex;
  flex-direction:column;
  justify-content:space-around;
  align-items:center;

  p {
    font-size: 20px;
  }
`

const ErrorMessage = styled.strong`
  display: block;
  color: red;
`

export interface DropZoneProps {
  onDrop: (audio:AudioBuffer) => void;
}

/**
 * Component for getting file input from the user.
 */
export const AudioDropZone:FunctionComponent<DropZoneProps> = props => {
  const [page, setPage] = useState('drop');
  const [complaint, setComplaint] = useState(null as null|keyof typeof complaints);

  const onDrop = useCallback( (acceptedFiles, ...args) => {
    console.log('yey', acceptedFiles, args);
    if(acceptedFiles.length == 0) {
      setComplaint('noAudioFile');
    }
    if(acceptedFiles.length > 1) {
      console.log('fuck');
      setComplaint('tooManyFiles');
    }

    else if(acceptedFiles.length == 1) {
      const [file] = acceptedFiles;

      const reader = new FileReader();

      reader.onabort = () => setComplaint('readAborted');
      reader.onerror = () => setComplaint('readErrored');

      reader.onload = () => {
        const arraybuffer = reader.result;

        if(typeof arraybuffer == 'string') 
          throw "Something bad happened";

        setPage('decoding');

        const ctx = new AudioContext
        ctx.decodeAudioData(
          arraybuffer, 
          audiobuffer => {
            props.onDrop(audiobuffer);
          },
          error => {
            setPage('drop');
            setComplaint('decodeError');
          }
        );
      }
      reader.readAsArrayBuffer(file);

    }
    
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: 'audio/*',
  })
 
  if(page == 'drop')
    return <Container {...getRootProps()}>
      <input {...getInputProps()} />
      { props.children ? props.children : null }
      {
        isDragActive ?
        <p className="instruction"><RiDragDropLine/>Drop the files here ...</p> :
          <p className="instruction"><RiDragDropLine/>Please drag & drop an audio file into this window, or click <FaRegHandPointer/> anywhere to select from your file system</p>
      }
      {
        complaint ? 
          <ErrorMessage>{complaints[complaint]}</ErrorMessage> :
          null
      }
    </Container>

  else if(page == 'decoding') 
    return <LoadingDiv>
      <p>Decoding audio...</p>
    </LoadingDiv>
  
}
