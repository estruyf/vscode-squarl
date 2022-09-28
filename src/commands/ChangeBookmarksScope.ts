import { commands } from "vscode";
import { COMMAND } from "../constants";
import { Bookmark } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";
import { selectGroupQuestion } from "../questions";
import { ExtensionService } from "../services/ExtensionService";
import { getBookmarks } from "../utils";
import { saveBookmarks } from "../utils/SaveBookmarks";


export class ChangeBookmarksScope {
  
  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;
    
    subscriptions.push(
      commands.registerCommand(COMMAND.promoteBookmark, ChangeBookmarksScope.changeBookmarkScope)
  );
  
  subscriptions.push(
    commands.registerCommand(COMMAND.demoteBookmark, ChangeBookmarksScope.changeBookmarkScope)
    );
  }
  
  private static async changeBookmarkScope(crntBookmark: BookmarkTreeItem) {
    const newScope = !crntBookmark.isGlobal;
    const previousBookmarks: Bookmark[] = await getBookmarks(!!crntBookmark.isGlobal);
    const bookmark = previousBookmarks.find(b => b.id === crntBookmark.id);
    
    if (!bookmark) {
      return;
    }
    
    const groupId = await selectGroupQuestion(undefined, !!newScope);
    if (groupId === undefined) {
      return;
    }
    
    const modifiedBookmarks = previousBookmarks.filter(b => b.id !== bookmark.id);
    await saveBookmarks(modifiedBookmarks, !!crntBookmark.isGlobal);
    
    bookmark.groupId = groupId;
    bookmark.isGlobal = newScope;
    const bookmarks = await getBookmarks(!!newScope);
    await saveBookmarks(bookmarks, !!newScope);
  }
}
    