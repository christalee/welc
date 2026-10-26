import { useMemo } from "react";
import type { Selection } from "react-aria-components";

export const sortByNameAsc = (a: string | File, b: string | File) => {
  const aName = typeof a === "string" ? a : a.name;
  const bName = typeof b === "string" ? b : b.name;
  if (aName > bName) {
    return 1;
  } else if (aName < bName) {
    return -1;
  }
  return 0;
};

export const sortByNameDesc = (a: string | File, b: string | File) => {
  const aName = typeof a === "string" ? a : a.name;
  const bName = typeof b === "string" ? b : b.name;
  if (aName < bName) {
    return 1;
  } else if (aName > bName) {
    return -1;
  }
  return 0;
};

export const parseFilename = (filepath: string, libraryPath: string) => {
  const uri = decodeURI(filepath);
  const url = new URL(uri);

  return decodeURIComponent(url.pathname).slice(libraryPath.length);
};

export const libraryPrefix = import.meta.env.VITE_MUSIC_DIR + "/";
export const formatLibraryPath = (libraryPath: string) => {
  return libraryPath.slice(libraryPrefix.length);
};

export type LibraryData = {
  name: string;
  filepath: string;
  metadata?: Metadata;
  children: LibraryData[];
};

const baseUrlPort = import.meta.env.MODE == "testing" ? 5174 : 5173;
// Must end in a trailing slash!! for production (npm run build),
// values are ./ for preview and /welc/ for release
export const baseUrl = import.meta.env.PROD
  ? import.meta.env.BASE_URL
  : `http://localhost:${baseUrlPort}/`;

export async function getLibrary({
  libraryPath,
  setLibraryData,
}: {
  libraryPath: string;
  setLibraryData: React.Dispatch<
    React.SetStateAction<LibraryData[] | undefined>
  >;
}) {
  await fetch(`${baseUrl}api/library`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      library: libraryPath,
    }),
  })
    .then((response) => response.json())
    .then((data) => setLibraryData(createFileTree(`file://${libraryPrefix}`, data)));
}

export function useTreeHelpers(data: LibraryData[] | undefined) {
  return useMemo(() => {
    const parentToChildren = new Map<string, string[]>();
    const childToParent = new Map<string, string>();
    const allIds: string[] = [];

    const traverse = (items: LibraryData[]) => {
      items.forEach((item) => {
        allIds.push(item.filepath);
        if (item.children && item.children.length > 0) {
          const childIds = item.children.map((c) => c.filepath);
          parentToChildren.set(item.filepath, childIds);
          item.children.forEach((c) =>
            childToParent.set(c.filepath, item.filepath),
          );
          traverse(item.children);
        }
      });
    };

    if (data) {
      traverse(data);
    }
    return { parentToChildren, childToParent, allIds };
  }, [data]);
}

// Cascade Downwards (Select/Deselect children)
export const cascadeDown = (
  id: string,
  isSelecting: boolean,
  parentToChildren: Map<string, string[]>,
  nextSelected: Set<string>,
) => {
  const children = parentToChildren.get(id);
  if (children) {
    children.forEach((childId) => {
      if (isSelecting) nextSelected.add(childId);
      else nextSelected.delete(childId);
      cascadeDown(childId, isSelecting, parentToChildren, nextSelected);
    });
  }
};

// Cascade Upwards (Update parent based on children state)
export const cascadeUp = (
  childId: string,
  childToParent: Map<string, string>,
  parentToChildren: Map<string, string[]>,
  nextSelected: Set<string>,
) => {
  const parentId = childToParent.get(childId);
  if (!parentId) return;

  const siblings = parentToChildren.get(parentId) || [];
  const allSiblingsSelected = siblings.every((sibId) =>
    nextSelected.has(sibId),
  );

  if (allSiblingsSelected) {
    nextSelected.add(parentId);
  } else {
    nextSelected.delete(parentId);
  }
  cascadeUp(parentId, childToParent, parentToChildren, nextSelected);
};

// keep this in sync with the list at the top of api.py
const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".flac", ".wav", ".m4a"];
export const filterFiles = (librarySelected: Selection): string[] => {
  const results = Array.from(librarySelected).filter((entry) => {
    for (const ext of AUDIO_EXTENSIONS) {
      if (String(entry).endsWith(ext)) {
        return true;
      }
    }
    return false;
  });

  return results.map((entry) => String(entry)).sort(sortByNameAsc);
};

export type Metadata = {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  track?: number;
  length?: number;
  genre?: string;
};

export type FlatFileData = {
  filepath: string;
  metadata_json: Metadata;
};

type Tree = Map<string, Tree>;

const compareByFilepath = (a: LibraryData, b: LibraryData) => {
  if (a.filepath > b.filepath) {
    return 1;
  } else if (b.filepath > a.filepath) {
    return -1;
  }
  return 0;
};

const formatNode = (
  item: [string, Tree],
  metadataMap: Map<string, Metadata>,
  root: string = "file://",
): LibraryData => {
  const [name, childMap] = item;
  const filepath = new URL(name, root).href;
  const node: LibraryData = {
    name,
    filepath,
    metadata: {},
    children: [],
  };

  if (metadataMap.has(filepath)) {
    node.metadata = metadataMap.get(filepath);
  }

  if (childMap.size > 0) {
    node.children = Array.from(childMap)
      .map((item) => formatNode(item, metadataMap, `${filepath}/`))
      .sort(compareByFilepath);
  }

  return node;
};

export const createFileTree = (
  rootDir: string,
  rows: FlatFileData[],
): LibraryData[] => {
  const metadataByPath = new Map();
  const tree = new Map();
  rows.forEach((row) => {
    const filePath = row.filepath;
    metadataByPath.set(filePath, row.metadata_json);

    const segments = decodeURI(filePath).replace(rootDir, "").split("/");
    let current = tree;
    segments.forEach((segment) => {
      if (!current.has(segment)) {
        current.set(segment, new Map());
      }
      current = current.get(segment);
    });
  });

  const results = Array.from(tree).map((treeItem) =>
    formatNode(treeItem, metadataByPath, rootDir),
  );

  return results;
};
