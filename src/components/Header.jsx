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
          width="100"
          alt="Logo"
        />
      </button>
        <h1 className="title">LabLens</h1>
        <nav>
          <ul className="list-icons">
            <li className="graph">
              <img
                className="graph"
                onClick={onShowGraph}
                src={graph}
                width="75"
                alt="graph"
              />
            </li>
            <li className="theme-toggle">
              <button
                type="button"
                className="theme-toggle-button header-icon-button settings-button"
                onClick={onToggleTheme}
                aria-label={themeAlt}
                title={themeAlt}
              >
                <img src={themeIcon} width="75" alt={themeAlt} />
              </button>
              {/* <a href="https://www.flaticon.com/free-icons/sun" title="sun icons">Sun icons created by bqlqn - Flaticon</a> */}
              {/* <a href="https://www.flaticon.com/free-icons/moon" title="moon icons">Moon icons created by Good Ware - Flaticon</a> */}
            </li>
          </ul>
        </nav>
      </header>
  );
};

export default Header;
