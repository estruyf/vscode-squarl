import { ExtensionService } from './../services/ExtensionService';
import { join } from "path";
import { Event, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { BookmarkType } from '../models';



export class BookmarkProvider implements TreeDataProvider<BookmarkTreeItem> {
  private static readonly Collapsible_Key = `bookmarks.collapsibleStates`;
  private ext: ExtensionService;
  public onDidChangeTreeData?: Event<void | BookmarkTreeItem | BookmarkTreeItem[] | null | undefined> | undefined;

  public static async getCollapsibleState(id: string) {
    const elements = await ExtensionService.getInstance().getState<{ [prop: string]: TreeItemCollapsibleState }>(BookmarkProvider.Collapsible_Key) || {};

    if (elements[id]) {
      return elements[id];
    }

    return TreeItemCollapsibleState.Expanded;
  }

  constructor(private bookmarks: BookmarkTreeItem[]) {
    this.ext = ExtensionService.getInstance();
  }

  public async updateCollapsibleState(element: BookmarkTreeItem, collapsibleState: TreeItemCollapsibleState): Promise<void> {
    const elements = await this.ext.getState<{ [prop: string]: TreeItemCollapsibleState }>(BookmarkProvider.Collapsible_Key) || {};

    elements[element.label] = collapsibleState;

    this.ext.setState(BookmarkProvider.Collapsible_Key, elements);
  }
  
  public getTreeItem(element: BookmarkTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  
  public getChildren(element?: BookmarkTreeItem | undefined): ProviderResult<BookmarkTreeItem[]> {
    if (element) {
      if (element.children) {
        return element.children;
      }
      return [];
    } else {
      return this.bookmarks;
    }
  }
}

export class BookmarkTreeItem extends TreeItem {
  
  constructor(
    public readonly label: string,
    public readonly description: string | undefined,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public path?: string,
    public type?: BookmarkType,
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
  }
}
