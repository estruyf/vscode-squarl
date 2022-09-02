import { ViewService } from './../services/ViewService';
import { commands, QuickPickItem, window } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { createBookmark } from "../utils";

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
    const projectBookmarks = await ViewService.projectView.currentItems() || [];
    const teamBookmarks = await ViewService.teamView.currentItems() || [];

    const allSearchItems = [
      ...projectBookmarks.map(b => ({
        label: `${b.isGlobal ? "$(globe)" : "$(code)"} ${b.name}`,
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
        title: "Search bookmarks",
        placeHolder: "Filter by name, description, or path",
        matchOnDescription: true,
        matchOnDetail: true,
      }
    );

    if (!answer) {
      return;
    }

    const selectedBookmark = [...projectBookmarks, ...(teamBookmarks || [])].find(b => b.id === answer.id);
    if (!selectedBookmark) {
      return;
    }

    const bookmarkItem = createBookmark(selectedBookmark);
    if (bookmarkItem.command) {
      await commands.executeCommand(bookmarkItem.command.command, ...bookmarkItem.command.arguments || []);
    }
  }
}
