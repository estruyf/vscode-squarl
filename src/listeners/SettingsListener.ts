import { BookmarkView } from './../views/BookmarkView';
import { workspace } from 'vscode';
import { CONFIG_KEY } from '../constants';
import { setHasGroupContext } from '../utils/SetHasGroupContext';
import { BookmarkViewType } from '../models';


export class SettingsListener {

  public static init() {
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEY)) {
        BookmarkView.update(BookmarkViewType.project);

        // Set the VS Code context key
        setHasGroupContext();
      }
    });
  }
}