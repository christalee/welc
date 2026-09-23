from pathlib import Path


def format_node(name, child_dict, metadata_dict, prefix_uri=""):
    filepath = Path.as_uri(Path.from_uri(prefix_uri) / name)
    node = {
        "name": name,
        "filepath": filepath,
        "metadata": {},
        "children": []
    }

    if filepath in metadata_dict:
        node["metadata"] = metadata_dict[filepath]

    if child_dict:
        node["children"] = [
            format_node(k, v, metadata_dict, prefix_uri=filepath)
            for k, v in child_dict.items()
        ]

    return node


def create_filetree_with_metadata(root_uri, rows):
    metadata_dict = {}
    tree = {}
    for row in rows:
        file_uri = row["filepath"]
        metadata_dict[file_uri] = row["metadata_json"]
        file_path = Path.from_uri(file_uri)
        segments = file_path.relative_to(Path.from_uri(root_uri)).parts
        current = tree
        for part in segments:
            current = current.setdefault(part, {})

    results = [
        format_node(k, v, metadata_dict, prefix_uri=root_uri) for k, v in tree.items()
    ]

    return results
