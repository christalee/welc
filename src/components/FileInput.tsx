function FileInput({
  handleFileInput,
}: {
  handleFileInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
}) {
  return (
    <input
      type="file"
      name="files"
      data-test="fileInput"
      accept="audio/*"
      multiple
      onChange={async (e) => await handleFileInput(e)}
    />
  );
}

export default FileInput;
