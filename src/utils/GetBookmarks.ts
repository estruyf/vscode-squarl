import { Bookmark } from "../models";
import { ViewService } from "../services";


export const getBookmarks = async (isGlobal: boolean): Promise<Bookmark[]> => {
  const allBookmarks = await ViewService.projectView.currentItems() || [];

  let bookmarks: Bookmark[] = Object.assign([], allBookmarks);
  bookmarks = bookmarks.filter(b => b.isGlobal === isGlobal);

  return bookmarks;
}