import React from "react";
import "../../css/Header.css";
import logo from "../assets/images/LabLensLogo.png";
import graph from "../assets/images/Graph.png";
import sun from "../assets/images/sun.png";
import moon from "../assets/images/moon.png";

const Header = ({ onShowGraph, theme, onToggleTheme }) => {
  const isDarkTheme = theme === "dark";
  const themeIcon = isDarkTheme ? sun : moon;
  const themeAlt = isDarkTheme ? "Switch to light mode" : "Switch to dark mode";

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
          alt="Logo"
        />
      </button>
      <h1 className="title">LabLens</h1>
      <nav className="header-actions" aria-label="Header actions">
        <button
          type="button"
          className="header-icon-button graph-button"
          onClick={onShowGraph}
          aria-label="Show graph"
          title="Show graph"
        >
          <img
            className="graph"
            src={graph}
            alt="Show graph"
          />
        </button>
        <button
          type="button"
          className="theme-toggle-button header-icon-button settings-button"
          onClick={onToggleTheme}
          aria-label={themeAlt}
          title={themeAlt}
        >
          <img className="settings-icon" src={themeIcon} alt={themeAlt} />
        </button>
      </nav>
    </header>
  );
};

export default Header;
