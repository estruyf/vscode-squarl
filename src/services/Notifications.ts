import { window } from "vscode";
import { EXTENSION_NAME } from "../constants";
import { Logger } from "./Logger";


export class Notifications {
  private static notifications: string[] = [];

  public static info(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "INFO");

    return window.showInformationMessage(`${EXTENSION_NAME}: ${message}`, ...items);
  }

  public static warning(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "WARNING");

    return window.showWarningMessage(`${EXTENSION_NAME}: ${message}`, ...items);
  }

  public static error(message: string, ...items: any): Thenable<string | undefined> {
    Logger.info(`${EXTENSION_NAME}: ${message}`, "ERROR");

    return window.showErrorMessage(`${EXTENSION_NAME}: ${message}`, ...items);
  }

  public static async errorShowOnce(message: string, ...items: any): Promise<string | undefined> {
    if (this.notifications.includes(message)) {
      return;
    }

    this.notifications.push(message);

    return this.error(message, ...items);
  }
}