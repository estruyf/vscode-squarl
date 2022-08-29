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
      label: "", 
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
  
  const group = await window.showQuickPick(allGroups, {
    placeHolder: `To which group do you want to add the bookmark?`,
    canPickMany: false,
    ignoreFocusOut: true,
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