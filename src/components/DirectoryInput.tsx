// Uses identical styles to the other input
import styles from './fileInput.module.scss';

function DirectoryInput({
  handleDirectoryInput,
}: {
  handleDirectoryInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
}) {
  return (
    <>
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
    </>
  );
}

export default DirectoryInput;
