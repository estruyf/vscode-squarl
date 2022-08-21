

export const EXTENSION_NAME = 'squarl';

export const COMMAND = {
  // Bookmarks
  addLink: `${EXTENSION_NAME}.bookmark.addLink`,
  addFile: `${EXTENSION_NAME}.bookmark.addFile`,

  editBookmark: `${EXTENSION_NAME}.bookmark.edit`,
  deleteBookmark: `${EXTENSION_NAME}.bookmark.delete`,

  searchBookmark: `${EXTENSION_NAME}.bookmark.search`,

  // Groups
  createGroup: `${EXTENSION_NAME}.group.create`,
  editGroup: `${EXTENSION_NAME}.group.edit`,
  deleteGroup: `${EXTENSION_NAME}.group.delete`,
  assignGroup: `${EXTENSION_NAME}.group.assign`,
  
  // Sorting
  moveUp: `${EXTENSION_NAME}.sort.up`,
  moveDown: `${EXTENSION_NAME}.sort.down`,

  // Team file
  teamInit: `${EXTENSION_NAME}.team.init`
}