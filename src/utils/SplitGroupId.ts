

export const splitGroupId = (groupId: string) => {
  if (groupId.startsWith(`group.`)) {
    const splittedGroupId = groupId.split(`group.`).pop();
    
    if (splittedGroupId?.startsWith(`global.`)) {
      return splittedGroupId.split(`global.`).pop();
    }

    return splittedGroupId;
  }

  return groupId;
}