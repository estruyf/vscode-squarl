import { OpenBookmark } from './commands/OpenBookmark';
import { ExtensionContext } from "vscode";
import { ExtensionService } from "./services/ExtensionService";
import { AddBookmarks, CreateGroup, DeleteBookmarks, DeleteGroup, EditBookmarks, SearchBookmarks, Sorting, InitTeam, EditGroup, AssignGroup } from "./commands";
import { SettingsListener, TeamSettingsListener } from './listeners';
import { ViewService } from './services';


export async function activate(context: ExtensionContext) {
	ExtensionService.getInstance(context);

	// Register all the views
	ViewService.init();

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
