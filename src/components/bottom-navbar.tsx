import BookmarkIcon from "../icons/bookmark";
import CompassIcon from "../icons/compass";
import SettingsIcon from "../icons/settings";

export default function BottomNavigationbar() {
  return (
    <div className=" absolute bottom-0 w-full shadow-2xl flex justify-between">
      <div className="px-4 py-3 w-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100">
        <CompassIcon />
        Explore
      </div>
      <div className="px-4 py-3 w-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100">
        <BookmarkIcon />
        My Lists
      </div>
      <div className="px-4 py-3 w-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100">
        <SettingsIcon />
        Settings
      </div>
    </div>
  );
}
