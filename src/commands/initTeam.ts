import { Notifications } from './../services/Notifications';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { commands } from "vscode";
import { COMMAND, TEAM_FILE } from "../constants";
import { ExtensionService } from "../services/ExtensionService";


export class InitTeam {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.teamInit, InitTeam.start)
    );
  }

  public static async start() {
    const ext = ExtensionService.getInstance();

    const fsFolder = ext.getWorkspaceFolder();
    const teamFilePath = join((fsFolder?.fsPath || ""), TEAM_FILE);
    if (existsSync(teamFilePath)) {
      Notifications.warning(`There is already a "squarl.json" file in your project.`);
      return;
    }

    writeFileSync(teamFilePath, JSON.stringify({groups:[],bookmarks:[]}, null, 2), "utf8");
    Notifications.info(`Team file created.`)
  }
}