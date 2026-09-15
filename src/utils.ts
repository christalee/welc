export const sortByNameAsc = (a: File, b: File) => {
  if (a.name > b.name) {
    return 1;
  } else if (a.name < b.name) {
    return -1;
  }
  return 0;
};

export const sortByNameDesc = (a: File, b: File) => {
  if (a.name < b.name) {
    return 1;
  } else if (a.name > b.name) {
    return -1;
  }
  return 0;
};

export type LibraryData = {
  name: string;
  filepath: string;
  metadata: {
    title: string;
    artist: string;
    album: string;
    year: string;
    track: number;
    length: number;
    genre: string;
  };
  children: LibraryData[];
};

export async function getLibrary({
  libraryPath,
  setLibraryData,
}: {
  libraryPath: string;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData | undefined>>;
}) {
  await fetch("/api/library", {
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
}
