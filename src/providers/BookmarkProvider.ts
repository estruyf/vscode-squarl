import { BookmarkViewType } from './../models/BookmarkViewType';
import { toAbsPath } from './../utils/ToAbsPath';
import { ExtensionService } from './../services/ExtensionService';
import { join } from "path";
import { Event, EventEmitter, Position, Range, TextDocumentShowOptions, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { BookmarkType } from '../models';
import { BookmarkView } from '../views/BookmarkView';
import { COMMAND } from '../constants';



export class BookmarkProvider implements TreeDataProvider<BookmarkTreeItem> {
  private static readonly Collapsible_Personal_Key = `bookmarks.personal.collapsibleStates`;
  private static readonly Collapsible_Team_Key = `bookmarks.team.collapsibleStates`;
  private ext: ExtensionService;

  private _onDidChangeTreeData = new EventEmitter<BookmarkTreeItem | void>()
  public readonly onDidChangeTreeData: Event<void | BookmarkTreeItem> = this._onDidChangeTreeData.event;

  public static async getCollapsibleState(id: string, type: BookmarkViewType) {
    const stateKey = type === BookmarkViewType.team ? BookmarkProvider.Collapsible_Team_Key : BookmarkProvider.Collapsible_Personal_Key
    const elements = await ExtensionService.getInstance().getState<{ [prop: string]: TreeItemCollapsibleState }>(stateKey) || {};

    if (elements[id]) {
      return elements[id];
    }

    return TreeItemCollapsibleState.Expanded;
  }

  constructor(private isTeam: boolean = false) {
    // constructor(private bookmarks: BookmarkTreeItem[]) {
    this.ext = ExtensionService.getInstance();
  }

  public refresh(): void {
    // Triggers the getChildren method to refresh the view
    this._onDidChangeTreeData.fire();
  }

  public async updateCollapsibleState(element: BookmarkTreeItem, collapsibleState: TreeItemCollapsibleState): Promise<void> {
    const stateKey = this.isTeam ? BookmarkProvider.Collapsible_Team_Key : BookmarkProvider.Collapsible_Personal_Key;
    const elements = await this.ext.getState<{ [prop: string]: TreeItemCollapsibleState }>(stateKey) || {};

    elements[element.id] = collapsibleState;

    this.ext.setState(stateKey, elements);
  }
  
  public getTreeItem(element: BookmarkTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  
  public async getChildren(element?: BookmarkTreeItem | undefined): Promise<BookmarkTreeItem[]> {
    if (!element) {
      if (this.isTeam) {
        const teamBookmarks = await BookmarkView.getTeamBookmarks();
        if (teamBookmarks) {
          return teamBookmarks;
        }
      } else {
        return await BookmarkView.getBookmarks();
      }
    } else {
      if (element.children) {
        return element.children;
      }
      return [];
    }

    return [];
  }
}

export class BookmarkTreeItem extends TreeItem {
  
  constructor(
    public id: string,
    public label: string,
    public description: string | undefined,
    public collapsibleState: TreeItemCollapsibleState,
    public iconPath: string | ThemeIcon | Uri | { light: string | Uri; dark: string | Uri; } | undefined,
    public path?: string,
    public highlightedLine?: number,
    public type?: BookmarkType,
    public contextValue?: string,
    public children?: BookmarkTreeItem[]
  ) {
    super(label, collapsibleState);

    if (!type) {
      if (path?.startsWith(`http`)) {
        type = BookmarkType.Link;
      } else if (path) {
        type = BookmarkType.File;
      }
    }

    if (type === BookmarkType.File && path) {
      const fileResourcePath = toAbsPath(path);
      this.resourceUri = fileResourcePath;
    } else if (type === BookmarkType.Link && path) {
      this.resourceUri = Uri.parse(path);
      this.iconPath = iconPath ? new ThemeIcon(iconPath as string) : new ThemeIcon("bookmark");
    } else {
      this.resourceUri = undefined;
    }

    if (this.resourceUri) {
      const commandArguments: any = [this.resourceUri];

      if (highlightedLine) {
        const viewOptions = {
          selection: new Range(new Position(highlightedLine, 0), new Position(highlightedLine, 0))
        } as TextDocumentShowOptions;
        
        commandArguments.push(viewOptions);
      }

      this.command = {
        command: COMMAND.openBookmark,
        title: 'Open',
        arguments: commandArguments
      };
    }

    this.tooltip = this.label;

    const crntLabel = this.label;
    const crntDescription = this.description;

    if (crntDescription) {
      this.label = crntDescription;
      this.description = crntLabel
    }
  }
}
