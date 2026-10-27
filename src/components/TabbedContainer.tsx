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

import {
  type LibraryData,
  filterFiles,
  libraryPrefix,
  type FlatFileData,
} from "../utils";

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
  flatLibrary,
  setFlatLibrary,
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
  flatLibrary: FlatFileData[];
  setFlatLibrary: React.Dispatch<React.SetStateAction<FlatFileData[]>>;
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
            setFlatLibrary={setFlatLibrary}
            libraryData={libraryData}
            setLibraryData={setLibraryData}
            setLibrarySelected={setLibrarySelected}
            handlePlaySelected={handlePlaySelected}
          />
          <Library
            libraryPath={libraryPath}
            flatLibrary={flatLibrary}
            setFlatLibrary={setFlatLibrary}
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
  const [libraryPath, setLibraryPath] = useState<string>(libraryPrefix);
  const [flatLibrary, setFlatLibrary] = useState<FlatFileData[]>([]);
  const [libraryData, setLibraryData] = useState<LibraryData[] | undefined>(
    undefined,
  );
  const [librarySelected, setLibrarySelected] = useState<Selection>(new Set());

  async function handlePlaySelected() {
    await startPlaying(filterFiles(librarySelected));
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
    flatLibrary,
    setFlatLibrary,
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
          const lowerTitle = tab.title.toLowerCase();
          return (
            <Tab
              id={lowerTitle}
              key={`${lowerTitle}Title`}
              data-test={`${lowerTitle}Tab`}
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
          const lowerTitle = tab.title.toLowerCase();
          return (
            <TabPanel
              id={lowerTitle}
              key={`${lowerTitle}Content`}
              data-test={`${lowerTitle}Panel`}
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
