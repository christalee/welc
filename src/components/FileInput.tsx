import styles from './fileInput.module.scss';

function FileInput({
  handleFileInput,
}: {
  handleFileInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
}) {
  return (
    <div className={styles.container}>
      <label htmlFor="files">Select Files</label>
      <input
        type="file"
        id="files"
        name="files"
        data-test="fileInput"
        accept="audio/*"
        multiple
        className={styles.input}
        onChange={async (e) => await handleFileInput(e)}
      />
    </div>
  );
}

export default FileInput;
