import { BookmarkType } from ".";

export interface Bookmark {
  name: string;
  path: string;
  type: BookmarkType;

  id?: string;
  description?: string;
  lineColumn?: string;
  groupId?: string;
}