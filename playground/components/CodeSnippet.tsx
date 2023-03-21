import { CodeOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import styles from "./CodeSnippet.module.css";

interface Props {
  code: string;
}

export const TypescriptSnippet: React.FC<Props> = ({ code }) => {
  return (
    <Popover
      className={styles.codeSnippet}
      content={
        <SyntaxHighlighter language="typescript" style={materialDark}>
          {code}
        </SyntaxHighlighter>
      }
    >
      <CodeOutlined />
    </Popover>
  );
};
