import { ViewService } from './../services/ViewService';
import { commands, QuickPickItem, window } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { createBookmark } from "../utils";
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
    const globalBookmarks = await ViewService.globalView.currentItems() || [];
    const personalBookmarks = await ViewService.projectView.currentItems() || [];
    const teamBookmarks = await ViewService.teamView.currentItems() || [];

    const allSearchItems = [
      ...globalBookmarks.map(b => ({
        label: `$(globe) ${b.name}`,
        description: b.description,
        detail: b.path,
        id: b.id
      } as SearchItem)),
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

    const bookmarkItem = createBookmark(selectedBookmark);
    if (bookmarkItem.command) {
      await commands.executeCommand(bookmarkItem.command.command, ...bookmarkItem.command.arguments || []);
    }
  }
}
