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
    const projectBookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "project") || [];
    const globalBookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "global") || [];
    this._currentItems = [...this.validateBookmarks(projectBookmarks, false), ...this.validateBookmarks(globalBookmarks, true)];
    return this._currentItems;
  }

  /**
   * Bind bookmarks
   */
  public async bindbookmarks() {
    if (this.viewType === BookmarkViewType.team) {
      await commands.executeCommand('setContext', CONTEXT_KEY.hasTeamFile, await hasTeamFile());
    }
    
    this.provider = new BookmarkProvider(this.viewType);

    let viewId;
    if (this.viewType === BookmarkViewType.project) {
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
      const projectGroups = ext.getSetting<Group[]>(SETTING.groups, "project") || [];
      const projectBookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "project") || [];

      const globalBookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "global") || [];

      groups = [...projectGroups];
      bookmarks = [...projectBookmarks.map(b => ({...b, isGlobal: false})), ...globalBookmarks.map(b => ({...b, isGlobal: true}))];
    }

    // Remove duplicates
    groups = groups.filter((group, index, array) => { 
      return array.findIndex(g => g.id === group.id) === index;
    });

    if (this.viewType === BookmarkViewType.project) {
      // Set the global context key
      await commands.executeCommand('setContext', CONTEXT_KEY.hasGlobalBookmarks, bookmarks.filter(b => b.isGlobal).length > 0);
    }

    if (bookmarks.filter(b => b.isGlobal).length > 0) {
      const globalGroups = ext.getSetting<Group[]>(SETTING.groups, "global") || [];

      const globalItems = await this.processBookmarks(bookmarks.filter(b => b.isGlobal), globalGroups, true);
      const projectItems = await this.processBookmarks(bookmarks.filter(b => !b.isGlobal), groups, false);

      const globalGroup = new BookmarkTreeItem(
        "global",
        "Global bookmarks", 
        undefined, 
        await BookmarkProvider.getCollapsibleState("global", BookmarkViewType.project), 
        true,
        new ThemeIcon("globe"),
        undefined,
        undefined,
        undefined,
        "globalGroup", 
        [...globalItems.treeItems]
      );

      const projectGroup = new BookmarkTreeItem(
        "project",
        "Project bookmarks", 
        undefined, 
        await BookmarkProvider.getCollapsibleState("project", BookmarkViewType.project), 
        false,
        new ThemeIcon("code"),
        undefined,
        undefined,
        undefined,
        "projectGroup", 
        [...projectItems.treeItems]
      );

      this._currentItems = [...projectItems.bookmarks, ...globalItems.bookmarks];
      return [globalGroup, projectGroup];
    } else {
      const items = await this.processBookmarks(bookmarks, groups);

      this._currentItems = items.bookmarks;
      return [...items.treeItems];
    }
  }

  /**
   * Group bookmarks
   */
  public async groupBookmarks(
    group: Group, 
    items: Bookmark[],
    type: BookmarkViewType,
    isGlobal?: boolean,
    icon?: ThemeIcon, 
    contextValue?: string
  ): Promise<BookmarkTreeItem> {
    const groupId =`group.${isGlobal ? `global.` : ``}${group.id}`;
    let groupItem = undefined;

    if (!groupItem) {
      const groupName = group.name || group.id;
      groupItem = new BookmarkTreeItem(
        groupId,
        groupName, 
        undefined, 
        await BookmarkProvider.getCollapsibleState(groupId, type), 
        isGlobal,
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
   * Processes bookmarks to generate tree items
   * @param bookmarks 
   * @returns 
   */
  private async processBookmarks(bookmarks: Bookmark[], groups: Group[], isGlobal?: boolean) {
    const crntBookmarks = this.validateBookmarks(bookmarks, isGlobal);

    let crntTreeItems = [
      ...crntBookmarks.filter(b => !b.groupId && !b.isDeleted).map(b => createBookmark(b))
    ];

    // Add all items assigned to a group
    for (const group of groups) {
      const groupItems = crntBookmarks.filter(b => b.groupId === group.id && !b.isDeleted);

      if (groupItems.length > 0) {
        const groupItem = await this.groupBookmarks(group, groupItems, this.viewType || BookmarkViewType.project, isGlobal);
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
        const groupItem = await this.groupBookmarks(DefaultGroup.unknown, ungrouped, this.viewType || BookmarkViewType.project, isGlobal, new ThemeIcon("question"));
        if (groupItem) {
          crntTreeItems.push(groupItem);
        }
      }
    }

    // Deleted files
    const deletedFiles = crntBookmarks.filter(b => b.isDeleted);
    if (deletedFiles.length > 0) {
      const groupItem = await this.groupBookmarks(DefaultGroup.deleted, deletedFiles, this.viewType || BookmarkViewType.project, isGlobal, new ThemeIcon("trash"), "deleted");
      if (groupItem) {
        crntTreeItems.push(groupItem);
      }
    }

    return {
      bookmarks: crntBookmarks,
      treeItems: crntTreeItems
    };
  }

  /**
   * Validate all the bookmarks with an id and check if not deleted
   * @param bookmarks 
   */
  private validateBookmarks(bookmarks: Bookmark[], isGlobal: boolean = false) {
    return bookmarks.map(b => {
      if (b.type === BookmarkType.File && !existsSync(isGlobal ? b.path : toAbsPath(b.path).fsPath)) {
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