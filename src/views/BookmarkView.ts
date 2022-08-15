import { v4 } from 'uuid';
import { ThemeIcon } from 'vscode';
import { TreeItemCollapsibleState, TreeView, Uri, window } from 'vscode';
import { SETTING } from '../constants';
import { Bookmark, BookmarkType, Group } from '../models';
import { BookmarkProvider, BookmarkTreeItem } from '../providers/BookmarkProvider';
import { ExtensionService } from './../services/ExtensionService';


export class BookmarkView {
  private static provider: BookmarkProvider;
  private static tree: TreeView<BookmarkTreeItem>;
  public static currentItems: Bookmark[];
  public static currentTreeItems: BookmarkTreeItem[];

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
    const groups = ext.getSetting<Group[]>(SETTING.groups) || [];
    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks) || [];

    this.currentItems = bookmarks.map(b => ({...b, id: b.id || v4()}));
    
    this.currentTreeItems = [
      ...this.currentItems.filter(b => !b.groupId).map(this.createBookmark)
    ];

    const groupAndItems = this.currentItems.filter(b => b.groupId);
    for (const bookmark of groupAndItems) {
      let groupItem = this.currentTreeItems.find(c => c.id === `group.${bookmark.groupId}`);
      
      if (!groupItem) {
        const groupName = groups.find(g => g.id === bookmark.groupId)?.name || bookmark.groupId as string;
        const groupId = `group.${bookmark.groupId}`;
        groupItem = new BookmarkTreeItem(
          groupId,
          groupName, 
          undefined, 
          await BookmarkProvider.getCollapsibleState(groupId), 
          undefined,
          undefined,
          undefined,
          "group", 
          []
        );

        this.currentTreeItems.push(groupItem);
      }

      if (!groupItem.children) {
        groupItem.children = [];
      }

      groupItem.children.push(this.createBookmark(bookmark));
    }

    return [...this.currentTreeItems];
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