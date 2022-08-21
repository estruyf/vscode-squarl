import { BookmarkView } from './../views/BookmarkView';
import { FileDeleteEvent, TextDocument, workspace } from 'vscode';
import { CONFIG_KEY } from '../constants';
import { setHasGroupContext } from '../utils/SetHasGroupContext';
import { getTeamFile } from '../utils/GetTeamFile';
import { BookmarkViewType } from '../models';


export class TeamSettingsListener {

  public static async init() {
    workspace.onDidSaveTextDocument((e: TextDocument) => {
      if (e.uri.fsPath.endsWith(`squarl.json`)) {
        BookmarkView.update(BookmarkViewType.team);
      }
    });

    workspace.onDidDeleteFiles((e: FileDeleteEvent) => {
      const files = e.files.map(f => f.fsPath);
      const exists = files.find(f => f.endsWith(`squarl.json`));

      if (exists) {
        BookmarkView.close(BookmarkViewType.team);
      }
    });
  }
}