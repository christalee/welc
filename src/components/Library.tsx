import { useEffect, useState } from "react";

type LibraryData = {
  files: string[];
};

function Library({ libraryPath }: { libraryPath: string }) {
  const [libraryData, setLibraryData] = useState<LibraryData>({
    files: [],
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
