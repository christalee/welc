import { useState } from "react";
import { parseBlob, type IAudioMetadata } from "music-metadata";
import "./App.css";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [playing, setPlaying] = useState("");
  const [metadata, setMetadata] = useState<IAudioMetadata | undefined>(
    undefined,
  );

  async function switchPlaying(index: number) {
    window.URL.revokeObjectURL(playing);
    setFiles((prevFiles) => prevFiles.slice(index));
    setPlaying(window.URL.createObjectURL(files[index]));
    await getMetadata(files[index]);
  }

  async function getMetadata(file: File) {
    setMetadata(await parseBlob(file));
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      setFiles(filesArray);
      setPlaying(window.URL.createObjectURL(filesArray[0]));
      await getMetadata(filesArray[0]);
    }
  }

  async function handleEndOfPlay() {
    if (files.length > 0) {
      await switchPlaying(1);
    }
  }

  async function handleFileNameClick(index: number) {
    await switchPlaying(index);
  }

  return (
    <>
      <section id="center">
        <h1>WeLC</h1>
        {metadata && (
          <>
            <p>Now playing:</p>
            <ul data-test="metadata" className="metadata">
              <li>Title: {metadata.common.title}</li>
              <li>Artist: {metadata.common.artist}</li>
              <li>Album: {metadata.common.album}</li>
              <li>Track #: {metadata.common.track.no}</li>
            </ul>
          </>
        )}
        {files.length > 0 && (
          <audio
            data-test="audio"
            controls
            autoPlay
            src={playing}
            onEnded={async () => await handleEndOfPlay()}
          ></audio>
        )}
        <input
          type="file"
          name="files"
          data-test="fileInput"
          accept="audio/*"
          multiple
          onChange={async (e) => await handleFileInput(e)}
        />
        <ul data-test="playlist" className="playlist">
          {files.length > 0 &&
            files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                onClick={async () => await handleFileNameClick(index)}
              >
                {file.name}
              </li>
            ))}
        </ul>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
