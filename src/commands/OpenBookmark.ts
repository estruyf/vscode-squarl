import { Notifications } from './../services/Notifications';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { commands } from "vscode";
import { COMMAND, TEAM_FILE } from "../constants";
import { ExtensionService } from "../services/ExtensionService";


export class OpenBookmark {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.openBookmark, OpenBookmark.start)
    );
  }

  public static async start(...args: any[]) {
    await commands.executeCommand('vscode.open', ...args)
  }
}