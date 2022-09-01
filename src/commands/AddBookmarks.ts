import { getBookmarks } from './../utils/GetBookmarks';
import { QuickPickItem, Uri } from 'vscode';
import { Notifications } from './../services/Notifications';
import { Bookmark } from './../models/Bookmark';
import { COMMAND } from './../constants/Commands';
import { commands, window } from 'vscode';
import { ExtensionService } from './../services/ExtensionService';
import { BookmarkType } from '../models';
import { parse, relative } from 'path';
import { selectGroupQuestion } from '../questions';
import { saveBookmarks, fetchLinkDetails } from '../utils';
import { ViewService } from '../services';
import { BookmarkTreeItem } from '../providers/BookmarkProvider';


export class AddBookmarks {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.addLink, AddBookmarks.addLink)
    );
    subscriptions.push(
      commands.registerCommand(COMMAND.addFile, AddBookmarks.addFile)
    );
  }

  /**
   * Add hyperlink as a bookmark
   * @returns 
   */
  public static async addLink(crntBookmark?: BookmarkTreeItem) {
    const isGlobal = await AddBookmarks.isGlobalQuestion(crntBookmark?.isGlobal);

    if (isGlobal === undefined) {
      return;
    }

    const link = await window.showInputBox({
      title: "Link",
      prompt: 'Enter the link to add',
      placeHolder: 'https://example.com',
      ignoreFocusOut: true
    });

    if (!link) {
      return;
    }

    const linkDetails = await fetchLinkDetails(link);
    let name = linkDetails?.title;
    let description = linkDetails?.description;

    name = await window.showInputBox({
      title: "Name",
      prompt: 'Enter the name of the link',
      placeHolder: '',
      ignoreFocusOut: true,
      value: name || link
    });

    if (!name) {
      return;
    }

    description = await window.showInputBox({
      title: "Description",
      prompt: 'Enter a description for the link',
      placeHolder: 'Example link',
      ignoreFocusOut: true,
      value: description
    });

    const groupId = await selectGroupQuestion(undefined, isGlobal);
    
    if (groupId === undefined) {
      return;
    }

    AddBookmarks.add(name, link, description || "", BookmarkType.Link, groupId, isGlobal);    
  }

  /**
   * Add file as a bookmark
   * @param file 
   * @returns 
   */
  public static async addFile(file?: Uri | BookmarkTreeItem) {
    let path: string;
    const editor = window.activeTextEditor;

    if (!file || !(file as Uri).fsPath) {
      if (!editor) {
        Notifications.warning(`Didn't find an active file to add`);
        return;
      }

      path = editor.document.uri.fsPath;
    } else {
      path = (file as Uri).fsPath;
    }

    if (!path) {
      return;
    }

    const isGlobal = await AddBookmarks.isGlobalQuestion((file as BookmarkTreeItem)?.isGlobal);
    if (isGlobal === undefined) {
      return;
    }

    // Get filename from path
    const fileParse = parse(path);
    const fileName = `${fileParse.name}${fileParse.ext}`;

    // Get relative path from workspace root
    const ext = ExtensionService.getInstance();
    const wsPath = ext.getWorkspaceFolder();
    if (wsPath) {
      path = relative(wsPath.fsPath, path);
    }

    const bookmarks = await ViewService.projectView.currentItems() || [];
    if (bookmarks.find(b => b.path === path)) {
      const answer = await window.showQuickPick(["Yes", "No"], {
        title: "Duplicate file entry",
        placeHolder: "It seems the file was already added, do you wish to continue?"
      });
  
      if (!answer && answer === "No") {
        return;
      }
    }

    const description = await window.showInputBox({
      title: "Description",
      prompt: 'Enter a description for the file',
      placeHolder: '',
      ignoreFocusOut: false,
      value: fileName
    });

    if (description === undefined) {
      return;
    }

    const groupId = await selectGroupQuestion(undefined, isGlobal);

    if (groupId === undefined) {
      return;
    }

    let highlightedLine = undefined;
    const activeSelection = editor?.selection;
    if (activeSelection && activeSelection.start.line) {
      const answer = await window.showQuickPick(["Yes", "No"], {
        title: "Highlighted line",
        placeHolder: "Do you want to add the highlighted line reference?"
      });
  
      if (answer && answer === "Yes") {
        highlightedLine = activeSelection.start.line
      }
    }

    AddBookmarks.add(fileName, path, description || "", BookmarkType.File, groupId, isGlobal, highlightedLine);    
  }

  /**
   * Ask if the bookmark should be global or not
   * @param isGlobal 
   * @returns 
   */
  private static async isGlobalQuestion(isGlobal?: boolean) {
    if (isGlobal === undefined) {
      const answer = await window.showQuickPick([
        {
          label: "No",
          description: "Workspace/project settings"
        } as QuickPickItem,
        {
          label: "Yes",
          description: "Global user settings"
        } as QuickPickItem,
      ], {
        title: "Do you want to add the bookmark to the global settings?",
        placeHolder: "Your answer",
        ignoreFocusOut: true
      });

      if (answer) {
        return answer.label === "Yes";
      }

      return undefined;
    }

    return isGlobal;
  }

  /**
   * Add a new bookmark to the global or project settings
   * @param name 
   * @param path 
   * @param description 
   * @param type 
   * @param groupId 
   * @param isGlobal 
   * @param highlightedLine 
   */
  private static async add(name: string, path: string, description: string, type: BookmarkType, groupId?: string, isGlobal?: boolean, highlightedLine?: number) {
    const bookmarks = await getBookmarks(!!isGlobal);

    const newBookmark: Bookmark = {
      name,
      path,
      description,
      type
    };

    if (groupId) {
      newBookmark.groupId = groupId;
    }

    if (highlightedLine) {
      newBookmark.highlightedLine = highlightedLine;
    }

    bookmarks.push(newBookmark);

    await saveBookmarks(bookmarks, !!isGlobal);
  }
  
}
