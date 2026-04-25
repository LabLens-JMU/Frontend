import React from "react";
import "../../css/Header.css";
import logo from "../assets/images/LabLensLogo.png";
import graph from "../assets/images/Graph.png";
import settings from "../assets/images/Settings.png";

const Header = ({ onShowGraph }) => {
  return (
    <header className="app-header">
      <button
        type="button"
        className="header-logo-button"
        onClick={() => {
          window.location.reload();
        }}
        aria-label="Reload page"
      >
        <img
          className="logo"
          src={logo}
          width="100"
          alt="Logo"
        />
      </button>
      <h1 className="title">LabLens</h1>
      <button
        type="button"
        className="header-icon-button graph-button"
        onClick={onShowGraph}
        aria-label="Open graph"
      >
        <img
          className="graph"
          src={graph}
          width="75"
          alt="graph"
        />
      </button>
      <button
        type="button"
        className="header-icon-button settings-button"
        aria-label="Open settings"
      >
        <img
          className="settings-icon"
          src={settings}
          width="75"
          alt="settings"
        />
      </button>
    </header>
  );
};

export default Header;
