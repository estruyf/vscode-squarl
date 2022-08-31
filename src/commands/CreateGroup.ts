import { BookmarkTreeItem } from './../providers/BookmarkProvider';
import { createGroup } from './../utils/CreateGroup';
import { commands, window } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { Group } from "../models";
import { ExtensionService } from "../services/ExtensionService";
import { createGroupId } from "../utils/CreateGroupId";


export class CreateGroup {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.createGroup, CreateGroup.create)
    );
  }

  public static async create(crntBookmark?: BookmarkTreeItem) {
    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups, !!crntBookmark?.isGlobal ? "global" : "project") || [];

    const newGroup = await createGroup(!!crntBookmark?.isGlobal);
    if (!newGroup) {
      return;
    }

    groups.push(newGroup);
    ext.setSetting(SETTING.groups, groups, !!crntBookmark?.isGlobal ? "global" : "project");

    return newGroup;
  }
}