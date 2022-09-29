import { commands, window } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { Group } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ViewService } from "../services";
import { ExtensionService } from "../services/ExtensionService";
import { getBookmarks } from "../utils";
import { saveBookmarks } from "../utils/SaveBookmarks";
import { splitGroupId } from "../utils/SplitGroupId";
import { BookmarkView } from "../views/BookmarkView";


export class DeleteGroup {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.deleteGroup, DeleteGroup.delete)
    );
  }

  public static async delete(item: BookmarkTreeItem) {
    if (!item) {
      return;
    }

    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups, !!item.isGlobal ? "global" : "project") || [];

    const crntGroup = groups.find(g => g.id === splitGroupId(item.id));
    if (!crntGroup) {
      return;
    }

    const answer = await window.showQuickPick(["Yes", "No"], {
      title: "Delete group",
      placeHolder: "Are you sure you want to delete this group?"
    });

    if (!answer || answer === "No") {
      return;
    }

    const newGroups = groups.filter(g => g.id !== crntGroup.id);
    ext.setSetting(SETTING.groups, newGroups, !!item.isGlobal ? "global" : "project");

    // Update all the bookmarks
    const crntItems = await getBookmarks(!!item.isGlobal);
    const bookmarks = crntItems.map(b => {
      if (b.groupId === crntGroup.id) {
        delete b.groupId;
      }
      return b;
    });
    
    await saveBookmarks(bookmarks, !!item.isGlobal);
  }
}