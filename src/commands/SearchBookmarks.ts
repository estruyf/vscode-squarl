import { commands, window } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { BookmarkView } from "../views/BookmarkView";


export class SearchBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.searchBookmark, SearchBookmarks.search)
    );
  }

  private static async search(e: BookmarkTreeItem) {
    const allBookmarks = BookmarkView.currentItems;

    const answer = await window.showQuickPick(
      allBookmarks.map(b => ({
        label: b.name,
        description: b.description,
        id: b.id
      })), {
        placeHolder: "Search bookmarks",
        matchOnDescription: true
      });

    if (!answer) {
      return;
    }

    const selectedBookmark = allBookmarks.find(b => b.id === answer.id);
    if (!selectedBookmark) {
      return;
    }

    const bookmarkItem = BookmarkView.createBookmark(selectedBookmark);
    if (bookmarkItem.command) {
      commands.executeCommand(bookmarkItem.command.command, ...bookmarkItem.command.arguments || [])
    }
  }
}
