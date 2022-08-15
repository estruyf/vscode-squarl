import { EditGroup } from './commands/EditGroup';
import { AssignGroup } from './commands/AssignGroup';
import { ExtensionContext } from "vscode";
import { ExtensionService } from "./services/ExtensionService";
import { BookmarkView } from "./views/BookmarkView";
import { SettingsListener } from './listeners/SettingsListener';
import { AddBookmarks, CreateGroup, DeleteBookmarks, DeleteGroup, EditBookmarks, SearchBookmarks, SortBookmarks } from "./commands";


export async function activate(context: ExtensionContext) {
	const ext = ExtensionService.getInstance(context);

	// Register all the views
	BookmarkView.init();

	// Register all the commands
	AddBookmarks.registerCommands();
	EditBookmarks.registerCommands();
	DeleteBookmarks.registerCommands();
	SearchBookmarks.registerCommands();
	SortBookmarks.registerCommands();
	CreateGroup.registerCommands();
	AssignGroup.registerCommands();
	EditGroup.registerCommands();
	DeleteGroup.registerCommands();

	// Register all the listeners
	SettingsListener.init();
}

// this method is called when your extension is deactivated
export function deactivate() {}
