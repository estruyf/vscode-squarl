import { TreeItemCollapsibleState, Uri, window } from 'vscode';
import { SETTING } from '../constants';
import { Bookmark, BookmarkType } from '../models';
import { BookmarkProvider, BookmarkTreeItem } from '../providers/BookmarkProvider';
import { ExtensionService } from './../services/ExtensionService';


export class BookmarkView {

  public static async init() {
    const bookmarks = await BookmarkView.getBookmarks();

    const bookmarkProvider = new BookmarkProvider(bookmarks);

    const tree = window.createTreeView('squarl-bookmarks', {
      treeDataProvider: bookmarkProvider,
      showCollapseAll: true,
    });

    tree.onDidExpandElement(e => {
      bookmarkProvider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
    });
    tree.onDidCollapseElement(e => {
      bookmarkProvider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
    });
  }

  /**
   * Retrieve all the bookmarks for the current workspace
   * @returns 
   */
  public static async getBookmarks() {
    const ext = ExtensionService.getInstance();
    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks) || [];
    
    const files = bookmarks.filter(b => b.type === BookmarkType.File).map(this.createBookmark);
    const links = bookmarks.filter(b => b.type === BookmarkType.Link).map(this.createBookmark);

    const filesGroup = new BookmarkTreeItem('Files', undefined, await BookmarkProvider.getCollapsibleState('Files'), undefined, undefined, [...files]);
	  const linksGroup = new BookmarkTreeItem('Links', undefined, await BookmarkProvider.getCollapsibleState('Links'), undefined, undefined, [...links]);

    return [filesGroup, linksGroup];
  }

  /**
   * Creates new bookmarks for the provided object
   * @param bookmark 
   * @returns 
   */
  private static createBookmark(bookmark: Bookmark) {
    return new BookmarkTreeItem(
      bookmark.name, 
      bookmark.description, 
      TreeItemCollapsibleState.None, 
      bookmark.path,
      bookmark.type
    );
  }
}