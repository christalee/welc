import { useEffect, useState } from "react";

type LibraryData = {
  library: string;
};

function Library({ libraryPath }: { libraryPath: string }) {
  const [libraryData, setLibraryData] = useState<LibraryData>({
    library: libraryPath,
  });
  useEffect(() => {
    fetch("/api/library", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryPath,
      }),
    })
      .then((response) => response.json())
      .then((data) => setLibraryData(data));
  }, [libraryPath]);

  return libraryData && <p>{libraryData.library}</p>;
}

export default Library;
