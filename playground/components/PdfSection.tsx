import React, { useState } from "react";
import { Input, Button, message, Tooltip, Spin } from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  LinkOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { ShenaiSDK } from "shenai-sdk";

interface Props {
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
}

export const MeasurementResultsPdfSection: React.FC<Props> = ({
  shenaiSDK,
  sdkState,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>();

  /**
   * The PDF features are available only in the Professional plan and above.
   * CORE users see a grayed‑out overlay with a tooltip, mirroring how other
   * restricted features are handled across the playground.
   */
  const planAllowed = sdkState?.pricingPlan !== "CORE";
  const disabled = !shenaiSDK || !sdkState?.isInitialized || !planAllowed;

  const code = `
// 1. Send PDF to e‑mail
shenaiSDK.sendMeasurementResultsPdfToEmail("user@example.com", (ok) => {
  console.log("E‑mail sent:", ok);
});

// 2. Open PDF in a new browser tab
shenaiSDK.openMeasurementResultsPdfInBrowser();

// 3. Get a shareable URL
shenaiSDK.getMeasurementResultsPdfUrl((url) => {
  console.log("PDF URL:", url);
});

// 4. Download the raw bytes
shenaiSDK.getMeasurementResultsPdfBytes((bytes) => {
  // Convert to Blob and trigger download
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "measurement_results.pdf";
  link.click();
  URL.revokeObjectURL(link.href);
});`;

  // —— Handlers ————————————————————————————————————————————————
  const handleSendEmail = () => {
    if (!shenaiSDK) return;
    setLoading(true);
    shenaiSDK.sendMeasurementResultsPdfToEmail(email, (success) => {
      setLoading(false);
      success
        ? message.success("Email sent successfully")
        : message.warning("Email sending failed");
    });
  };

  const handleGetUrl = () => {
    if (!shenaiSDK) return;
    setLoading(true);
    shenaiSDK.getMeasurementResultsPdfUrl((url) => {
      setLoading(false);
      if (url) {
        setPdfUrl(url);
        message.success("URL retrieved");
      } else {
        message.warning("Could not retrieve URL");
      }
    });
  };

  const handleGetBytes = () => {
    if (!shenaiSDK) return;
    setLoading(true);
    shenaiSDK.getMeasurementResultsPdfBytes((bytes) => {
      setLoading(false);
      if (bytes && bytes.length) {
        const blob = new Blob([bytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "measurement_results.pdf";
        link.click();
        URL.revokeObjectURL(link.href);
        message.success("Download started");
      } else {
        message.warning("Could not retrieve PDF bytes");
      }
    });
  };

  return (
    <Spin spinning={loading} tip="Working…">
      <div className={styles.outputSectionTitle} style={{ marginBottom: 8 }}>
        <CodeSnippet code={code} />
        Results PDF
      </div>

      <div className={styles.controlRow} style={{ marginBottom: 8 }}>
        <Input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, marginRight: 8 }}
          disabled={disabled}
        />
        <Button
          type="primary"
          icon={<MailOutlined />}
          onClick={handleSendEmail}
          disabled={disabled || !email}
        >
          Send
        </Button>
      </div>

      <div className={styles.controlRow} style={{ marginBottom: 8 }}>
        <Button
          icon={<LinkOutlined />}
          onClick={() => shenaiSDK?.openMeasurementResultsPdfInBrowser()}
          disabled={disabled}
          style={{ marginRight: 8 }}
        >
          Open in browser
        </Button>

        <Button
          icon={<CopyOutlined />}
          onClick={handleGetUrl}
          disabled={disabled}
          style={{ marginRight: 8 }}
        >
          Get URL
        </Button>

        <Button
          icon={<DownloadOutlined />}
          onClick={handleGetBytes}
          disabled={disabled}
        >
          Download
        </Button>
      </div>

      {pdfUrl && (
        <Input
          readOnly
          value={pdfUrl}
          addonBefore="URL"
          style={{ marginTop: 4 }}
          onFocus={(e) => e.target.select()}
        />
      )}

      {/* Overlay for CORE plan users */}
      {!planAllowed && (
        <Tooltip title="Available only in Professional Plan">
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.6)",
              cursor: "not-allowed",
              borderRadius: 8,
            }}
          />
        </Tooltip>
      )}
    </Spin>
  );
};
