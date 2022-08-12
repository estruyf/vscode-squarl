import { BookmarkType } from ".";

export interface Bookmark {
  name: string;
  path: string;

  description?: string;
  lineColumn?: string;
  type: BookmarkType;
}