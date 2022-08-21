import { BookmarkType } from ".";

export interface Bookmark {
  name: string;
  path: string;
  type: BookmarkType;

  // Optional
  id?: string;
  description?: string;
  groupId?: string;
  iconName?: string;

  // Programatically
  lineColumn?: string;
  isDeleted?: boolean;
}