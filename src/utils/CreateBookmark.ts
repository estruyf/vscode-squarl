import { v4 } from "uuid";
import { TreeItemCollapsibleState } from "vscode";
import { Bookmark } from "../models";
import { BookmarkTreeItem } from "../providers/BookmarkProvider";

/**
 * Creates new bookmarks for the provided object
 * @param bookmark 
 * @returns 
 */
export const createBookmark = (bookmark: Bookmark, contextValue: string | undefined = undefined) => {
  let context = contextValue ? `${contextValue}Bookmark` : `bookmark`;
  if (bookmark.isGlobal) {
    context = `${context}.global`;
  }

  return new BookmarkTreeItem(
    bookmark.id || v4(),
    bookmark.name,
    bookmark.description,
    TreeItemCollapsibleState.None,
    bookmark.isGlobal,
    bookmark.iconName || undefined,
    bookmark.path,
    bookmark.highlightedLine,
    bookmark.type,
    context,
  );
}