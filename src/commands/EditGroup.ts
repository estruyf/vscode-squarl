import { commands } from "vscode";
import { COMMAND } from "../constants";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { ExtensionService } from "../services/ExtensionService";


export class EditGroup {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.editGroup, EditGroup.edit)
    );
  }

  public static async edit(item: BookmarkTreeItem) {
    if (!item) {
      return;
    }

    console.log(item)
  }
}