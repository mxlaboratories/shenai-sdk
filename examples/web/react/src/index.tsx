import React from "react";
import ReactDOM from "react-dom/client";
import { isBrowserCompatible } from "shenai-sdk";
import App from "./App";
import UpgradeBrowser from "./UpgradeBrowser";
import { Normalize } from "styled-normalize";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #fff;
    font-family: 'Raleway', sans-serif;
    font-size: 20pt;
    color: #333;
    overflow-x: hidden;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <>
    <Normalize />
    <GlobalStyle />
    {isBrowserCompatible() ? <App /> : <UpgradeBrowser />}
  </>
);
