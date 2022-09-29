

export const createGroupId = (groupName: string) => {
  return groupName.toLowerCase().replace(/ /g, '-');
}