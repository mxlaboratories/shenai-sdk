import { Select } from "antd";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { ShenaiSDK } from "shenai-sdk";
import { ShenaiSdkState } from "../pages";

interface ManifestResult {
  name?: string;
}

export const LanguageChoice: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
}> = ({ shenaiSDK, sdkState }) => {

  const [availableLanguages, setAvailableLanguages] = useState<string[]>([
    "auto",
  ]);

  const onSelectLanguage = (value: string) => {
    if (shenaiSDK?.isInitialized()) {
      shenaiSDK.setLanguage(value);
    }
  };

  const updateLanguageList = () => {
    fetch("https://translations.shen.ai/manifest.json")
      .then((response) => response.json())
      .then((data: ManifestResult[]) => {
        const dataLanguages = data
          .map((manifest) =>
            manifest.name?.match(/^([a-zA-Z]{2,3}(-[a-zA-Z]+)?)\.json$/)
          )
          .filter((match) => (match?.length ?? 0) > 1)
          .map((match) => match![1]);
        dataLanguages.unshift("auto");
        setAvailableLanguages(dataLanguages);
      });
  };

  useEffect(() => {
    updateLanguageList();
  }, []);

  return (
    <>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          Language:{" "}
          <CodeSnippet code={`shenaiSDK.setLanguage("${sdkState?.language}");`} />
        </div>
        <Select
          options={availableLanguages.map((lang) => ({
            value: lang,
            label: lang,
          }))}
          value={sdkState?.language}
          popupMatchSelectWidth={false}
          onSelect={onSelectLanguage}
          onDropdownVisibleChange={updateLanguageList}
          disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
        />
      </div>
    </>
  );
};
