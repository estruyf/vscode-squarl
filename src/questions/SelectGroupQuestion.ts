import { createGroup } from './../utils/CreateGroup';
import { QuickPickItem, QuickPickItemKind, window } from "vscode";
import { SETTING } from "../constants";
import { Group } from "../models";
import { ExtensionService } from "../services/ExtensionService";
import { CreateGroup } from '../commands';

interface GroupQuickPickItem extends QuickPickItem {
  id: string;
}

export const selectGroupQuestion = async (crntGroupId?: string): Promise<string | undefined> => {
  const ext = ExtensionService.getInstance();
  const groups = ext.getSetting<Group[]>(SETTING.groups) || [];
  const GROUP_CREATION_ID = "CREATE_GROUP";
  
  let groupId: string | undefined = "";
  const allGroups: GroupQuickPickItem[] = [
    { 
      label: "<No group>", 
      id: "" 
    },
    ...groups.map(g => (
      {
        label: g.name,
        id: g.id,
        picked: g.id === crntGroupId
      } as GroupQuickPickItem
    )),
    {
      label: "Creation",
      kind: QuickPickItemKind.Separator,
      id: ""
    },
    {
      label: "$(plus) Create new group",
      id: GROUP_CREATION_ID
    }
  ];

  // Put the selected item first
  const selectedItem = allGroups.find(g => g.picked);
  if (selectedItem) {
    allGroups.splice(allGroups.indexOf(selectedItem), 1);
    allGroups.unshift(selectedItem);
  }

  const group = await window.showQuickPick(allGroups, {
    placeHolder: `To which group do you want to add the bookmark?`,
    canPickMany: false,
    ignoreFocusOut: true
  });

  if (group === undefined) {
    return undefined;
  }

  if (group && group.id === GROUP_CREATION_ID) {
    const newGroup = await CreateGroup.create();
    groupId = newGroup?.id;
  } else if (group && group.id) {
    groupId = groups.find(g => g.id === group.id)?.id
  }

  return groupId;
}