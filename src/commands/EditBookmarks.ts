import { commands, window } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { BookmarkType } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { selectGroupQuestion } from "../questions";
import { ViewService } from "../services";
import { ExtensionService } from "../services/ExtensionService";
import { saveBookmarks } from "../utils/SaveBookmarks";
import { BookmarkView } from "../views/BookmarkView";


export class EditBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.editBookmark, EditBookmarks.edit)
    );
  }

  private static async edit(e: BookmarkTreeItem) {
    const items = await ViewService.projectView.currentItems() || [];
    const bookmark = items.find(b => b.id === e.id);

    if (!bookmark) {
      return;
    }

    if (e.type === BookmarkType.Link) {
      const link = await window.showInputBox({
        prompt: 'Update the link',
        placeHolder: 'https://example.com',
        ignoreFocusOut: true,
        value: bookmark.path
      });

      if (!link) {
        return;
      }

      const name = await window.showInputBox({
        prompt: 'Update the name of the link',
        placeHolder: '',
        ignoreFocusOut: true,
        value: bookmark.name
      });
  
      if (!name) {
        return;
      }

      const description = await window.showInputBox({
        prompt: 'Update the description for the link',
        placeHolder: 'Example link',
        ignoreFocusOut: true,
        value: bookmark.description
      });

      bookmark.name = name;
      bookmark.path = link;
      bookmark.description = description;
    } else {
      const description = await window.showInputBox({
        prompt: `Update the file description`,
        placeHolder: '',
        ignoreFocusOut: true,
        value: bookmark.description
      });

      bookmark.description = description;
    }

    const groupId = await selectGroupQuestion(bookmark.groupId);

    if (groupId === undefined) {
      return;
    }
    
    if (groupId) {
      bookmark.groupId = groupId;
    } else {
      delete bookmark.groupId;
    }

    await saveBookmarks(items);
  }
}
