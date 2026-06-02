import styles from './playlist.module.scss';

function Playlist({
  files,
  handleFileNameClick,
}: {
  files: File[];
  handleFileNameClick: (index: number) => Promise<void>;
}) {
  if (files.length === 0) return null;
  return (
    <ul data-test="playlist" className={styles.playlist}>
      {files.map((file, index) => (
        <li
          key={`${file.name}-${index}`}
          onClick={async () => await handleFileNameClick(index)}
        >
          {file.name}
        </li>
      ))}
    </ul>
  );
}

export default Playlist;
