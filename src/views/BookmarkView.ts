import { v4 } from 'uuid';
import { ThemeIcon } from 'vscode';
import { TreeItemCollapsibleState, TreeView, Uri, window } from 'vscode';
import { SETTING } from '../constants';
import { Bookmark, BookmarkType } from '../models';
import { BookmarkProvider, BookmarkTreeItem } from '../providers/BookmarkProvider';
import { ExtensionService } from './../services/ExtensionService';


export class BookmarkView {
  private static provider: BookmarkProvider;
  private static tree: TreeView<BookmarkTreeItem>;
  public static currentItems: Bookmark[];

  public static async init() {
    await BookmarkView.bindBookmarks();

    BookmarkView.tree.onDidExpandElement(e => {
      BookmarkView.provider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
    });
    BookmarkView.tree.onDidCollapseElement(e => {
      BookmarkView.provider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
    });
  }

  public static async bindBookmarks() {
    BookmarkView.provider = new BookmarkProvider();

    BookmarkView.tree = window.createTreeView('squarl-bookmarks', {
      treeDataProvider: BookmarkView.provider,
      showCollapseAll: true
    });
  }

  public static async update() {
    BookmarkView.provider.refresh();
  }

  /**
   * Retrieve all the bookmarks for the current workspace
   * @returns 
   */
  public static async getBookmarks() {
    const ext = ExtensionService.getInstance();
    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks) || [];

    this.currentItems = bookmarks.map(b => ({...b, id: b.id || v4()}));
    
    const files = this.currentItems.filter(b => b.type === BookmarkType.File).map(this.createBookmark);
    const links = this.currentItems.filter(b => b.type === BookmarkType.Link).map(this.createBookmark);

    const filesGroup = new BookmarkTreeItem(
      'group.files',
      'Files', 
      undefined, 
      await BookmarkProvider.getCollapsibleState('Files'), 
      new ThemeIcon(`files`),
      undefined,
      undefined,
      undefined, 
      [...files]
    );

	  const linksGroup = new BookmarkTreeItem(
      'group.links',
      'Links',
      undefined,
      await BookmarkProvider.getCollapsibleState('Links'),
      new ThemeIcon(`globe`),
      undefined,
      undefined,
      undefined,
      [...links]
    );

    return [filesGroup, linksGroup];
  }

  /**
   * Creates new bookmarks for the provided object
   * @param bookmark 
   * @returns 
   */
  public static createBookmark(bookmark: Bookmark) {
    return new BookmarkTreeItem(
      bookmark.id || v4(),
      bookmark.name, 
      bookmark.description, 
      TreeItemCollapsibleState.None, 
      undefined,
      bookmark.path,
      bookmark.type,
      "bookmark",
    );
  }
}