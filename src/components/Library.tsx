import { useEffect } from "react";
import { getLibrary } from "../utils";

import type { LibraryData } from "../utils";

function Library({
  libraryPath,
  libraryData,
  setLibraryData,
}: {
  libraryPath: string;
  libraryData: LibraryData;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData>>;
}) {
  useEffect(() => {
    async function checkLibrary() {
      if (libraryPath.length > 0) {
        await getLibrary({ libraryPath, setLibraryData });
      }
    }
    checkLibrary();
  }, [libraryPath, setLibraryData]);

  return (
    libraryData && (
      <ul>
        {libraryData.files.map((file) => (
          <li key={file}>{decodeURI(file)}</li>
        ))}
      </ul>
    )
  );
}

export default Library;
