import { BookmarkView } from './../views/BookmarkView';
import { workspace } from 'vscode';
import { CONFIG_KEY, SETTING } from '../constants';
import { ExtensionService } from "../services/ExtensionService";


export class SettingsListener {

  public static init() {
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEY)) {
        BookmarkView.update();
      }
    });
  }
}