import { useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SelectionIndicator,
  type Selection,
} from "react-aria-components";

import DirectoryInput from "./DirectoryInput";
import FileInput from "./FileInput";
import Playlist from "./Playlist";
import LibraryPath from "./LibraryPath";
import Library from "./Library";

import type { LibraryData } from "../utils";

import styles from "./tabbedContainer.module.scss";

const hydrateTabs = ({
  handleDirectoryInput,
  handleFileInput,
  files,
  handleSortAsc,
  handleSortDesc,
  handleShuffle,
  handleEmptyPlaylist,
  handleFileNameClick,
  libraryPath,
  setLibraryPath,
  libraryData,
  setLibraryData,
  librarySelected,
  setLibrarySelected,
  handlePlaySelected,
}: {
  handleDirectoryInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  handleFileInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  files: (string | File)[];
  handleSortAsc: () => Promise<void>;
  handleSortDesc: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  handleEmptyPlaylist: () => void;
  handleFileNameClick: (index: number) => Promise<void>;
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
  libraryData: LibraryData[] | undefined;
  setLibraryData: React.Dispatch<
    React.SetStateAction<LibraryData[] | undefined>
  >;
  librarySelected: Selection;
  setLibrarySelected: React.Dispatch<React.SetStateAction<Selection>>;
  handlePlaySelected: () => Promise<void>;
}) => {
  return [
    {
      title: "Playlist",
      content: (
        <>
          <div className={styles.inputs}>
            <DirectoryInput handleDirectoryInput={handleDirectoryInput} />
            <FileInput handleFileInput={handleFileInput} />
          </div>
          <Playlist
            files={files}
            handleSortAsc={handleSortAsc}
            handleSortDesc={handleSortDesc}
            handleShuffle={handleShuffle}
            handleEmptyPlaylist={handleEmptyPlaylist}
            handleFileNameClick={handleFileNameClick}
          />
        </>
      ),
    },
    {
      title: "Library",
      content: (
        <>
          <LibraryPath
            libraryPath={libraryPath}
            setLibraryPath={setLibraryPath}
            setLibraryData={setLibraryData}
            handlePlaySelected={handlePlaySelected}
          />
          <Library
            libraryPath={libraryPath}
            libraryData={libraryData}
            setLibraryData={setLibraryData}
            selected={librarySelected}
            setSelected={setLibrarySelected}
          />
        </>
      ),
    },
  ];
};

function TabbedContainer({
  handleDirectoryInput,
  handleFileInput,
  files,
  handleSortAsc,
  handleSortDesc,
  handleShuffle,
  handleEmptyPlaylist,
  handleFileNameClick,
  startPlaying,
}: {
  handleDirectoryInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  handleFileInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  files: (string | File)[];
  handleSortAsc: () => Promise<void>;
  handleSortDesc: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  handleEmptyPlaylist: () => void;
  handleFileNameClick: (index: number) => Promise<void>;
  startPlaying: (filesArray: (string | File)[]) => Promise<void>;
}) {
  const [libraryPath, setLibraryPath] = useState<string>("");
  const [libraryData, setLibraryData] = useState<LibraryData[] | undefined>(
    undefined,
  );
  const [librarySelected, setLibrarySelected] = useState<Selection>(new Set());

  async function handlePlaySelected() {
    // librarySelected is a set of strings but we map String to satisfy the type checker
    await startPlaying(Array.from(librarySelected).map((key) => String(key)));
  }

  const tabs = hydrateTabs({
    handleDirectoryInput,
    handleFileInput,
    files,
    handleSortAsc,
    handleSortDesc,
    handleShuffle,
    handleEmptyPlaylist,
    handleFileNameClick,
    libraryPath,
    setLibraryPath,
    libraryData,
    setLibraryData,
    librarySelected,
    setLibrarySelected,
    handlePlaySelected,
  });

  return (
    <Tabs>
      <TabList className={styles.container}>
        {tabs.map((tab) => {
          return (
            <Tab
              id={tab.title.toLowerCase()}
              key={`${tab.title.toLowerCase()}Title`}
              data-test={`${tab.title.toLowerCase()}Tab`}
              className={styles.tab}
            >
              {tab.title}
              <SelectionIndicator className={styles.selected} />
            </Tab>
          );
        })}
      </TabList>
      <TabPanels className={styles.tabPanels}>
        {tabs.map((tab) => {
          return (
            <TabPanel
              id={tab.title.toLowerCase()}
              key={`${tab.title.toLowerCase()}Content`}
              data-test={`${tab.title.toLowerCase()}Panel`}
            >
              {tab.content}
            </TabPanel>
          );
        })}
      </TabPanels>
    </Tabs>
  );
}

export default TabbedContainer;
