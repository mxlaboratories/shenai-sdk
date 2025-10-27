import React, { Dispatch, SetStateAction, useEffect } from "react";
import { GetProp, ColorPickerProps, Row, Col, ColorPicker } from "antd";
import { CustomColorTheme, ShenaiSDK } from "shenai-sdk";
import { ShenaiSdkState } from "../pages";
import { AggregationColor } from "antd/es/color-picker/color";

type Color = GetProp<ColorPickerProps, "value">;
type Format = GetProp<ColorPickerProps, "format">;

const TitleMapping: Record<keyof CustomColorTheme, string> = {
  themeColor: "Theme Color",
  backgroundColor: "Background Color",
  textColor: "Text Color",
  tileColor: "Tile Color",
};

export const ColorTheme: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
  colorTheme: CustomColorTheme;
  setColorTheme: Dispatch<SetStateAction<CustomColorTheme>>;
  setSnippetCode: (code: string) => void;
}> = ({ shenaiSDK, sdkState, colorTheme, setColorTheme, setSnippetCode }) => {
  const handleColorChange =
    (name: keyof CustomColorTheme) => (value: AggregationColor) => {
      const newColorTheme = {
        ...colorTheme,
        [name]: value.toHexString().toUpperCase(),
      };
      setColorTheme(newColorTheme);
      shenaiSDK?.setCustomColorTheme(newColorTheme);
    };

  useEffect(() => {
    setSnippetCode(
      "shenaiSDK.setCustomColorTheme({\n" +
        Object.entries(colorTheme)
          .map(([key, val]) => `  ${key}: "${val}"`)
          .join(",\n") +
        "\n})"
    );
  }, [setSnippetCode, colorTheme]);

  return (
    <>
      {(Object.entries(colorTheme) as [keyof CustomColorTheme, string][]).map(
        ([key, val]) => (
          <Row key={key}>
            <Col span={12}>{TitleMapping[key]}</Col>
            <Col span={12}>
              <ColorPicker
                format="hex"
                value={val}
                disabledAlpha
                onChange={handleColorChange(key)}
                disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
              />
            </Col>
          </Row>
        )
      )}
    </>
  );
};
