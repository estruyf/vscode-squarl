import { commands, QuickPickItem, window } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { BookmarkView } from "../views/BookmarkView";

interface SearchItem extends QuickPickItem {
  id: string;
}

export class SearchBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.searchBookmark, SearchBookmarks.search)
    );
  }

  private static async search(e: BookmarkTreeItem) {
    const personalBookmarks = BookmarkView.currentItems;
    const teamBookmarks = await BookmarkView.currentTeamItems();

    const allSearchItems = [
      ...personalBookmarks.map(b => ({
        label: `$(person) ${b.name}`,
        description: b.description,
        detail: b.path,
        id: b.id
      } as SearchItem)),
      ...(teamBookmarks || []).map(b => ({
        label: `$(organization) ${b.name}`,
        description: b.description,
        detail: b.path,
        id: b.id
      } as SearchItem))
    ]

    const answer = await window.showQuickPick(
      allSearchItems, 
      {
        placeHolder: "Search bookmarks",
        matchOnDescription: true,
        matchOnDetail: true,
      }
    );

    if (!answer) {
      return;
    }

    const selectedBookmark = [...personalBookmarks, ...(teamBookmarks || [])].find(b => b.id === answer.id);
    if (!selectedBookmark) {
      return;
    }

    const bookmarkItem = BookmarkView.createBookmark(selectedBookmark);
    if (bookmarkItem.command) {
      commands.executeCommand(bookmarkItem.command.command, ...bookmarkItem.command.arguments || [])
    }
  }
}
