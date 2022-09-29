import { workspace } from "vscode";
import { Bookmark, Group } from "../models";
import { getTeamFile } from "./GetTeamFile";


export const getTeamFileContents = async () => {
  const teamFile = await getTeamFile();
  if (!teamFile) {
    return;
  }
  
  const teamDoc = await workspace.openTextDocument(teamFile);
  const teamContents = teamDoc.getText();

  let teamData: {
    name: string;
    groups: Group[];
    bookmarks: Bookmark[];
  };
  
  if (typeof teamContents === "string") {
    teamData = JSON.parse(teamContents);
  } else {
    teamData = teamContents;
  }

  return teamData;
}