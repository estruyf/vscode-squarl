import { Uri } from 'vscode';
import { Notifications } from './../services/Notifications';
import { BookmarkView } from './../views/BookmarkView';
import { Bookmark } from './../models/Bookmark';
import { SETTING } from './../constants/Settings';
import { COMMAND } from './../constants/Commands';
import { commands, window } from 'vscode';
import { ExtensionService } from './../services/ExtensionService';
import { BookmarkType } from '../models';
import { parse, relative } from 'path';
import { selectGroupQuestion } from '../questions';
import { saveBookmarks } from '../utils/SaveBookmarks';


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
  public static async addLink() {    
    const link = await window.showInputBox({
      prompt: 'Enter the link to add',
      placeHolder: 'https://example.com',
      ignoreFocusOut: true
    });

    if (!link) {
      return;
    }

    const name = await window.showInputBox({
      prompt: 'Enter the name of the link',
      placeHolder: '',
      ignoreFocusOut: true,
      value: link
    });

    if (!name) {
      return;
    }

    const description = await window.showInputBox({
      prompt: 'Enter a description for the link',
      placeHolder: 'Example link',
      ignoreFocusOut: true,
    });

    const groupId = await selectGroupQuestion();

    AddBookmarks.add(name, link, description || "", BookmarkType.Link, groupId);    
  }

  /**
   * Add file as a bookmark
   * @param file 
   * @returns 
   */
  public static async addFile(file?: Uri) {
    let path: string;
    const editor = window.activeTextEditor;

    if (!file) {
      if (!editor) {
        Notifications.warning(`Didn't find an active file to add`);
        return;
      }

      path = editor.document.uri.fsPath;
    } else {
      path = file.fsPath;
    }

    if (!path) {
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

    const bookmarks = BookmarkView.currentProjectItems;
    if (bookmarks.find(b => b.path === path)) {
      const answer = await window.showQuickPick(["Yes", "No"], {
        placeHolder: "It seems the file was already added, do you wish to continue?"
      });
  
      if (!answer && answer === "No") {
        return;
      }
    }

    const description = await window.showInputBox({
      prompt: 'Enter a description for the file',
      placeHolder: '',
      ignoreFocusOut: false,
      value: fileName
    });

    if (description === undefined) {
      return;
    }

    const groupId = await selectGroupQuestion();

    if (groupId === undefined) {
      return;
    }

    let highlightedLine = undefined;
    const activeSelection = editor?.selection;
    if (activeSelection && activeSelection.start.line) {
      const answer = await window.showQuickPick(["Yes", "No"], {
        placeHolder: "Do you want to add the highlighted line reference?"
      });
  
      if (answer && answer === "Yes") {
        highlightedLine = activeSelection.start.line
      }
    }

    AddBookmarks.add(fileName, path, description || "", BookmarkType.File, groupId, highlightedLine);    
  }

  private static async add(name: string, path: string, description: string, type: BookmarkType, groupId?: string, highlightedLine?: number) {
    const ext = ExtensionService.getInstance();

    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks, "project") || [];

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

    await saveBookmarks(bookmarks);
  }
  
}