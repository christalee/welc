import type { Selection } from "react-aria-components";
import { getLibrary, type LibraryData, baseUrl } from "../utils";

import styles from "./libraryPath.module.scss";

function LibraryPath({
  libraryPath,
  setLibraryPath,
  libraryData,
  setLibraryData,
  setLibrarySelected,
  handlePlaySelected,
}: {
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
  libraryData: LibraryData[] | undefined;
  setLibraryData: React.Dispatch<
    React.SetStateAction<LibraryData[] | undefined>
  >;
  setLibrarySelected: React.Dispatch<
    React.SetStateAction<Selection>
  >;
  handlePlaySelected: () => Promise<void>;
}) {
  async function handleLibraryScan() {
    if (libraryData && libraryData.length > 0) {
      await handleLibraryDelete();
      setLibrarySelected(new Set());
    }
    await fetch(`${baseUrl}api/scan_library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    });
    await getLibrary({ libraryPath, setLibraryData });
  }

  async function handleLibraryDelete() {
    await fetch(`${baseUrl}api/delete_library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    });
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
        />
      </label>
      <button data-test="scanLibrary" onClick={handleLibraryScan}>
        {libraryData && libraryData.length > 0 ? "Rescan" : "Scan"}
      </button>
      <button data-test="clearLibrary" onClick={handleLibraryDelete}>
        Clear
      </button>
      <button data-test="playSelection" onClick={handlePlaySelected}>
        Play!
      </button>
    </div>
  );
}

export default LibraryPath;
