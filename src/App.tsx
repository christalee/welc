import { useState } from "react";
import { parseBlob, type IAudioMetadata } from "music-metadata";
import { shuffle } from "lodash";

import Metadata from "./components/Metadata";
import Player from "./components/Player";
import TabbedContainer from "./components/TabbedContainer";
import { sortByNameAsc, sortByNameDesc } from "./utils";

import styles from "./App.module.scss";

function App() {
  const [files, setFiles] = useState<(string | File)[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<IAudioMetadata | undefined>(
    undefined,
  );

  async function playFile(filesArray: (string | File)[], index: number) {
    const file = filesArray[index];
    if (typeof file === "string") {
      await fetch("/api/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file,
        }),
      }).then(async function(response) {
        const reader = response.body?.getReader();
        const chunks = [];
        while (reader) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value);
        }
        const blob = new File(chunks, file);
        setPlaying(window.URL.createObjectURL(blob));
        await getMetadata(blob);
      });
    } else {
      setPlaying(window.URL.createObjectURL(file));
      await getMetadata(file);
    }
  }

  async function startPlaying(filesArray: (string | File)[]) {
    const newFiles = [...files, ...filesArray];
    if (files.length === 0) {
      await playFile(newFiles, 0);
    }
    setFiles(newFiles);
  }

  async function switchPlaying(index: number) {
    if (playing) {
      window.URL.revokeObjectURL(playing);
    }
    setFiles((prevFiles) => prevFiles.slice(index));
    await playFile(files, index);
  }

  async function getMetadata(file: File) {
    setMetadata(await parseBlob(file));
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
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
      handleEmptyPlaylist();
    }
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
    if (playing) {
      window.URL.revokeObjectURL(playing);
    }
    setPlaying("");
    setMetadata(undefined);
    setFiles([]);
  };

  return (
    <>
      <section className={styles.center}>
        <h1>WeLC</h1>
        {metadata && <Metadata metadata={metadata} />}
        {files.length > 0 && playing && (
          <Player playing={playing} handleEndOfFile={handleEndOfFile} />
        )}
      </section>
      <section className={styles.tabbed}>
        <TabbedContainer
          handleDirectoryInput={handleFileInput}
          handleFileInput={handleFileInput}
          files={files}
          handleSortAsc={handleSortAsc}
          handleSortDesc={handleSortDesc}
          handleShuffle={handleShuffle}
          handleEmptyPlaylist={handleEmptyPlaylist}
          handleFileNameClick={switchPlaying}
          startPlaying={startPlaying}
        />
      </section>
      <div className={styles.ticks}></div>
      <section className={styles.footer}>
        Made with 💙 by <a href="https://github.com/christalee">christalee</a>
      </section>
    </>
  );
}

export default App;
