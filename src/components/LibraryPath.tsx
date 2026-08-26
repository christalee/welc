import styles from "./libraryPath.module.scss";

function LibraryPath({
  libraryPath,
  setLibraryPath,
}: {
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className={styles.libraryPath}>
      <label>
        Music Library Path:{" "}
        <input
        type="text"
        value={libraryPath}
        onChange={(e) => setLibraryPath(e.target.value)}
      /></label>
    </div>
  );
}

export default LibraryPath;