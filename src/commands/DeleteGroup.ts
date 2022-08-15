import { commands } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";


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

    console.log(item)
  }
}