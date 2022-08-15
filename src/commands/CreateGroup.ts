import { commands, window } from "vscode";
import { COMMAND, SETTING } from "../constants";
import { Group } from "../models";
import { ExtensionService } from "../services/ExtensionService";


export class CreateGroup {

  public static registerCommands() {
    const ext = ExtensionService.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(
      commands.registerCommand(COMMAND.createGroup, CreateGroup.create)
    );
  }

  public static async create() {
    const ext = ExtensionService.getInstance();
    const groups = ext.getSetting<Group[]>(SETTING.groups) || [];

    const name = await window.showInputBox({
      prompt: 'What is the name of the group?',
      placeHolder: 'Name of the group',
      ignoreFocusOut: true,
      validateInput: (value: string) => {
        if (!value) {
          return "Please define a name for the group";
        } else if (groups.find(g => g.id === CreateGroup.createId(value))) {
          return "A group with this name already exists";
        } else {
          return "";
        }
      }
    });

    if (!name) {
      return;
    }

    groups.push({
      id: CreateGroup.createId(name),
      name
    });

    ext.setSetting(SETTING.groups, groups);
  }

  private static createId(value: string) {
    return value.toLowerCase().replace(/ /g, '-');
  }
}