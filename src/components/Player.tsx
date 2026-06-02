function Player({
  playing,
  handleEndOfPlay,
}: {
  playing: string;
  handleEndOfPlay: () => Promise<void>;
}) {
  return (
    <audio
      data-test="audio"
      controls
      autoPlay
      src={playing}
      onEnded={async () => await handleEndOfPlay()}
    ></audio>
  );
}

export default Player;
