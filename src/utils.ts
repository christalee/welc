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
  // add 1 to slice the trailing /
  return decodeURIComponent(url.pathname).slice(libraryPath.length + 1);
};

export type LibraryData = {
  name: string;
  filepath: string;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    track?: number;
    length?: number;
    genre?: string;
  };
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
    .then((data) => setLibraryData(data));
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
