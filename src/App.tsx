import { useState } from "react";
import { parseBlob, type IAudioMetadata } from "music-metadata";

import Metadata from "./components/Metadata";
import Player from "./components/Player";
import FileInput from "./components/FileInput";
import Playlist from "./components/Playlist";
import "./App.css";
import DirectoryInput from "./components/DirectoryInput";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [playing, setPlaying] = useState("");
  const [metadata, setMetadata] = useState<IAudioMetadata | undefined>(
    undefined,
  );

  async function startPlaying(filesArray: File[]) {
    setFiles(filesArray);
    setPlaying(window.URL.createObjectURL(filesArray[0]));
    await getMetadata(filesArray[0]);
  }

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
      await startPlaying(filesArray);
    }
  }

  async function handleDirectoryInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files).filter((file) =>
        file.type.includes("audio"),
      );
      await startPlaying(filesArray);
    }
  }

  async function handleEndOfPlay() {
    // don't run at the end of the last file, when files.length is 1
    if (files.length > 1) {
      await switchPlaying(1);
    } else {
      // clean up
      window.URL.revokeObjectURL(playing);
      setPlaying("");
      setMetadata(undefined);
      setFiles([]);
    }
  }

  async function handleFileNameClick(index: number) {
    await switchPlaying(index);
  }

  return (
    <>
      <section id="center">
        <h1>WeLC</h1>
        {metadata && <Metadata metadata={metadata} />}
        {files.length > 0 && (
          <Player playing={playing} handleEndOfPlay={handleEndOfPlay} />
        )}
        <div className="inputs">
          <DirectoryInput handleDirectoryInput={handleDirectoryInput} />
          <FileInput handleFileInput={handleFileInput} />
        </div>
        <Playlist files={files} handleFileNameClick={handleFileNameClick} />
      </section>
      <div className="ticks"></div>
      <section id="spacer">
        Made with 💙 by <a href="https://github.com/christalee">christalee</a>
      </section>
    </>
  );
}

export default App;
