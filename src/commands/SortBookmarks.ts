import { BookmarkView } from './../views/BookmarkView';
import { commands } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";


export class SortBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.moveUp, SortBookmarks.up)
    );
    subscriptions.push(
      commands.registerCommand(COMMAND.moveDown, SortBookmarks.down)
    );
  }

  public static async up(e: BookmarkTreeItem) {
    const bookmarks = BookmarkView.currentItems;
    
    // Move the item up in the array
    const crntItem = bookmarks.find(b => b.id === e.id);
    const index = bookmarks.findIndex(b => b.id === e.id);

    if (index === -1 || index === 0) {
      return;
    }
    
    const newBookmarks = [...bookmarks];
    newBookmarks.splice(index, 1);

    const clonedItem = Object.assign({}, crntItem);
    let itemAdded = false;
    for (let i = index - 1; i >= 0; i--) {
      if (newBookmarks[i].type === clonedItem.type) {
        newBookmarks.splice(i, 0, clonedItem);
        itemAdded = true;
        break;
      }
    }

    if (!itemAdded) {
      newBookmarks.unshift(clonedItem);
    }

    await ExtensionService.getInstance().setSetting(
      "bookmarks",
      newBookmarks
    );
  }

  public static async down(e: BookmarkTreeItem) {
    const bookmarks = BookmarkView.currentItems;

    // Move the item down in the array
    const crntItem = bookmarks.find(b => b.id === e.id);
    const index = bookmarks.findIndex(b => b.id === e.id);

    if ((index + 1) === bookmarks.length) {
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
      } else if (newBookmarks[i].type === clonedItem.type) {
        newBookmarks.splice(i, 0, clonedItem);
        break;
      }
    }

    await ExtensionService.getInstance().setSetting(
      "bookmarks",
      newBookmarks
    );
  }
}