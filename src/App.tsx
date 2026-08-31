import { useState } from "react";
import { parseBlob, type IAudioMetadata } from "music-metadata";
import { shuffle } from "lodash";

import Metadata from "./components/Metadata";
import Player from "./components/Player";
import FileInput from "./components/FileInput";
import Playlist from "./components/Playlist";
import DirectoryInput from "./components/DirectoryInput";
import Tabs from "./components/Tabs";
import LibraryPath from "./components/LibraryPath";
import Library from "./components/Library";
import { sortByNameAsc, sortByNameDesc } from "./utils";
import type { LibraryData } from "./utils";

import styles from "./App.module.scss";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [playing, setPlaying] = useState<string>("");
  const [metadata, setMetadata] = useState<IAudioMetadata | undefined>(
    undefined,
  );
  const [tab, setTab] = useState<string>("playlist");
  const [libraryPath, setLibraryPath] = useState<string>("");
  const [libraryData, setLibraryData] = useState<LibraryData>({
    files: [],
  });

  async function playFile(filesArray: File[], index: number) {
    const file = filesArray[index];
    setPlaying(window.URL.createObjectURL(file));
    await getMetadata(file);
  }

  async function startPlaying(filesArray: File[]) {
    const newFiles = [...files, ...filesArray];
    if (files.length === 0) {
      await playFile(newFiles, 0);
    }
    setFiles(newFiles);
  }

  async function switchPlaying(index: number) {
    window.URL.revokeObjectURL(playing);
    setFiles((prevFiles) => prevFiles.slice(index));
    await playFile(files, index);
  }

  async function getMetadata(file: File) {
    setMetadata(await parseBlob(file));
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files).sort(sortByNameAsc);
      await startPlaying(filesArray);
    }
  }

  async function handleDirectoryInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files)
        .filter((file) => file.type.includes("audio"))
        .sort(sortByNameAsc);
      await startPlaying(filesArray);
    }
  }

  async function handleEndOfFile() {
    if (files.length > 1) {
      // don't run at the end of the last file, when files.length is 1

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

  async function handleSortAsc() {
    const sorted = files.sort(sortByNameAsc);
    setFiles(sorted);
    await playFile(sorted, 0);
  }

  async function handleSortDesc() {
    const sorted = files.sort(sortByNameDesc);
    setFiles(sorted);
    await playFile(sorted, 0);
  }

  async function handleShuffle() {
    const shuffled = shuffle(files);
    setFiles(shuffled);
    await playFile(shuffled, 0);
  }

  const handleEmptyPlaylist = () => {
    window.URL.revokeObjectURL(playing);
    setPlaying("");
    setMetadata(undefined);
    setFiles([]);
  };

  return (
    <>
      <section className={styles.center}>
        <h1>WeLC</h1>
        {metadata && <Metadata metadata={metadata} />}
        {files.length > 0 && (
          <Player playing={playing} handleEndOfFile={handleEndOfFile} />
        )}
      </section>
      <section className={styles.tabbed}>
        <Tabs setTab={setTab} />
        <div className={styles.tabbedContainer}>
          {tab === "playlist" && (
            <>
              <div className={styles.inputs}>
                <DirectoryInput handleDirectoryInput={handleDirectoryInput} />
                <FileInput handleFileInput={handleFileInput} />
              </div>
              <Playlist
                files={files}
                handleSortAsc={handleSortAsc}
                handleSortDesc={handleSortDesc}
                handleShuffle={handleShuffle}
                handleEmptyPlaylist={handleEmptyPlaylist}
                handleFileNameClick={handleFileNameClick}
              />
            </>
          )}
          {tab === "library" && (
            <>
              <LibraryPath
                libraryPath={libraryPath}
                setLibraryPath={setLibraryPath}
                setLibraryData={setLibraryData}
              />
              <Library
                libraryPath={libraryPath}
                libraryData={libraryData}
                setLibraryData={setLibraryData}
              />
            </>
          )}
        </div>
      </section>
      <div className={styles.ticks}></div>
      <section className={styles.footer}>
        Made with 💙 by <a href="https://github.com/christalee">christalee</a>
      </section>
    </>
  );
}

export default App;
