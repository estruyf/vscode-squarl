import { QuickPickItem, window } from "vscode";
import { SETTING } from "../constants";
import { Group } from "../models";
import { ExtensionService } from "../services/ExtensionService";

interface GroupQuickPickItem extends QuickPickItem {
  id: string;
}

export const selectGroupQuestion = async (crntGroupId?: string) => {
  const ext = ExtensionService.getInstance();
  const groups = ext.getSetting<Group[]>(SETTING.groups) || [];
  
  let groupId = undefined;
  if (groups && groups.length > 0) {
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
    ))];

    const group = await window.showQuickPick(allGroups, {
      placeHolder: `To which group do you want to add the bookmark?`,
      canPickMany: false,
      ignoreFocusOut: true,
    });

    if (group && group.id) {
      groupId = groups.find(g => g.id === group.id)?.id
    }
  }

  return groupId;
}