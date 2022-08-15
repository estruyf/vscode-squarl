import { commands } from "vscode";
import { SETTING } from "../constants";
import { CONTEXT_KEY } from "../constants/ContextKeys";
import { Group } from "../models";
import { ExtensionService } from "../services/ExtensionService";


export const setHasGroupContext = async () => {
  const ext = ExtensionService.getInstance();
  const groups = ext.getSetting<Group[]>(SETTING.groups) || [];

  await commands.executeCommand('setContext', CONTEXT_KEY.hasGroups, groups.length > 0);
}