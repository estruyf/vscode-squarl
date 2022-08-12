import { BookmarkType } from ".";

export interface Bookmark {
  id?: string;
  name: string;
  path: string;

  description?: string;
  lineColumn?: string;
  type: BookmarkType;
}