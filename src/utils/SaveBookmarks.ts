import { SETTING } from "../constants";
import { Bookmark } from "../models"
import { ExtensionService } from "../services/ExtensionService";


export const saveBookmarks = async (bookmarks: Bookmark[]) => {
  const ext = ExtensionService.getInstance();

  bookmarks = bookmarks.map(b => {
    delete b.isDeleted;
    delete b.id;

    return b;
  })
  
  await ext.setSetting(SETTING.bookmarks, bookmarks);
}