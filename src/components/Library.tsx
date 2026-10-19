import { useEffect, useState, useMemo } from "react";
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
import { debounce } from "lodash";

import Checkbox from "./Checkbox";
import {
  getLibrary,
  type LibraryData,
  useTreeHelpers,
  cascadeDown,
  cascadeUp,
} from "../utils";

import styles from "./library.module.scss";

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
              <span
                aria-hidden="true"
                data-test="sorter"
                className={styles.sorter}
              >
                {sortDirection === "ascending" ? (
                  <FontAwesomeIcon icon={faChevronUp} />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} />
                )}
              </span>
            )}
          </Group>
          {props.allowsResizing && (
            <ColumnResizer data-test="resizer" className={styles.resizer} />
          )}
        </div>
      )}
    </AriaColumn>
  );
}

function Library({
  libraryPath,
  libraryData,
  setLibraryData,
  selected,
  setSelected,
}: {
  libraryPath: string;
  libraryData: LibraryData[] | undefined;
  setLibraryData: React.Dispatch<
    React.SetStateAction<LibraryData[] | undefined>
  >;
  selected: Selection;
  setSelected: React.Dispatch<React.SetStateAction<Selection>>;
}) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  let sortedLibrary = libraryData;
  if (sortDescriptor && libraryData) {
    sortedLibrary = libraryData.sort((a, b) => {
      // narrows type Key to string
      if (sortDescriptor.column === "name") {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        let cmp = first < second ? -1 : 1;
        if (sortDescriptor.direction === "descending") {
          cmp = -cmp;
        }
        return cmp;
      }
      // dummy return to satisfy type checker; this table only sorts on "name"
      return 1;
    });
  }

  const { parentToChildren, childToParent, allIds } =
    useTreeHelpers(libraryData);

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

  const debounceGetLibrary = useMemo(() => debounce(getLibrary, 250), []);

  useEffect(() => {
    async function checkLibrary() {
      if (libraryPath.length > 0) {
        debounceGetLibrary({ libraryPath, setLibraryData });
      }
    }
    checkLibrary();
  }, [libraryPath, setLibraryData, debounceGetLibrary]);

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
          <TableHeader className={styles.tableHeader}>
            <Column id="checkbox" width={25} minWidth={25} maxWidth={25}>
              <Checkbox slot="selection" className={styles.checkboxField}>
                {""}
              </Checkbox>
            </Column>
            <Column id="name" className={styles.expand} isRowHeader allowsResizing allowsSorting>
              Name
            </Column>
            <Column id="artist" className={styles.collapse} allowsResizing>
              Artist
            </Column>
            <Column id="album" className={styles.collapse} allowsResizing>
              Album
            </Column>
            <Column id="year" className={styles.collapse} width={60} minWidth={60} maxWidth={60}>
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
                  <Cell data-test="nameCell" className={styles.expandableCell}>
                    {item.children.length > 0 && (
                      <Button
                        slot="chevron"
                        data-test="expander"
                        className={styles.expander}
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </Button>
                    )}
                    {item.metadata?.title ? item.metadata.title : item.name}
                  </Cell>
                  <Cell className={`${styles.cell} ${styles.collapse}`}>
                    {item.metadata?.artist ? item.metadata.artist : ""}
                  </Cell>
                  <Cell className={`${styles.cell} ${styles.collapse}`}>
                    {item.metadata?.album ? item.metadata.album : ""}
                  </Cell>
                  <Cell className={`${styles.cell} ${styles.collapse}`}>
                    {item.metadata?.year ? item.metadata.year : ""}
                  </Cell>
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
