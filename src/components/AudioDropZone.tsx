import * as React from 'react';
import {FunctionComponent, useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';

// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;

const complaints = [
  null,
  "Please only drop one file at a time",
  "File is not an audio file",
  "Something went wrong reading the file", // aborted
  "Unable to read file", // error
  "There was a problem decoding the audio data",
]

const Container = styled.div`
  border: 1px dashed;
  background-color:#eee;

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

export interface DropZoneProps {
  onDrop: (audio:AudioBuffer) => void;
}

/**
 * Component for getting file input from the user.
 */
export const AudioDropZone:FunctionComponent<DropZoneProps> = props => {
  const [page, setPage] = useState('drop');
  const [complaint, setComplaint] = useState(null);

  const onDrop = useCallback( acceptedFiles => {
    if(acceptedFiles.length > 1)
      setComplaint(1);

    else if(acceptedFiles.length == 1) {
      const [file] = acceptedFiles;

      const reader = new FileReader();

      reader.onabort = () => setComplaint(3);
      reader.onerror = () => setComplaint(4);

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
            setComplaint(5);
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
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
      {
        complaint ? 
          <p>{complaints[complaint]}</p> :
          null
      }
    </Container>

  else if(page == 'decoding') 
    return <div>Decoding audio</div>
  
}
