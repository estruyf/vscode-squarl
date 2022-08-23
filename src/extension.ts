import { OpenBookmark } from './commands/OpenBookmark';
import { ExtensionContext } from "vscode";
import { ExtensionService } from "./services/ExtensionService";
import { BookmarkView } from "./views/BookmarkView";
import { AddBookmarks, CreateGroup, DeleteBookmarks, DeleteGroup, EditBookmarks, SearchBookmarks, Sorting, InitTeam, EditGroup, AssignGroup } from "./commands";
import { SettingsListener, TeamSettingsListener } from './listeners';


export async function activate(context: ExtensionContext) {
	const ext = ExtensionService.getInstance(context);

	// Register all the views
	BookmarkView.init();

	// Register all the commands
	OpenBookmark.registerCommands();
	AddBookmarks.registerCommands();
	EditBookmarks.registerCommands();
	DeleteBookmarks.registerCommands();
	SearchBookmarks.registerCommands();
	CreateGroup.registerCommands();
	AssignGroup.registerCommands();
	EditGroup.registerCommands();
	DeleteGroup.registerCommands();
	Sorting.registerCommands();
	InitTeam.registerCommands();

	// Register all the listeners
	SettingsListener.init();
	TeamSettingsListener.init();
}

// this method is called when your extension is deactivated
export function deactivate() {}
