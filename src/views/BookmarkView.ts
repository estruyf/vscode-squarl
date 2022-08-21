import { BookmarkViewType } from './../models/BookmarkViewType';
import { hasTeamFile } from './../utils/HasTeamFile';
import { CONTEXT_KEY } from './../constants/ContextKeys';
import { DefaultGroup } from './../constants/DefaultGroups';
import { existsSync } from 'fs';
import { v4 } from 'uuid';
import { ThemeIcon, commands } from 'vscode';
import { TreeItemCollapsibleState, TreeView, window } from 'vscode';
import { SETTING } from '../constants';
import { Bookmark, BookmarkType, Group } from '../models';
import { BookmarkProvider, BookmarkTreeItem } from '../providers/BookmarkProvider';
import { toAbsPath } from '../utils/ToAbsPath';
import { ExtensionService } from './../services/ExtensionService';
import { getTeamFileContents } from '../utils/GetTeamFileContents';


export class BookmarkView {
  private static provider: BookmarkProvider;
  private static teamProvider: BookmarkProvider | undefined;
  private static tree: TreeView<BookmarkTreeItem>;
  private static teamTree: TreeView<BookmarkTreeItem> | undefined;
  public static _currentItems: Bookmark[];
  public static _currentTeamItems: Bookmark[];
  public static currentTreeItems: BookmarkTreeItem[];
  public static currentTeamTreeItems: BookmarkTreeItem[];
  public static deletedTreeItems: BookmarkTreeItem[];

  public static get currentItems() {
    if (BookmarkView._currentItems && BookmarkView._currentItems.length > 0) {
      return BookmarkView._currentItems;
    } else {
      const ext = ExtensionService.getInstance();
      const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks) || [];
      BookmarkView._currentItems = BookmarkView.processBookmarks(bookmarks);
      return BookmarkView._currentItems;
    }
  }

  public static async currentTeamItems() {
    if (BookmarkView._currentTeamItems && BookmarkView._currentTeamItems.length > 0) {
      return BookmarkView._currentTeamItems;
    } else {
      const teamFileData = await getTeamFileContents();
      return teamFileData?.bookmarks;
    }
  }

  public static async init() {
    await BookmarkView.bindBookmarks();
  }

  public static async bindBookmarks() {
    BookmarkView.provider = new BookmarkProvider();

    BookmarkView.tree = window.createTreeView('squarl.view.personal', {
      treeDataProvider: BookmarkView.provider,
      showCollapseAll: true
    });

    BookmarkView.tree.onDidExpandElement(e => {
      BookmarkView.provider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
    });
    BookmarkView.tree.onDidCollapseElement(e => {
      BookmarkView.provider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
    });

    BookmarkView.bindTeamView()
  }

  public static async bindTeamView() {
    if (await hasTeamFile()) {
      BookmarkView.teamProvider = new BookmarkProvider(true);
      BookmarkView.tree.title = "Personal Bookmarks";
      await commands.executeCommand('setContext', CONTEXT_KEY.hasTeamFile, true);

      BookmarkView.teamTree = window.createTreeView('squarl.view.team', {
        treeDataProvider: BookmarkView.teamProvider,
        showCollapseAll: true
      });

      BookmarkView.teamTree.onDidExpandElement(e => {
        BookmarkView.teamProvider?.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
      });
      BookmarkView.teamTree.onDidCollapseElement(e => {
        BookmarkView.teamProvider?.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
      });
    } else {
      BookmarkView.tree.title = "Bookmarks";
      await commands.executeCommand('setContext', CONTEXT_KEY.hasTeamFile, false);
    }
  }

  public static async update(type: BookmarkViewType) {
    if (type === BookmarkViewType.personal) {
      BookmarkView.provider.refresh();
    } else {
      if (BookmarkView.teamProvider) {
        BookmarkView.teamProvider.refresh();
      } else {
        BookmarkView.bindTeamView();
      }
    }
  }

  public static async close(type: BookmarkViewType) {
    if (type === BookmarkViewType.personal) {
      BookmarkView.tree.dispose();
    } else {
      BookmarkView.teamTree?.dispose();
      BookmarkView.teamTree = undefined;
      BookmarkView.teamProvider = undefined;
    }
  }

  /**
   * Retrieve all the bookmarks for the current workspace
   * @returns 
   */
  public static async getBookmarks() {
    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups) || [];
    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks) || [];

    BookmarkView._currentItems = BookmarkView.processBookmarks(bookmarks);
    
    this.currentTreeItems = [
      ...this._currentItems.filter(b => !b.groupId && !b.isDeleted).map(b => this.createBookmark(b))
    ];

    // Add all items assigned to a group
    for (const group of groups) {
      const groupItems = this._currentItems.filter(b => b.groupId === group.id && !b.isDeleted);

      if (groupItems.length > 0) {
        const groupItem = await this.groupBookmarks(group, groupItems, BookmarkViewType.personal);
        if (groupItem) {
          this.currentTreeItems.push(groupItem);
        }
      }
    }

    // Deleted files
    const deletedFiles = this._currentItems.filter(b => b.isDeleted);
    if (deletedFiles.length > 0) {
      const groupItem = await this.groupBookmarks(DefaultGroup.deleted, deletedFiles, BookmarkViewType.personal, new ThemeIcon("trash"), "deleted");
      if (groupItem) {
        this.currentTreeItems.push(groupItem);
      }
    }

    return [...this.currentTreeItems];
  }

  /**
   * Retrieve all the team bookmarks for the current workspace
   * @returns 
   */
  public static async getTeamBookmarks() {
    const teamFileData = await getTeamFileContents();

    if (!teamFileData) {
      return;
    }

    if (teamFileData.name && BookmarkView.teamTree) {
      BookmarkView.teamTree.title = teamFileData.name;
    }

    this._currentTeamItems = BookmarkView.processBookmarks(teamFileData.bookmarks || []);
    
    this.currentTeamTreeItems = [
      ...this._currentTeamItems.filter(b => !b.groupId && !b.isDeleted).map(b => this.createBookmark(b))
    ];

    // Add all items assigned to a group
    for (const group of teamFileData.groups) {
      const groupItems = this._currentTeamItems.filter(b => b.groupId === group.id && !b.isDeleted);

      if (groupItems.length > 0) {
        const groupItem = await this.groupBookmarks(group, groupItems, BookmarkViewType.team);
        if (groupItem) {
          this.currentTeamTreeItems.push(groupItem);
        }
      }
    }

    // Deleted files
    const deletedFiles = this._currentTeamItems.filter(b => b.isDeleted);
    if (deletedFiles.length > 0) {
      const groupItem = await this.groupBookmarks(DefaultGroup.deleted, deletedFiles, BookmarkViewType.team, new ThemeIcon("trash"), "deleted");
      if (groupItem) {
        this.currentTeamTreeItems.push(groupItem);
      }
    }

    return [...this.currentTeamTreeItems];
  }

  /**
   * Group bookmarks
   */
  public static async groupBookmarks(
    group: Group, 
    items: Bookmark[],
    type: BookmarkViewType,
    icon?: ThemeIcon, 
    contextValue?: string
  ): Promise<BookmarkTreeItem> {
    const groupId =`group.${group.id}`;
    let groupItem = 
      type === BookmarkViewType.personal ? 
        this.currentTreeItems.find(c => c.id === groupId) :
        this.currentTeamTreeItems.find(c => c.id === groupId);

    if (!groupItem) {
      const groupName = group.name || group.id;
      groupItem = new BookmarkTreeItem(
        groupId,
        groupName, 
        undefined, 
        await BookmarkProvider.getCollapsibleState(groupId, type), 
        icon,
        undefined,
        undefined,
        contextValue || "group", 
        []
      );
    }

    for (const bookmark of items) {
      if (!groupItem.children) {
        groupItem.children = [];
      }

      groupItem.children.push(this.createBookmark(bookmark, contextValue));
    }

    return groupItem;
  }

  /**
   * Creates new bookmarks for the provided object
   * @param bookmark 
   * @returns 
   */
  public static createBookmark(bookmark: Bookmark, contextValue: string | undefined = undefined) {    
    return new BookmarkTreeItem(
      bookmark.id || v4(),
      bookmark.name, 
      bookmark.description, 
      TreeItemCollapsibleState.None, 
      bookmark.iconName || undefined,
      bookmark.path,
      bookmark.type,
      contextValue ? `${contextValue}Bookmark` : "bookmark",
    );
  }

  /**
   * Process all the bookmarks with an id and check if not deleted
   * @param bookmarks 
   */
  private static processBookmarks(bookmarks: Bookmark[]) {
    return bookmarks.map(b => {
      if (b.type === BookmarkType.File && !existsSync(toAbsPath(b.path).fsPath)) {
        b.isDeleted = true;
      } else {
        delete b.isDeleted;
      }

      return {
        ...b, 
        id: b.id || v4()
      }
    });
  }
}