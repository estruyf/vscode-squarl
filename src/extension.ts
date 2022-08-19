import { EditGroup } from './commands/EditGroup';
import { AssignGroup } from './commands/AssignGroup';
import { ExtensionContext } from "vscode";
import { ExtensionService } from "./services/ExtensionService";
import { BookmarkView } from "./views/BookmarkView";
import { AddBookmarks, CreateGroup, DeleteBookmarks, DeleteGroup, EditBookmarks, SearchBookmarks, Sorting } from "./commands";
import { SettingsListener, TeamSettingsListener } from './listeners';


export async function activate(context: ExtensionContext) {
	const ext = ExtensionService.getInstance(context);

	// Register all the views
	BookmarkView.init();

	// Register all the commands
	AddBookmarks.registerCommands();
	EditBookmarks.registerCommands();
	DeleteBookmarks.registerCommands();
	SearchBookmarks.registerCommands();
	CreateGroup.registerCommands();
	AssignGroup.registerCommands();
	EditGroup.registerCommands();
	DeleteGroup.registerCommands();
	Sorting.registerCommands();

	// Register all the listeners
	SettingsListener.init();
	TeamSettingsListener.init();
}

// this method is called when your extension is deactivated
export function deactivate() {}
