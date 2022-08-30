import { BookmarkView } from './../views/BookmarkView';
import { workspace } from 'vscode';
import { CONFIG_KEY } from '../constants';
import { setHasGroupContext } from '../utils/SetHasGroupContext';
import { BookmarkViewType } from '../models';
import { ViewService } from '../services';


export class SettingsListener {

  public static init() {
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEY)) {
        ViewService.projectView.update();

        // Set the VS Code context key
        setHasGroupContext();
      }
    });
  }
}