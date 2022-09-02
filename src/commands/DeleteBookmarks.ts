import { commands, window } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";
import { getBookmarks } from "../utils";
import { saveBookmarks } from "../utils/SaveBookmarks";


export class DeleteBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.deleteBookmark, DeleteBookmarks.delete)
    );
  }

  private static async delete(item: BookmarkTreeItem) {
    const answer = await window.showQuickPick(["Yes", "No"], {
      title: "Delete bookmark",
      placeHolder: "Are you sure you want to delete this bookmark?"
    });

    if (!answer || answer === "No") {
      return;
    }

    const crntItems = await getBookmarks(!!item.isGlobal);
    const newBookmarks = crntItems.filter(b => b.id !== item.id);
    await saveBookmarks(newBookmarks, !!item.isGlobal);
  }
}
