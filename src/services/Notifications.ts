import { ExtensionService } from './ExtensionService';
import { window } from "vscode";
import { Logger } from "./Logger";


export class Notifications {
  private static notifications: string[] = [];

  public static info(message: string, ...items: any): Thenable<string | undefined> {
    const ext = ExtensionService.getInstance();
    Logger.info(`${ext.displayName}: ${message}`, "INFO");

    return window.showInformationMessage(`${ext.displayName}: ${message}`, ...items);
  }

  public static warning(message: string, ...items: any): Thenable<string | undefined> {
    const ext = ExtensionService.getInstance();
    Logger.info(`${ext.displayName}: ${message}`, "WARNING");

    return window.showWarningMessage(`${ext.displayName}: ${message}`, ...items);
  }

  public static error(message: string, ...items: any): Thenable<string | undefined> {
    const ext = ExtensionService.getInstance();
    Logger.info(`${ext.displayName}: ${message}`, "ERROR");

    return window.showErrorMessage(`${ext.displayName}: ${message}`, ...items);
  }

  public static async errorShowOnce(message: string, ...items: any): Promise<string | undefined> {
    if (this.notifications.includes(message)) {
      return;
    }

    this.notifications.push(message);

    return this.error(message, ...items);
  }
}