import "./App.css";
import ExtensionHeader from "./components/header";
import BottomNavigationbar from "./components/bottom-navbar";
import CrawlerPage from "./pages/crawlerPage";

import { Route, Routes } from "react-router-dom";
import SettingsPage from "./pages/settingsPage";
import CollectionsPage from "./pages/collectionsPage";

function App() {
  return (
    <>
      <ExtensionHeader />

      <Routes>
        <Route path="/" Component={CrawlerPage} />
        <Route path="/collections" Component={CollectionsPage} />
        <Route path="/settings" Component={SettingsPage} />
      </Routes>

      <BottomNavigationbar />
    </>
  );
}

export default App;
