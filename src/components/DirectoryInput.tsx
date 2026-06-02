import styles from './directoryInput.module.scss';

function DirectoryInput({
  handleDirectoryInput,
}: {
  handleDirectoryInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
}) {
  return (
    <div className={styles.container}>
      <label htmlFor="directories">Select Directories</label>
      <input
        type="file"
        id="directories"
        name="directories"
        data-test="directoryInput"
        webkitdirectory="true"
        className={styles.input}
        onChange={async (e) => await handleDirectoryInput(e)}
      />
    </div>
  );
}

export default DirectoryInput;
