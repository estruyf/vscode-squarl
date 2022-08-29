import { BookmarkView } from './../views/BookmarkView';
import { commands, window } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { Group } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { createGroupId } from "../utils/CreateGroupId";
import { splitGroupId } from "../utils/SplitGroupId";
import { saveBookmarks } from '../utils/SaveBookmarks';


export class EditGroup {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.editGroup, EditGroup.edit)
    );
  }

  public static async edit(item: BookmarkTreeItem) {
    if (!item || !item.id) {
      return;
    }

    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups) || [];

    const crntGroup = groups.find(g => g.id === splitGroupId(item.id));
    if (!crntGroup) {
      return;
    }

    const filteredGroups = groups.filter(g => g.id !== crntGroup.id) || [];

    const name = await window.showInputBox({
      prompt: 'What name do you want to give your group?',
      placeHolder: 'Name of the group',
      value: crntGroup.name,
      ignoreFocusOut: true,
      validateInput: (value: string) => {
        if (!value) {
          return "Please define a name for the group";
        } else if (filteredGroups.find(g => g.id === createGroupId(value))) {
          return "A group with this name already exists";
        } else {
          return "";
        }
      }
    });

    if (!name) {
      return;
    }

    const newGroupId = createGroupId(name);

    filteredGroups.push({
      id: newGroupId,
      name
    });

    ext.setSetting(SETTING.groups, filteredGroups);

    // Update all the bookmarks
    const bookmarks = BookmarkView.currentProjectItems.map(b => {
      if (b.groupId === crntGroup.id) {
        b.groupId = newGroupId;
      }
      return b;
    });
    
    await saveBookmarks(bookmarks);
  }
}