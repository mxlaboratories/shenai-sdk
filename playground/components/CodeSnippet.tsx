import { CodeOutlined, CopyOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import styles from "./CodeSnippet.module.css";

export const CodeSnippet: React.FC<{ code: string; language?: string }> = ({
  code,
  language = "typescript",
}) => {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  if (code == "") return <></>;

  return (
    <Popover
      className={styles.codeSnippet}
      content={
        <div className={styles.codeSnippetWrapper}>
          <SyntaxHighlighter
            language={language}
            style={materialDark}
            wrapLongLines
            className={styles.codeInner}
          >
            {code}
          </SyntaxHighlighter>
          <div className={styles.copyCodeButton} onClick={copyCode}>
            <CopyOutlined />
          </div>
        </div>
      }
    >
      <CodeOutlined />
    </Popover>
  );
};
