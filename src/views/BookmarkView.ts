import { BookmarkViewType } from './../models/BookmarkViewType';
import { hasTeamFile } from './../utils/HasTeamFile';
import { CONTEXT_KEY } from './../constants/ContextKeys';
import { DefaultGroup } from './../constants/DefaultGroups';
import { existsSync } from 'fs';
import { v4 } from 'uuid';
import { ThemeIcon, commands } from 'vscode';
import { TreeItemCollapsibleState, TreeView, window } from 'vscode';
import { SETTING, VIEW } from '../constants';
import { Bookmark, BookmarkType, Group } from '../models';
import { BookmarkProvider, BookmarkTreeItem } from '../providers/BookmarkProvider';
import { toAbsPath } from '../utils/ToAbsPath';
import { ExtensionService } from './../services/ExtensionService';
import { getTeamFileContents } from '../utils/GetTeamFileContents';


export class BookmarkView {
  private static globalProvider: BookmarkProvider;
  private static projectProvider: BookmarkProvider;
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

  /**
   * Initialize all the views
   */
  public static async init() {
    BookmarkView.bindGlobalbookmarks();
    BookmarkView.bindProjectBookmarks();
    BookmarkView.bindTeamBookmarks();
  }

  /**
   * Global settings bookmarks
   */
  public static async bindGlobalbookmarks() {
    const ext = ExtensionService.getInstance();
    const globalLinks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "global") || [];

    if (globalLinks && globalLinks.length > 0) {
      BookmarkView.globalProvider = new BookmarkProvider(BookmarkViewType.global);
      await commands.executeCommand('setContext', CONTEXT_KEY.hasGlobalBookmarks, true);

      BookmarkView.tree = window.createTreeView(VIEW.global, {
        treeDataProvider: BookmarkView.globalProvider,
        showCollapseAll: true
      });

      BookmarkView.tree.onDidExpandElement(e => {
        BookmarkView.globalProvider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
      });
      BookmarkView.tree.onDidCollapseElement(e => {
        BookmarkView.globalProvider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
      });
    } else {
      await commands.executeCommand('setContext', CONTEXT_KEY.hasGlobalBookmarks, false);
    }
  }

  /**
   * Project bookmarks
   */
  public static async bindProjectBookmarks() {
    BookmarkView.projectProvider = new BookmarkProvider(BookmarkViewType.project);

    BookmarkView.tree = window.createTreeView(VIEW.project, {
      treeDataProvider: BookmarkView.projectProvider,
      showCollapseAll: true
    });

    BookmarkView.tree.onDidExpandElement(e => {
      BookmarkView.projectProvider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
    });
    BookmarkView.tree.onDidCollapseElement(e => {
      BookmarkView.projectProvider.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
    });
  }

  /**
   * Team bookmarks
   */
  public static async bindTeamBookmarks() {
    if (await hasTeamFile()) {
      BookmarkView.teamProvider = new BookmarkProvider(BookmarkViewType.team);
      await commands.executeCommand('setContext', CONTEXT_KEY.hasTeamFile, true);

      BookmarkView.teamTree = window.createTreeView(VIEW.team, {
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
      await commands.executeCommand('setContext', CONTEXT_KEY.hasTeamFile, false);
    }
  }

  public static async update(type: BookmarkViewType) {
    if (type === BookmarkViewType.project) {
      BookmarkView.projectProvider.refresh();
    } else {
      if (BookmarkView.teamProvider) {
        BookmarkView.teamProvider.refresh();
      } else {
        BookmarkView.bindTeamBookmarks();
      }
    }
  }

  public static async close(type: BookmarkViewType) {
    if (type === BookmarkViewType.project) {
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
  public static async getBookmarks(viewType?: BookmarkViewType) {
    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups, viewType && viewType === BookmarkViewType.global ? "global": "project") || [];
    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, viewType && viewType === BookmarkViewType.global ? "global": "project") || [];

    BookmarkView._currentItems = BookmarkView.processBookmarks(bookmarks);
    
    this.currentTreeItems = [
      ...this._currentItems.filter(b => !b.groupId && !b.isDeleted).map(b => this.createBookmark(b))
    ];

    // Add all items assigned to a group
    for (const group of groups) {
      const groupItems = this._currentItems.filter(b => b.groupId === group.id && !b.isDeleted);

      if (groupItems.length > 0) {
        const groupItem = await this.groupBookmarks(group, groupItems, BookmarkViewType.project);
        if (groupItem) {
          this.currentTreeItems.push(groupItem);
        }
      }
    }

    // Deleted files
    const deletedFiles = this._currentItems.filter(b => b.isDeleted);
    if (deletedFiles.length > 0) {
      const groupItem = await this.groupBookmarks(DefaultGroup.deleted, deletedFiles, BookmarkViewType.project, new ThemeIcon("trash"), "deleted");
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
      type === BookmarkViewType.project ? 
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
      bookmark.highlightedLine,
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