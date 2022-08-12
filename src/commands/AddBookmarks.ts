import { COMMAND } from './../constants/Commands';
import { commands, window } from 'vscode';
import { ExtensionService } from './../services/ExtensionService';


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
      placeHolder: 'Example',
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

    const ext = ExtensionService.getInstance();
    // Update the bookmarks
  }

  public static async addFile() {
    console.log(e);
  }
}