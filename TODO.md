## TODO

- Support multiple workspaces
- Windows filepath support
- Local, remote and team bookmarks
  - this.ctx.globalState.setKeysForSync(["keyname"])
- Export bookmarks to a file
- Import bookmarks from a file
- Sorting by name or manual sorting
- https://code.visualstudio.com/updates/v1_70#_webview-context-menus
- Remove the view when team file is removed -> How can a treeview be closed/removed?
- Marketplace background color
- Update marketplace URL in the `squarl.json` file
- If duplicate, ask to add
- `workbench.action.gotoLine`
- Selected line to highlight line

## In progess

- Readme

## Features

- Add file bookmarks
- Add external bookmarks
- Edit
- Delete
- Search
- Groups
- Show deleted file links in a group

## Done

- Parse the absolute path of the file
- Search bookmark
- Update the treeview when the settings changes
- Add item actions to edit, delete
- Trigger tree view update
- Command to add a new bookmark
- Command to delete a bookmark

- Group creation
- Group assign
  - Add the group to the bookmark item
  - Create a listener for updating the context of the bookmark assign command
- Edit group
  - Update name
- Delete group
  - Delete the references

- Add explorer item right click context menu

- Better naming for commands:
  - squarl.bookmark.add
  - squarl.group.add
- Group sorting

- Do not update the groupId with the deleted group ID

- Link an external file to populate the bookmarks (team bookmarks)
- Welcome experience for empty views
  - https://code.visualstudio.com/api/extension-guides/tree-view#welcome-content
- file listener for `squarl.json` when it gets created
- file listener for `squarl.json` updates
- Read the `squarl.json` file -> team configuration
  - Team file stays seperate from the current config
  - What with the sorting? How will it update the settings?
- Create a command to init a team project file `squarl.json`
- Link icon
- Path parsing to see the type

- Team file development (no sorting)
- Team file search

- Better extension activation

## Removed

```json
"id": {
  "type": "string",
  "description": "ID of the bookmark. If not set, this will be generated automatically by the extension."
},
```