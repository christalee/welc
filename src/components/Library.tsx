import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  Group,
  Row,
  TableBody,
  Cell,
  ResizableTableContainer,
  Button,
  ColumnResizer,
  Collection,
  type SortDescriptor,
  type Selection,
} from "react-aria-components";
import {
  faChevronRight,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Checkbox from "./Checkbox";
import {
  getLibrary,
  type LibraryData,
  useTreeHelpers,
  cascadeDown,
  cascadeUp,
} from "../utils";

import styles from "./library.module.scss";

const parseFilename = (filepath: string, libraryPath: string) => {
  const uri = decodeURI(filepath);
  const url = new URL(uri);
  // add 1 to slice the trailing /
  return decodeURIComponent(url.pathname).slice(libraryPath.length + 1);
};

interface ColumnProps extends AriaColumnProps {
  allowsResizing?: boolean;
}

function Column(
  props: Omit<ColumnProps, "children"> & { children?: React.ReactNode },
) {
  return (
    <AriaColumn {...props}>
      {({ allowsSorting, sortDirection }) => (
        <div className={styles.columnHeader}>
          <Group
            role="presentation"
            tabIndex={-1}
            className={styles.columnLabel}
          >
            {props.children}
            {allowsSorting && (
              <span aria-hidden="true" className={styles.sorter}>
                {sortDirection === "ascending" ? (
                  <FontAwesomeIcon icon={faChevronUp} />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} />
                )}
              </span>
            )}
          </Group>
          {props.allowsResizing && <ColumnResizer className={styles.resizer} />}
        </div>
      )}
    </AriaColumn>
  );
}

function Library({
  libraryPath,
  libraryData,
  setLibraryData,
}: {
  libraryPath: string;
  libraryData: LibraryData | undefined;
  setLibraryData: React.Dispatch<React.SetStateAction<LibraryData | undefined>>;
}) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [selected, setSelected] = useState<Selection>(new Set());

  let sortedLibrary = libraryData?.children;
  if (sortDescriptor && libraryData) {
    sortedLibrary = libraryData.children.sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      let cmp = first < second ? -1 : 1;
      if (sortDescriptor.direction === "descending") {
        cmp = -cmp;
      }
      return cmp;
    });
  }

  const { parentToChildren, childToParent, allIds } = useTreeHelpers(
    libraryData?.children,
  );

  const handleSelectionChange = (selection: Selection) => {
    if (selection === "all") {
      setSelected(new Set(allIds));
      return;
    }

    const nextSelected = new Set<string>(selection as Set<string>);
    const currentSelected =
      selected === "all" ? new Set(allIds) : (selected as Set<string>);

    // Find what changed (added or removed)
    const added = [...nextSelected].filter((x) => !currentSelected.has(x));
    const removed = [...currentSelected].filter((x) => !nextSelected.has(x));

    added.forEach((id) =>
      cascadeDown(id, true, parentToChildren, nextSelected),
    );
    removed.forEach((id) =>
      cascadeDown(id, false, parentToChildren, nextSelected),
    );

    // Run parent verification for all changes
    [...added, ...removed].forEach((id) =>
      cascadeUp(id, childToParent, parentToChildren, nextSelected),
    );

    setSelected(nextSelected);
  };

  useEffect(() => {
    async function checkLibrary() {
      if (libraryPath.length > 0) {
        await getLibrary({ libraryPath, setLibraryData });
      }
    }
    checkLibrary();
  }, [libraryPath, setLibraryData]);

  return (
    sortedLibrary && (
      <ResizableTableContainer className={styles.tableContainer}>
        <Table
          data-test="libraryData"
          selectionMode="multiple"
          treeColumn="name"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          selectedKeys={selected}
          onSelectionChange={handleSelectionChange}
          aria-label="libraryData"
          className={styles.table}
        >
          <TableHeader>
            <Column id="checkbox" width={25} minWidth={25} maxWidth={25}>
              <Checkbox slot="selection" className={styles.checkboxField}>
                {""}
              </Checkbox>
            </Column>
            <Column id="name" isRowHeader allowsResizing allowsSorting>
              Name
            </Column>
            <Column id="artist" allowsResizing>
              Artist
            </Column>
            <Column id="album" allowsResizing>
              Album
            </Column>
            <Column id="year" width={60} minWidth={60} maxWidth={60}>
              Year
            </Column>
          </TableHeader>
          <TableBody items={sortedLibrary} dependencies={[sortedLibrary]}>
            {function renderItem(item) {
              return (
                <Row
                  key={item.filepath}
                  id={item.filepath}
                  className={styles.row}
                >
                  <Cell>
                    <Checkbox slot="selection" className={styles.checkboxField}>
                      {""}
                    </Checkbox>
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
                    {item.metadata?.artist ? item.metadata.artist : ""}
                  </Cell>
                  <Cell>{item.metadata?.album ? item.metadata.album : ""}</Cell>
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
