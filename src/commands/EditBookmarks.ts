import { commands, window } from "vscode";
import { COMMAND } from "../constants";
import { Bookmark, BookmarkType } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { selectGroupQuestion } from "../questions";
import { ExtensionService } from "../services/ExtensionService";
import { getBookmarks } from "../utils";
import { saveBookmarks } from "../utils/SaveBookmarks";


export class EditBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.editBookmark, EditBookmarks.edit)
    );
  }

  private static async edit(crntBookmark: BookmarkTreeItem) {
    const bookmarks: Bookmark[] = await getBookmarks(!!crntBookmark.isGlobal);
    const bookmark = bookmarks.find(b => b.id === crntBookmark.id);

    if (!bookmark) {
      return;
    }

    if (crntBookmark.type === BookmarkType.Link) {
      const link = await window.showInputBox({
        title: "Link",
        prompt: 'Update the link',
        placeHolder: 'https://example.com',
        ignoreFocusOut: true,
        value: bookmark.path
      });

      if (!link) {
        return;
      }

      const name = await window.showInputBox({
        title: "Name",
        prompt: 'Update the name of the link',
        placeHolder: '',
        ignoreFocusOut: true,
        value: bookmark.name
      });
  
      if (!name) {
        return;
      }

      const description = await window.showInputBox({
        title: "Description",
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
        title: "Description",
        prompt: `Update the file description`,
        placeHolder: '',
        ignoreFocusOut: true,
        value: bookmark.description
      });

      bookmark.description = description;
    }

    const groupId = await selectGroupQuestion(bookmark.groupId, !!crntBookmark.isGlobal);

    if (groupId === undefined) {
      return;
    }
    
    if (groupId) {
      bookmark.groupId = groupId;
    } else {
      delete bookmark.groupId;
    }

    await saveBookmarks(bookmarks, !!crntBookmark.isGlobal);
  }
}
