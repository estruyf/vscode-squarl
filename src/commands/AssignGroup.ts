import { BookmarkView } from './../views/BookmarkView';
import { setHasGroupContext } from './../utils/SetHasGroupContext';
import { commands } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { Group } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { selectGroupQuestion } from '../questions';
import { saveBookmarks } from '../utils/SaveBookmarks';
import { ViewService } from '../services';
import { getBookmarks } from '../utils';


export class AssignGroup {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.assignGroup, AssignGroup.assign)
    );

    // Set the VS Code context key
    setHasGroupContext();
  }

  public static async assign(item: BookmarkTreeItem) {
    if (!item) {
      return;
    }

    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups, !!item.isGlobal ? "global" : "project") || [];

    if (!groups || groups.length === 0) {
      return;
    }

    const bookmarks = await getBookmarks(!!item.isGlobal);
    const bookmark = bookmarks.find(b => b.id === item.id);

    if (bookmark) {
      const groupId = await selectGroupQuestion(bookmark?.groupId, !!item.isGlobal);
      if (groupId) {
        bookmark.groupId = groupId;
      } else {
        delete bookmark.groupId;
      }

      await saveBookmarks(bookmarks, !!item.isGlobal);
    }
  }
}