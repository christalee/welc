from utils import create_filetree_with_metadata
from typing import List, Dict, Union, TypedDict
from pathlib import Path

MusicRow = TypedDict("MusicRow", {"filepath": str, "metadata_json": Dict[str, str]})


def create_rows(
    data: List[List[Union[str, Dict[str, str]]]],
) -> List[MusicRow]:
    results = []
    for fp, md in data:
        row: MusicRow = {"filepath": fp, "metadata_json": md}
        results.append(row)

    return results


root1 = Path.as_uri(Path("/"))
root2 = Path.as_uri(Path("/path/to/"))
path1 = "file:///path/to/file1.mp3"
metadata1 = {"artist": "Lorem Ipsum", "year": "2001"}
path2 = "file:///path/to/file2.mp3"
metadata2 = {"artist": "Lorem Ipsum", "year": "2002"}
path3 = "file:///path/to/file3.mp3"
metadata3 = {"artist": "Lorem Ipsum", "year": "2003"}
path4 = "file:///path/file4.mp3"
metadata4 = {"artist": "Lorem Ipsum", "year": "2004"}
path5 = "file:///path/file5.mp3"
metadata5 = {"artist": "Lorem Ipsum", "year": "2005"}


def test_single_row():
    data = [[path1, metadata1]]
    rows = create_rows(data)
    result = create_filetree_with_metadata(root1, rows)
    assert result == [
        {
            "name": "path",
            "filepath": "file:///path",
            "metadata": {},
            "children": [
                {
                    "name": "to",
                    "filepath": "file:///path/to",
                    "metadata": {},
                    "children": [
                        {
                            "name": "file1.mp3",
                            "filepath": path1,
                            "metadata": metadata1,
                            "children": [],
                        }
                    ],
                }
            ],
        }
    ]


def test_multiple_rows():
    data = [[path1, metadata1], [path2, metadata2], [path3, metadata3]]
    rows = create_rows(data)
    result = create_filetree_with_metadata(root1, rows)
    assert result == [
        {
            "name": "path",
            "filepath": "file:///path",
            "metadata": {},
            "children": [
                {
                    "name": "to",
                    "filepath": "file:///path/to",
                    "metadata": {},
                    "children": [
                        {
                            "name": "file1.mp3",
                            "filepath": path1,
                            "metadata": metadata1,
                            "children": [],
                        },
                        {
                            "name": "file2.mp3",
                            "filepath": path2,
                            "metadata": metadata2,
                            "children": [],
                        },
                        {
                            "name": "file3.mp3",
                            "filepath": path3,
                            "metadata": metadata3,
                            "children": [],
                        },
                    ],
                }
            ],
        }
    ]


def test_files_at_top():
    data = [[path1, metadata1], [path2, metadata2], [path3, metadata3]]
    rows = create_rows(data)
    result = create_filetree_with_metadata(root2, rows)
    assert result == [
        {
            "name": "file1.mp3",
            "filepath": path1,
            "metadata": metadata1,
            "children": [],
        },
        {
            "name": "file2.mp3",
            "filepath": path2,
            "metadata": metadata2,
            "children": [],
        },
        {
            "name": "file3.mp3",
            "filepath": path3,
            "metadata": metadata3,
            "children": [],
        },
    ]


def test_files_and_dirs():
    data = [
        [path1, metadata1],
        [path2, metadata2],
        [path3, metadata3],
        [path4, metadata4],
        [path5, metadata5],
    ]
    rows = create_rows(data)
    result = create_filetree_with_metadata(root1, rows)
    assert result == [
        {
            "name": "path",
            "filepath": "file:///path",
            "metadata": {},
            "children": [
                {
                    "name": "to",
                    "filepath": "file:///path/to",
                    "metadata": {},
                    "children": [
                        {
                            "name": "file1.mp3",
                            "filepath": path1,
                            "metadata": metadata1,
                            "children": [],
                        },
                        {
                            "name": "file2.mp3",
                            "filepath": path2,
                            "metadata": metadata2,
                            "children": [],
                        },
                        {
                            "name": "file3.mp3",
                            "filepath": path3,
                            "metadata": metadata3,
                            "children": [],
                        },
                    ],
                },
                {
                    "name": "file4.mp3",
                    "filepath": path4,
                    "metadata": metadata4,
                    "children": [],
                },
                {
                    "name": "file5.mp3",
                    "filepath": path5,
                    "metadata": metadata5,
                    "children": [],
                },
            ],
        }
    ]
