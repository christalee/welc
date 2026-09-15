import { getLibrary, type LibraryData } from "../utils";

import styles from "./libraryPath.module.scss";

function LibraryPath({
  libraryPath,
  setLibraryPath,
  setLibraryData
}: {
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData>>;
}) {
  async function handleLibraryScan() {
    await fetch("/api/scan_library", {
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
    await fetch("/api/delete_library", {
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
      <button data-test="scanLibrary" onClick={handleLibraryScan}>Re/Scan</button>
      <button data-test="clearLibrary" onClick={handleLibraryDelete}>Clear</button>
    </div>
  );
}

export default LibraryPath;