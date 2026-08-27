import styles from "./libraryPath.module.scss";

function LibraryPath({
  libraryPath,
  setLibraryPath,
}: {
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleLibraryScan = () => {
    fetch("/api/scan_library", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    })
  }

  const handleLibraryDelete = () => {
    fetch("/api/delete_library", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    })
  }

  return (
    <div className={styles.libraryPath}>
      <label>
        Music Library Path:{" "}
        <input
        type="text"
        value={libraryPath}
        onChange={(e) => setLibraryPath(e.target.value)}
      /></label>
      <button onClick={handleLibraryScan}>Re/Scan</button>
      <button onClick={handleLibraryDelete}>Clear</button>
    </div>
  );
}

export default LibraryPath;