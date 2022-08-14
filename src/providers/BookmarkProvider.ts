import { ExtensionService } from './../services/ExtensionService';
import { join } from "path";
import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { BookmarkType } from '../models';
import { BookmarkView } from '../views/BookmarkView';



export class BookmarkProvider implements TreeDataProvider<BookmarkTreeItem> {
  private static readonly Collapsible_Key = `bookmarks.collapsibleStates`;
  private ext: ExtensionService;

  private _onDidChangeTreeData = new EventEmitter<BookmarkTreeItem | void>()
  public readonly onDidChangeTreeData: Event<void | BookmarkTreeItem> = this._onDidChangeTreeData.event;

  public static async getCollapsibleState(id: string) {
    const elements = await ExtensionService.getInstance().getState<{ [prop: string]: TreeItemCollapsibleState }>(BookmarkProvider.Collapsible_Key) || {};

    if (elements[id]) {
      return elements[id];
    }

    return TreeItemCollapsibleState.Expanded;
  }

  constructor() {
  // constructor(private bookmarks: BookmarkTreeItem[]) {
    this.ext = ExtensionService.getInstance();
  }

  public refresh(): void {
    // Triggers the getChildren method to refresh the view
    this._onDidChangeTreeData.fire();
  }

  public async updateCollapsibleState(element: BookmarkTreeItem, collapsibleState: TreeItemCollapsibleState): Promise<void> {
    const elements = await this.ext.getState<{ [prop: string]: TreeItemCollapsibleState }>(BookmarkProvider.Collapsible_Key) || {};

    elements[element.label] = collapsibleState;

    this.ext.setState(BookmarkProvider.Collapsible_Key, elements);
  }
  
  public getTreeItem(element: BookmarkTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  
  public async getChildren(element?: BookmarkTreeItem | undefined): Promise<BookmarkTreeItem[]> {
    if (!element) {
      return await BookmarkView.getBookmarks();
    } else {
      if (element.children) {
        return element.children;
      }
      return [];
    }
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
    public type?: BookmarkType,
    public contextValue?: string,
    public children?: BookmarkTreeItem[]
  ) {
    super(label, collapsibleState);

    if (type === BookmarkType.File && path) {
      const wsFolder = ExtensionService.getInstance().getWorkspaceFolder();
      let fileResourcePath = Uri.parse(path);

      if (wsFolder) {
        fileResourcePath = Uri.file(join(wsFolder.fsPath, path));
      }

      this.resourceUri = fileResourcePath;
    } else if (type === BookmarkType.Link && path) {
      this.resourceUri = Uri.parse(path);
      this.iconPath = new ThemeIcon("bookmark");
    } else {
      this.resourceUri = undefined;
    }

    if (this.resourceUri) {
      this.command = {
        command: 'vscode.open',
        title: 'Open',
        arguments: [this.resourceUri]
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
