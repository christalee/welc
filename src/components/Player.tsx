function Player({
  playing,
  handleEndOfFile,
}: {
  playing: string;
  handleEndOfFile: () => Promise<void>;
}) {
  return (
    <audio
      data-test="audio"
      controls
      autoPlay
      src={playing}
      onEnded={async () => await handleEndOfFile()}
    ></audio>
  );
}

export default Player;
