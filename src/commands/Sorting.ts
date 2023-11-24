import { saveBookmarks } from "./../utils/SaveBookmarks";
import { splitGroupId } from "./../utils/SplitGroupId";
import { commands } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { Bookmark, Group } from "../models";
import { ViewService } from "../services";
import { getBookmarks } from "../utils";

export class Sorting {
  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND.moveUp, Sorting.up));
    subscriptions.push(
      commands.registerCommand(COMMAND.moveDown, Sorting.down)
    );
  }

  public static async up(e: BookmarkTreeItem) {
    if (e.id && e.id.startsWith(`group.`)) {
      Sorting.groupUp(e);
    } else {
      Sorting.bookmarkUp(e);
    }
  }

  public static async down(e: BookmarkTreeItem) {
    if (e.id && e.id.startsWith(`group.`)) {
      Sorting.groupDown(e);
    } else {
      Sorting.bookmarkDown(e);
    }
  }

  /**
   * Move group up
   * @param e
   * @returns
   */
  private static async groupUp(e: BookmarkTreeItem) {
    const ext = ExtensionService.getInstance();
    const groups =
      ext.getSetting<Group[]>(
        SETTING.groups,
        !!e.isGlobal ? "global" : "project"
      ) || [];

    const groupId = splitGroupId(e.id);

    const crntGroup = groups.find((g) => g.id === groupId);
    const index = groups.findIndex((g) => g.id === groupId);

    if (index === -1 || index === 0) {
      return;
    }

    groups.splice(index, 1);
    groups.splice(index - 1, 0, Object.assign({}, crntGroup));

    await ExtensionService.getInstance().setSetting(
      SETTING.groups,
      groups,
      !!e.isGlobal ? "global" : "project"
    );
  }

  /**
   * Move group down
   * @param e
   * @returns
   */
  private static async groupDown(e: BookmarkTreeItem) {
    const ext = ExtensionService.getInstance();
    const groups =
      ext.getSetting<Group[]>(
        SETTING.groups,
        !!e.isGlobal ? "global" : "project"
      ) || [];

    const groupId = splitGroupId(e.id);

    const crntGroup = groups.find((g) => g.id === groupId);
    const index = groups.findIndex((g) => g.id === groupId);

    if (index + 1 === groups.length) {
      return;
    }

    groups.splice(index, 1);
    groups.splice(index + 1, 0, Object.assign({}, crntGroup));

    await ExtensionService.getInstance().setSetting(
      SETTING.groups,
      groups,
      !!e.isGlobal ? "global" : "project"
    );
  }

  /**
   * Move bookmark up
   * @param e
   * @returns
   */
  private static async bookmarkUp(e: BookmarkTreeItem) {
    const bookmarks: Bookmark[] = await getBookmarks(!!e.isGlobal);

    // Move the item up in the array
    const crntItem = bookmarks.find((b) => b.id === e.id);
    const index = bookmarks.findIndex((b) => b.id === e.id);

    if (index === -1 || index === 0) {
      return;
    }

    const newBookmarks = [...bookmarks];
    newBookmarks.splice(index, 1);

    const clonedItem = Object.assign({}, crntItem);
    let itemAdded = false;
    for (let i = index - 1; i >= 0; i--) {
      if (newBookmarks[i].groupId === clonedItem.groupId) {
        newBookmarks.splice(i, 0, clonedItem);
        itemAdded = true;
        break;
      }
    }

    if (!itemAdded) {
      newBookmarks.unshift(clonedItem);
    }

    await saveBookmarks(newBookmarks, !!e.isGlobal);
  }

  /**
   * Move bookmark down
   * @param e
   * @returns
   */
  private static async bookmarkDown(e: BookmarkTreeItem) {
    const bookmarks: Bookmark[] = await getBookmarks(!!e.isGlobal);

    // Move the item down in the array
    const crntItem = bookmarks.find((b) => b.id === e.id);
    const index = bookmarks.findIndex((b) => b.id === e.id);

    if (index + 1 === bookmarks.length) {
      return;
    }

    if (index === -1) {
      return;
    }

    const newBookmarks = [...bookmarks];
    newBookmarks.splice(index, 1);

    const clonedItem = Object.assign({}, crntItem);
    for (let i = index + 1; i >= 0; i++) {
      if (!newBookmarks[i]) {
        newBookmarks.splice(i, 0, clonedItem);
        break;
      } else if (newBookmarks[i].groupId === clonedItem.groupId) {
        newBookmarks.splice(i, 0, clonedItem);
        break;
      }
    }

    await saveBookmarks(newBookmarks, !!e.isGlobal);
  }
}
