import { describe, test, expect } from "vitest";
import { createFileTree, type FlatFileData, type Metadata } from "./utils";

const createRows = (data: [string, Metadata][]) => {
  const results: FlatFileData[] = [];
  data.forEach((item) => {
    const [fp, md] = item;
    const row = {
      filepath: fp,
      metadata_json: md,
    };
    results.push(row);
  });

  return results;
};

const root1 = new URL("file:///").href;
const root2 = new URL("file:///path/to/").href;
const path1 = "file:///path/to/file1.mp3";
const metadata1 = { artist: "Lorem Ipsum", year: "2001" };
const path2 = "file:///path/to/file2.mp3";
const metadata2 = { artist: "Lorem Ipsum", year: "2002" };
const path3 = "file:///path/to/file3.mp3";
const metadata3 = { artist: "Lorem Ipsum", year: "2003" };
const path4 = "file:///path/file4.mp3";
const metadata4 = { artist: "Lorem Ipsum", year: "2004" };
const path5 = "file:///path/file5.mp3";
const metadata5 = { artist: "Lorem Ipsum", year: "2005" };

describe("createFileTree", () => {
  test("returns an empty tree when given no input rows", () => {
    const result = createFileTree(root1, []);

    expect(result).toStrictEqual([]);
  });

  test("creates a tree when given a single input row", () => {
    const data: [string, Metadata][] = [[path1, metadata1]];
    const rows = createRows(data);
    const result = createFileTree(root1, rows);

    expect(result).toStrictEqual([
      {
        name: "path",
        filepath: "file:///path",
        metadata: {},
        children: [
          {
            name: "to",
            filepath: "file:///path/to",
            metadata: {},
            children: [
              {
                name: "file1.mp3",
                filepath: path1,
                metadata: metadata1,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("creates a tree when give multiple input rows", () => {
    const data: [string, Metadata][] = [
      [path1, metadata1],
      [path2, metadata2],
      [path3, metadata3],
    ];
    const rows = createRows(data);
    const result = createFileTree(root1, rows);

    expect(result).toStrictEqual([
      {
        name: "path",
        filepath: "file:///path",
        metadata: {},
        children: [
          {
            name: "to",
            filepath: "file:///path/to",
            metadata: {},
            children: [
              {
                name: "file1.mp3",
                filepath: path1,
                metadata: metadata1,
                children: [],
              },
              {
                name: "file2.mp3",
                filepath: path2,
                metadata: metadata2,
                children: [],
              },
              {
                name: "file3.mp3",
                filepath: path3,
                metadata: metadata3,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("creates a shallow tree when files are at the top level", () => {
    const data: [string, Metadata][] = [
      [path1, metadata1],
      [path2, metadata2],
      [path3, metadata3],
    ];
    const rows = createRows(data);
    const result = createFileTree(root2, rows);

    expect(result).toStrictEqual([
      {
        name: "file1.mp3",
        filepath: path1,
        metadata: metadata1,
        children: [],
      },
      {
        name: "file2.mp3",
        filepath: path2,
        metadata: metadata2,
        children: [],
      },
      {
        name: "file3.mp3",
        filepath: path3,
        metadata: metadata3,
        children: [],
      },
    ]);
  });

  test("creates a deeper tree when the data contains both files and dirs", () => {
    const data: [string, Metadata][] = [
      [path1, metadata1],
      [path2, metadata2],
      [path3, metadata3],
      [path4, metadata4],
      [path5, metadata5],
    ];
    const rows = createRows(data);
    const result = createFileTree(root1, rows);

    expect(result).toStrictEqual([
      {
        name: "path",
        filepath: "file:///path",
        metadata: {},
        children: [
          {
            name: "file4.mp3",
            filepath: path4,
            metadata: metadata4,
            children: [],
          },
          {
            name: "file5.mp3",
            filepath: path5,
            metadata: metadata5,
            children: [],
          },
          {
            name: "to",
            filepath: "file:///path/to",
            metadata: {},
            children: [
              {
                name: "file1.mp3",
                filepath: path1,
                metadata: metadata1,
                children: [],
              },
              {
                name: "file2.mp3",
                filepath: path2,
                metadata: metadata2,
                children: [],
              },
              {
                name: "file3.mp3",
                filepath: path3,
                metadata: metadata3,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("sorts the children by filepath", () => {
    const data: [string, Metadata][] = [
      [path3, metadata3],
      [path4, metadata4],
      [path1, metadata1],
      [path5, metadata5],
      [path2, metadata2],
    ];
    const rows = createRows(data);
    const result = createFileTree(root1, rows);

    expect(result).toStrictEqual([
      {
        name: "path",
        filepath: "file:///path",
        metadata: {},
        children: [
          {
            name: "file4.mp3",
            filepath: path4,
            metadata: metadata4,
            children: [],
          },
          {
            name: "file5.mp3",
            filepath: path5,
            metadata: metadata5,
            children: [],
          },
          {
            name: "to",
            filepath: "file:///path/to",
            metadata: {},
            children: [
              {
                name: "file1.mp3",
                filepath: path1,
                metadata: metadata1,
                children: [],
              },
              {
                name: "file2.mp3",
                filepath: path2,
                metadata: metadata2,
                children: [],
              },
              {
                name: "file3.mp3",
                filepath: path3,
                metadata: metadata3,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });
});
