import { Tabs, TabList, Tab, TabPanels, TabPanel, SelectionIndicator } from "react-aria-components";

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
}: {
  handleDirectoryInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  handleFileInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  files: File[];
  handleSortAsc: () => Promise<void>;
  handleSortDesc: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  handleEmptyPlaylist: () => void;
  handleFileNameClick: (index: number) => Promise<void>;
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
  libraryData: LibraryData;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData>>;
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
          />
          <Library
            libraryPath={libraryPath}
            libraryData={libraryData}
            setLibraryData={setLibraryData}
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
  libraryPath,
  setLibraryPath,
  libraryData,
  setLibraryData,
}: {
  handleDirectoryInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  handleFileInput: (
    e: React.ChangeEvent<HTMLInputElement, Element>,
  ) => Promise<void>;
  files: File[];
  handleSortAsc: () => Promise<void>;
  handleSortDesc: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  handleEmptyPlaylist: () => void;
  handleFileNameClick: (index: number) => Promise<void>;
  libraryPath: string;
  setLibraryPath: React.Dispatch<React.SetStateAction<string>>;
  libraryData: LibraryData;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData>>;
}) {
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
