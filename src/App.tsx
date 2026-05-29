import { useState } from "react";
import "./App.css";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [playing, setPlaying] = useState("");

  const switchPlaying = (index: number) => {
    window.URL.revokeObjectURL(playing);
    setFiles((prevFiles) => prevFiles.slice(index));
    setPlaying(window.URL.createObjectURL(files[index]));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      setFiles(filesArray);
      setPlaying(window.URL.createObjectURL(filesArray[0]));
    }
  };

  const handleEndOfPlay = () => {
    if (files.length > 0) {
      switchPlaying(1);
    }
  };

  const handleFileNameClick = (index: number) => {
    switchPlaying(index);
  };

  return (
    <>
      <section id="center">
        {files.length > 0 && (
          <audio
            controls
            autoPlay
            src={playing}
            onEnded={handleEndOfPlay}
          ></audio>
        )}
        <input
          type="file"
          name="files"
          accept="audio/*"
          multiple
          onChange={handleFileInput}
        />
        <ul>
          {files.length > 0 &&
            files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                onClick={() => handleFileNameClick(index)}
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
