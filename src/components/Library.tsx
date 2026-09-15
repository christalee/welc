import { useEffect } from "react";
import {
  Table,
  TableHeader,
  Column,
  Row,
  TableBody,
  Cell,
  CheckboxButton,
  ResizableTableContainer,
  Button,
  ColumnResizer,
  CheckboxField,
  Collection,
} from "react-aria-components";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { getLibrary, type LibraryData } from "../utils";

import styles from "./library.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const parseFilename = (filepath: string, libraryPath: string) => {
  const uri = decodeURI(filepath);
  const url = new URL(uri);
  // add 1 to slice the trailing /
  return decodeURIComponent(url.pathname).slice(libraryPath.length + 1);
};

function Library({
  libraryPath,
  libraryData,
  setLibraryData,
}: {
  libraryPath: string;
  libraryData: LibraryData | undefined;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData | undefined>>;
}) {
  useEffect(() => {
    async function checkLibrary() {
      if (libraryPath.length > 0) {
        await getLibrary({ libraryPath, setLibraryData });
      }
    }
    checkLibrary();
  }, [libraryPath, setLibraryData]);

  return (
    libraryData && (
      <ResizableTableContainer className={styles.tableContainer}>
        <Table
          data-test="libraryData"
          selectionMode="multiple"
          treeColumn="filename"
          aria-label="libraryData"
          className={styles.table}
          style={{ width: "100%" }}
        >
          <TableHeader>
            <Column id="checkbox" maxWidth={25}>
              <CheckboxField slot="selection" className={styles.checkboxField}>
                <CheckboxButton>{""}</CheckboxButton>
              </CheckboxField>
            </Column>
            <Column id="filename" isRowHeader>
              <div className={styles.columnHeader}>
                Name <ColumnResizer className={styles.resizer} />
              </div>
            </Column>
            <Column id="artist">
              <div className={styles.columnHeader}>
                Artist <ColumnResizer className={styles.resizer} />
              </div>
            </Column>
            <Column id="album">
              <div className={styles.columnHeader}>
                Album <ColumnResizer className={styles.resizer} />
              </div>
            </Column>
            <Column id="year" maxWidth={60}>
              Year
            </Column>
          </TableHeader>
          <TableBody items={libraryData.children} dependencies={[libraryData]}>
            {function renderItem(item) {
              return (
                <Row key={item.filepath} id={item.filepath}>
                  <Cell>
                    <CheckboxField
                      slot="selection"
                      className={styles.checkboxField}
                    >
                      <CheckboxButton>{""}</CheckboxButton>
                    </CheckboxField>
                  </Cell>
                  <Cell className={styles.expandableCell}>
                    {item.children.length > 0 && (
                      <Button slot="chevron" className={styles.expander}>
                        <FontAwesomeIcon icon={faChevronRight} />
                      </Button>
                    )}
                    {item.metadata?.title
                      ? item.metadata.title
                      : parseFilename(item.filepath, libraryPath)}
                  </Cell>
                  <Cell>
                    {item.metadata?.artist
                      ? item.metadata.artist
                      : "Unknown Artist"}
                  </Cell>
                  <Cell>
                    {item.metadata?.album
                      ? item.metadata.album
                      : "Unknown Album"}
                  </Cell>
                  <Cell>{item.metadata?.year ? item.metadata.year : ""}</Cell>
                  <Collection items={item.children}>{renderItem}</Collection>
                </Row>
              );
            }}
          </TableBody>
        </Table>
      </ResizableTableContainer>
    )
  );
}

export default Library;
