import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownShortWide,
  faArrowDownWideShort,
  faShuffle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { parseFilename } from "../utils";

import styles from "./playlist.module.scss";

function Playlist({
  files,
  handleSortAsc,
  handleSortDesc,
  handleShuffle,
  handleEmptyPlaylist,
  handleFileNameClick,
}: {
  files: (string | File)[];
  handleSortAsc: () => Promise<void>;
  handleSortDesc: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  handleEmptyPlaylist: () => void;
  handleFileNameClick: (index: number) => Promise<void>;
}) {
  if (files.length === 0) return null;
  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <FontAwesomeIcon
          icon={faArrowDownShortWide}
          className={styles.control}
          onClick={handleSortAsc}
          data-test="sortAsc"
        />
        <FontAwesomeIcon
          icon={faArrowDownWideShort}
          className={styles.control}
          onClick={handleSortDesc}
          data-test="sortDesc"
        />
        <FontAwesomeIcon
          icon={faShuffle}
          className={styles.control}
          onClick={handleShuffle}
          data-test="shuffle"
        />
        <FontAwesomeIcon
          icon={faTrash}
          className={styles.control}
          onClick={handleEmptyPlaylist}
          data-test="trash"
        />
      </div>
      <ul data-test="playlistFiles" className={styles.playlist}>
        {files.map((file, index) => (
          <li
            key={`${typeof file === "string" ? parseFilename(file, import.meta.env.VITE_MUSIC_DIR) : file.name}-${index}`}
            onClick={async () => await handleFileNameClick(index)}
          >
            {typeof file === "string"
              ? parseFilename(file, import.meta.env.VITE_MUSIC_DIR)
              : file.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlist;
