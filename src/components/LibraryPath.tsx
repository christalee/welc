function LibraryPath({
  libraryPath,
  setLibraryPath,
}: {
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <>
      <input
        type="text"
        value={libraryPath}
        onChange={(e) => setLibraryPath(e.target.value)}
      />
    </>
  );
}

export default LibraryPath;