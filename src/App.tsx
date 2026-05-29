import { useState } from 'react'
import './App.css'

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [playing, setPlaying] = useState('');

  const handleFileSelect = (e) => {
    const filesArray: File[] = Array.from(e.target.files);
    setFiles(filesArray);
    setPlaying(window.URL.createObjectURL(filesArray[0]));
  }

  const handleEndOfPlay = () => {
    if (files.length > 0) {
      window.URL.revokeObjectURL(playing)
      setFiles((prevFiles) => prevFiles.slice(1));
      setPlaying(window.URL.createObjectURL(files[1]))
    }
  }

  return (
    <>
      <section id="center">
        {files.length > 0 && (<audio controls autoPlay src={playing} onEnded={handleEndOfPlay}></audio>)}
        <input type="file" name="files" accept="audio/*" multiple onChange={handleFileSelect} />
        <ul>
          {files.length > 0 && files.map((file, index) => (<li key={`${file.name}-${index}`}>{file.name}</li>))}
        </ul>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
