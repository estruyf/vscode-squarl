

export const splitGroupId = (groupId: string) => {
  if (groupId.startsWith(`group.`)) {
    return groupId.split(`group.`).pop();
  }

  return groupId;
}