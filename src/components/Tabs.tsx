import styles from "./tabs.module.scss";

const tabs = [
  {
    title: "Playlist",
    value: "playlist",
  },
  {
    title: "Library",
    value: "library",
  },
];

function Tabs({
  setTab,
}: {
  setTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className={styles.container}>
      {tabs.map((tab) => {
        return (
          <div
            key={tab.value}
            className={styles.tab}
            onClick={() => setTab(tab.value)}
          >
            {tab.title}
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
