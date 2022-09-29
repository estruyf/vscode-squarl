import { workspace } from "vscode";


export const getTeamFile = async () => {
  const teamFiles = await workspace.findFiles(`**/squarl.json`, '**/node_modules', 1);

  if (teamFiles.length !== 1) {
    return;
  }

  return teamFiles[0];
}