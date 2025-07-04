import React from "react";
import "./App.css";
import ExtensionHeader from "./components/header";
import BottomNavigationbar from "./components/bottom-navbar";
import CrawlerPage from "./pages/crawlerPage";

function App() {
  return (
    <React.Fragment>
      <ExtensionHeader />

      <CrawlerPage />
      <BottomNavigationbar />
    </React.Fragment>
  );
}

export default App;
