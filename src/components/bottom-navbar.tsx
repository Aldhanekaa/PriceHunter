import { Link } from "react-router-dom";
import BookmarkIcon from "../icons/bookmark";
import CompassIcon from "../icons/compass";
import SettingsIcon from "../icons/settings";

export default function BottomNavigationbar() {
  return (
    <div className=" relative bottom-0 w-full shadow-2xl flex justify-between">
      <Link
        to="/"
        className="px-4 text-neutral-900 py-3 w-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100"
      >
        <div className="text-neutral-900 flex flex-col items-center justify-center">
          <CompassIcon />
          Explore
        </div>
      </Link>

      <Link
        to="/collections"
        className="px-4 text-neutral-900 py-3 w-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100"
      >
        <div className="text-neutral-900 flex flex-col items-center justify-center">
          <BookmarkIcon />
          My Collections
        </div>
      </Link>

      <Link
        to="/settings"
        className="px-4 text-neutral-900 py-3 w-full cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100"
      >
        <div className="text-neutral-900 flex flex-col items-center justify-center">
          <SettingsIcon />
          Settings
        </div>
      </Link>
    </div>
  );
}
