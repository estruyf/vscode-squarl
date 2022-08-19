import { commands, window } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { saveBookmarks } from "../utils/SaveBookmarks";
import { BookmarkView } from "../views/BookmarkView";


export class DeleteBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.deleteBookmark, DeleteBookmarks.delete)
    );
  }

  private static async delete(e: BookmarkTreeItem) {
    const ext = ExtensionService.getInstance();

    const answer = await window.showQuickPick(["Yes", "No"], {
      placeHolder: "Are you sure you want to delete this bookmark?"
    });

    if (!answer || answer === "No") {
      return;
    }

    const newBookmarks = BookmarkView.currentItems.filter(b => b.id !== e.id);
    await saveBookmarks(newBookmarks);
  }
}
