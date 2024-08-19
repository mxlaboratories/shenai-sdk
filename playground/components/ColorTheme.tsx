import React, { Dispatch, SetStateAction, useEffect } from "react";
import { GetProp, ColorPickerProps, Row, Col, ColorPicker } from "antd";
import { CustomColorTheme, ShenaiSDK } from "shenai-sdk";
import { ShenaiSdkState } from "../pages";

type Color = GetProp<ColorPickerProps, "value">;
type Format = GetProp<ColorPickerProps, "format">;

export const ColorTheme: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  sdkState?: ShenaiSdkState;
  colorTheme: CustomColorTheme;
  setColorTheme: Dispatch<SetStateAction<CustomColorTheme>>;
  setSnippetCode: (code: string) => void;
}> = ({ shenaiSDK, sdkState, colorTheme, setColorTheme, setSnippetCode }) => {
  const handleColorChange =
    (name: keyof CustomColorTheme) => (value: Color, hex: string) => {
      const newColorTheme = {
        ...colorTheme,
        [name]: hex.toUpperCase(),
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
      {Object.entries(colorTheme).map(([key, val]) => (
        <Row key={key}>
          <Col span={8}>{key.replace("_", " ")}</Col>
          <Col span={16}>
            <ColorPicker
              format="hex"
              value={val as Format}
              disabledAlpha
              onChange={handleColorChange(key as keyof CustomColorTheme)}
              disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
            />
          </Col>
        </Row>
      ))}
    </>
  );
};
