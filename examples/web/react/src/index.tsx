import React from "react";
import ReactDOM from "react-dom/client";
import { isBrowserCompatible } from "shenai-sdk";
import App from "./App";
import UpgradeBrowser from "./UpgradeBrowser";
import { Normalize } from "styled-normalize";
import { createGlobalStyle } from "styled-components";
import "antd/dist/antd.css";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #fff;
    font-family: 'Raleway', sans-serif;
    font-size: 20pt;
    color: #333;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Normalize />
    <GlobalStyle />
    {isBrowserCompatible() ? <App /> : <UpgradeBrowser />}
  </React.StrictMode>
);
