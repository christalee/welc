export const sortByNameAsc = (a: File, b: File) => {
  if (a.name > b.name) {
    return 1;
  } else if (a.name < b.name) {
    return -1;
  }
  return 0;
};

export const sortByNameDesc = (a: File, b: File) => {
  if (a.name < b.name) {
    return 1;
  } else if (a.name > b.name) {
    return -1;
  }
  return 0;
};