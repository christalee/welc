import type { IAudioMetadata } from "music-metadata";

function Metadata({ metadata }: { metadata: IAudioMetadata }) {
  return (
    <>
      <p>Now playing:</p>
      <ul data-test="metadata" className="metadata">
        <li>Title: {metadata.common.title}</li>
        <li>Artist: {metadata.common.artist}</li>
        <li>Album: {metadata.common.album}</li>
        <li>Track #: {metadata.common.track.no}</li>
      </ul>
    </>
  );
}

export default Metadata;
