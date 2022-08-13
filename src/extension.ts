import { DeleteBookmarks } from './commands/DeleteBookmarks';
import { EditBookmarks } from './commands/EditBookmarks';
import { ExtensionContext } from "vscode";
import { AddBookmarks } from "./commands/AddBookmarks";
import { ExtensionService } from "./services/ExtensionService";
import { BookmarkView } from "./views/BookmarkView";


export async function activate(context: ExtensionContext) {
	const ext = ExtensionService.getInstance(context);

	// Register all the views
	BookmarkView.init();

	// Register all the commands
	AddBookmarks.registerCommands();
	EditBookmarks.registerCommands();
	DeleteBookmarks.registerCommands();
}

// this method is called when your extension is deactivated
export function deactivate() {}
