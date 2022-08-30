import { SETTING } from "../constants";
import { Bookmark } from "../models"
import { ExtensionService } from "../services/ExtensionService";


export const saveBookmarks = async (bookmarks: Bookmark[], isGlobal: boolean) => {
  const ext = ExtensionService.getInstance();

  bookmarks = bookmarks.map(b => {
    delete b.isDeleted;
    delete b.id;
    delete b.isGlobal;

    return b;
  })
  
  await ext.setSetting(SETTING.bookmarks, bookmarks, isGlobal ? "global" : "project");
}