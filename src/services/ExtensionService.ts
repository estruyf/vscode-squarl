import { ExtensionContext, ExtensionMode, SecretStorage, Uri, workspace } from "vscode";
import { CONFIG_KEY } from "../constants";


export class ExtensionService {
  private static instance: ExtensionService;
  
  private constructor(private ctx: ExtensionContext) {}

  /**
   * Creates the singleton instance for the extension.
   * @param ctx 
   */
  public static getInstance(ctx?: ExtensionContext): ExtensionService {
    if (!ExtensionService.instance && ctx) {
      ExtensionService.instance = new ExtensionService(ctx);
    }

    return ExtensionService.instance;
  }

  /**
   * Get the name of the extension
   */
  public get name(): string {
    return this.ctx.extension.packageJSON.name;
  }

  /**
   * Get the display name of the extension
   */
  public get displayName(): string {
    return this.ctx.extension.packageJSON.displayName;
  }

  /**
   * Returns the extension's version
   */
  public get version(): string {
    return this.ctx.extension.packageJSON.version;
  }

  /**
   * Check if the extension is in production/development mode
   */
  public get isProductionMode(): boolean {
    return this.ctx.extensionMode === ExtensionMode.Production;
  }

  /**
   * Get the extension's subscriptions
   */
  public get subscriptions(): { dispose(): any; }[] {
    return this.ctx.subscriptions;
  }

  /**
   * Get the extension's secrets
   */
  public get secrets(): SecretStorage {
    return this.ctx.secrets;
  }

  /**
   * Get the extension's path
   */
  public get extensionPath(): string {
    return this.ctx.extensionPath;
  }

  /**
   * Get the extension's workspace folder
   */
  public getWorkspaceFolder(): Uri | undefined {
    const wsFolders = workspace.workspaceFolders;
    if (wsFolders && wsFolders.length > 0) {
      return wsFolders[0].uri;
    }
    return undefined;
  }


  /**
   * Get current state from the extension
   * @param propKey 
   * @param type 
   * @returns 
   */
  public async getState<T>(propKey: string, type: "workspace" | "global" = "global"): Promise<T | undefined> {
    if (type === "global") {
      return await this.ctx.globalState.get(propKey);
    } else {
      return await this.ctx.workspaceState.get(propKey);
    }
  }

  /**
   * Set a state for the extension
   * @param propKey 
   * @param propValue 
   * @param type 
   */
  public async setState<T>(propKey: string, propValue: T, type: "workspace" | "global" = "global"): Promise<void> {
    if (type === "global") {
      await this.ctx.globalState.update(propKey, propValue);
    } else {
      await this.ctx.workspaceState.update(propKey, propValue);
    }
  }


  /**
   * Get a setting from the extension
   * @param settingKey 
   * @returns 
   */
  public getSetting<T>(settingKey: string): T | undefined {
    const config = workspace.getConfiguration(CONFIG_KEY);
    return config.get<T>(settingKey);
  }

  /**
   * Set a new setting value for the extension
   * @param settingKey 
   * @param value 
   */
  public setSetting(settingKey: string, value: any): void {
    const config = workspace.getConfiguration(CONFIG_KEY);
    config.update(settingKey, value);
  }
}