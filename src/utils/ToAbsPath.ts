import { join } from "path";
import { Uri } from "vscode";
import { ExtensionService } from "../services/ExtensionService";


export const toAbsPath = (path: string) => {
  const wsFolder = ExtensionService.getInstance().getWorkspaceFolder();
  let fileResourcePath = Uri.parse(path);

  if (wsFolder) {
    fileResourcePath = Uri.file(join(wsFolder.fsPath, path));
  }

  return fileResourcePath;
}