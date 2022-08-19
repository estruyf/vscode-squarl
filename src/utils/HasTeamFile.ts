import { workspace } from 'vscode';


export const hasTeamFile = async () => {
  const teamFiles = await workspace.findFiles(`**/squarl.json`, '**/node_modules', 1);

  if (teamFiles.length !== 1) {
    return false;
  }

  return true;
}