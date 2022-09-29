import { BookmarkViewType } from "../models";
import { BookmarkView } from "../views/BookmarkView";


export class ViewService {
  public static projectView: BookmarkView;
  public static teamView: BookmarkView;

  public static init() {
    ViewService.projectView = new BookmarkView(BookmarkViewType.project);
    ViewService.teamView = new BookmarkView(BookmarkViewType.team);
  }
}