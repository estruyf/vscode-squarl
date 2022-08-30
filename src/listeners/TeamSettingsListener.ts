import { ViewService } from './../services/ViewService';
import { TextDocument, workspace } from 'vscode';



export class TeamSettingsListener {

  public static async init() {
    workspace.onDidSaveTextDocument((e: TextDocument) => {
      if (e.uri.fsPath.endsWith(`squarl.json`)) {
        ViewService.teamView.update();
      }
    });
  }
}