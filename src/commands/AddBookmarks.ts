import { BookmarkView } from './../views/BookmarkView';
import { Bookmark } from './../models/Bookmark';
import { SETTING } from './../constants/Settings';
import { COMMAND } from './../constants/Commands';
import { commands, window } from 'vscode';
import { ExtensionService } from './../services/ExtensionService';
import { BookmarkType } from '../models';
import { basename, parse, relative } from 'path';


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

    AddBookmarks.add(name, link, description || "", BookmarkType.Link);

    BookmarkView.update();
  }

  public static async addFile() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return window.showWarningMessage(`Didn't find an active file to add`);
    }
    
    let path = editor.document.uri.fsPath;
    // Get filename from path
    const fileParse = parse(path);
    const fileName = `${fileParse.name}${fileParse.ext}`;

    // Get relative path from workspace root
    const ext = ExtensionService.getInstance();
    const wsPath = ext.getWorkspaceFolder();
    if (wsPath) {
      path = relative(wsPath.fsPath, path);
    }

    const description = await window.showInputBox({
      prompt: 'Enter a description for the file',
      placeHolder: '',
      ignoreFocusOut: true,
      value: fileName
    });

    AddBookmarks.add(fileName, path, description || "", BookmarkType.File);

    BookmarkView.update();
  }

  private static async add(name: string, path: string, description: string, type: BookmarkType) {
    const ext = ExtensionService.getInstance();

    const bookmarks = ext.getSetting<Bookmark[]>(SETTING.bookmarks) || [];

    bookmarks.push({
      name,
      path,
      description,
      type
    } as Bookmark);

    ext.setSetting(SETTING.bookmarks, bookmarks);
  }
}