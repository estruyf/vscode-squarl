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
import { createBookmark } from '../utils';


export class BookmarkView {
  private provider: BookmarkProvider | undefined;
  private tree: TreeView<BookmarkTreeItem> | undefined;
  public _currentItems: Bookmark[] | undefined;

  constructor(private viewType: BookmarkViewType) {
    this.bindbookmarks();
  }

  public async currentItems() {
    if (this._currentItems && this._currentItems.length > 0) {
      return this._currentItems;
    }

    if (this.viewType === BookmarkViewType.team) {
      const teamFileData = await getTeamFileContents();
      return teamFileData?.bookmarks;
    }

    const ext = ExtensionService.getInstance();
    const scope = this.viewType === BookmarkViewType.global ? "global" : "project";
    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, scope) || [];
    this._currentItems = this.processBookmarks(bookmarks);
    return this._currentItems;
  }

  /**
   * Bind bookmarks
   */
  public async bindbookmarks() {
    if (this.viewType === BookmarkViewType.global) {
      const ext = ExtensionService.getInstance();
      const globalLinks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "global") || [];
      await commands.executeCommand('setContext', CONTEXT_KEY.hasGlobalBookmarks, (globalLinks && globalLinks.length > 0));
    } else if (this.viewType === BookmarkViewType.team) {
      await commands.executeCommand('setContext', CONTEXT_KEY.hasTeamFile, await hasTeamFile());
    }
    
    this.provider = new BookmarkProvider(this.viewType);
    await commands.executeCommand('setContext', CONTEXT_KEY.hasGlobalBookmarks, true);

    let viewId;
    if (this.viewType === BookmarkViewType.global) {
      viewId = VIEW.global;
    } else if (this.viewType === BookmarkViewType.project) {
      viewId = VIEW.project;
    } else if (this.viewType === BookmarkViewType.team) {
      viewId = VIEW.team;
    }

    this.tree = window.createTreeView(viewId || VIEW.project, {
      treeDataProvider: this.provider,
      showCollapseAll: true
    });

    this.tree.onDidExpandElement(e => {
      this.provider?.updateCollapsibleState(e.element, TreeItemCollapsibleState.Expanded);
    });
    this.tree.onDidCollapseElement(e => {
      this.provider?.updateCollapsibleState(e.element, TreeItemCollapsibleState.Collapsed);
    });
  }

  /**
   * Update the treeview
   */
  public update() {
    if (!this.provider) {
      this.bindbookmarks();
    } else {
      this.provider.refresh();
    }
  }

  /**
   * Retrieve all the bookmarks for the current workspace
   * @returns 
   */
  public async getBookmarks() {
    const ext = ExtensionService.getInstance();
    let groups: Group[] = [];
    let bookmarks: Bookmark[] = [];

    if (this.viewType === BookmarkViewType.team) {
      const teamFileData = await getTeamFileContents();

      if (!teamFileData) {
        return;
      }

      if (teamFileData.name && this.tree) {
        this.tree.title = teamFileData.name;
      }

      groups = teamFileData.groups || [];
      bookmarks = teamFileData.bookmarks || [];
    } else {
      groups = ext.getSetting<Group[]>(SETTING.groups, this.viewType && this.viewType === BookmarkViewType.global ? "global": "project") || [];
      bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, this.viewType && this.viewType === BookmarkViewType.global ? "global": "project") || [];
    }

    const crntBookmarks = this.processBookmarks(bookmarks);
    let crntTreeItems = [
      ...crntBookmarks.filter(b => !b.groupId && !b.isDeleted).map(b => createBookmark(b))
    ];

    // Add all items assigned to a group
    for (const group of groups) {
      const groupItems = crntBookmarks.filter(b => b.groupId === group.id && !b.isDeleted);

      if (groupItems.length > 0) {
        const groupItem = await this.groupBookmarks(group, groupItems, this.viewType || BookmarkViewType.project);
        if (groupItem) {
          crntTreeItems.push(groupItem);
        }
      }
    }

    // Ungrouped items
    const groupItems = crntBookmarks.filter(b => b.groupId && !b.isDeleted);
    if (groups.length > 0) {
      const ungrouped = [];

      for (const item of groupItems) {
        if (!groups.find(g => g.id === item.groupId)) {
          ungrouped.push(item);
        }
      }

      if (ungrouped.length > 0) {
        const groupItem = await this.groupBookmarks(DefaultGroup.unknown, ungrouped, this.viewType || BookmarkViewType.project, new ThemeIcon("question"));
        if (groupItem) {
          crntTreeItems.push(groupItem);
        }
      }
    }

    // Deleted files
    const deletedFiles = crntBookmarks.filter(b => b.isDeleted);
    if (deletedFiles.length > 0) {
      const groupItem = await this.groupBookmarks(DefaultGroup.deleted, deletedFiles, this.viewType || BookmarkViewType.project, new ThemeIcon("trash"), "deleted");
      if (groupItem) {
        crntTreeItems.push(groupItem);
      }
    }

    this._currentItems = crntBookmarks;

    return [...crntTreeItems];
  }

  /**
   * Group bookmarks
   */
  public async groupBookmarks(
    group: Group, 
    items: Bookmark[],
    type: BookmarkViewType,
    icon?: ThemeIcon, 
    contextValue?: string
  ): Promise<BookmarkTreeItem> {
    const groupId =`group.${group.id}`;
    let groupItem = undefined;

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

      groupItem.children.push(createBookmark(bookmark, contextValue));
    }

    return groupItem;
  }

  /**
   * Process all the bookmarks with an id and check if not deleted
   * @param bookmarks 
   */
  private processBookmarks(bookmarks: Bookmark[]) {
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