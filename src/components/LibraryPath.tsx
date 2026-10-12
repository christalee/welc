import { getLibrary, type LibraryData, baseUrl } from "../utils";

import styles from "./libraryPath.module.scss";

function LibraryPath({
  libraryPath,
  setLibraryPath,
  setLibraryData,
  handlePlaySelected,
}: {
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData[] | undefined>>;
  handlePlaySelected: () => Promise<void>;
}) {
  async function handleLibraryScan() {
    await fetch(`${baseUrl}/api/scan_library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    })
    await getLibrary({ libraryPath, setLibraryData });
  }

  async function handleLibraryDelete() {
    await fetch(`${baseUrl}/api/delete_library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    })
    setLibraryData(undefined);
  }

  return (
    <div className={styles.libraryPath}>
      <label className={styles.label}>
        Music Library Path:{" "}
        <input
        type="text"
        data-test="libraryPathField"
        value={libraryPath}
        onChange={(e) => setLibraryPath(e.target.value)}
      /></label>
      <button data-test="scanLibrary" onClick={handleLibraryScan}>Scan</button>
      <button data-test="clearLibrary" onClick={handleLibraryDelete}>Clear</button>
      <button data-test="playSelection" onClick={handlePlaySelected}>Play!</button>
    </div>
  );
}

export default LibraryPath;