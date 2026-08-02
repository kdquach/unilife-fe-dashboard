import React from "react";
import { Modal, Button, Form, Input, Space, Divider, Tag, Spin } from "antd";
import { QrcodeOutlined, CameraOutlined, StopOutlined, InfoCircleOutlined, CheckCircleFilled, EditOutlined, LoadingOutlined } from "@ant-design/icons";
import { COLORS } from "../utils/orderUtils.jsx";

/**
 * Modal for scanning pickup QR codes with camera support
 */
export default function ScanPickupQrModal({ 
  open, 
  onClose, 
  scanning,
  cameraActive,
  cameraLoading,
  scanDisabled,
  onToggleCamera,
  onScanSuccess,
  onScanSubmit 
}) {
  const [scanForm] = Form.useForm();

  const handleScanSuccess = (decodedText) => {
    // Reset scanner state
    scanForm.setFieldsValue({ qrPayload: decodedText });
    onScanSuccess?.(decodedText);
  };

  const handleSubmit = async () => {
    try {
      const values = await scanForm.validateFields();
      await onScanSubmit?.(values);
      scanForm.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <Space size={10}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.orange}, #ffb454)`,
              color: "#fff",
              fontSize: 16,
            }}
          >
            <QrcodeOutlined />
          </span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Scan Pickup QR</span>
        </Space>
      }
      open={open}
      confirmLoading={scanning}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Confirm"
      cancelText="Close"
      width={480}
      centered
      destroyOnClose
    >
      <div style={{ marginBottom: 18 }}>
        <Button
          block
          size="large"
          type={cameraActive ? "default" : "primary"}
          danger={cameraActive}
          icon={cameraActive ? <StopOutlined /> : <CameraOutlined />}
          onClick={onToggleCamera}
          style={{
            borderRadius: 10,
            fontWeight: 500,
            height: 44,
          }}
        >
          {cameraActive ? "Stop Camera" : "Scan with Camera"}
        </Button>

        {cameraActive && !scanDisabled && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                border: `1px solid ${COLORS.orangeBorder}`,
                background: "#0b1220",
                boxShadow: `0 6px 20px ${COLORS.orange}26`,
              }}
            >
              {cameraLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: "rgba(11, 18, 32, 0.85)",
                    color: "#fff",
                  }}
                >
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 26, color: "#fff" }} spin />} />
                  <span style={{ fontSize: 13 }}>Starting camera...</span>
                </div>
              )}

              <div id="qr-reader" style={{ width: "100%" }} />
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Tag
                color="orange"
                icon={<QrcodeOutlined />}
                style={{
                  borderRadius: 20,
                  padding: "3px 12px",
                  fontSize: 12,
                }}
              >
                Position the QR code within the frame, 10–20cm away
              </Tag>
            </div>
          </div>
        )}

        {!cameraActive && (
          <div
            style={{
              marginTop: 14,
              borderRadius: 12,
              padding: "14px 16px",
              background: COLORS.orangeSoft,
              border: `1px solid ${COLORS.orangeBorder}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                color: COLORS.orange,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <InfoCircleOutlined />
              Tips for a fast, accurate scan
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Camera access requires HTTPS or localhost",
                "Allow camera access when your browser asks",
                "Make sure no other app is using the camera",
                "Hold the QR code steady with good lighting and distance",
                "Can't scan? Enter the order code manually below",
              ].map((tip) => (
                <div
                  key={tip}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 13,
                    color: "#475569",
                  }}
                >
                  <CheckCircleFilled style={{ color: COLORS.green, fontSize: 14, marginTop: 2 }} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Divider style={{ margin: "8px 0 16px" }} plain>
        <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 0.5 }}>OR ENTER MANUALLY</span>
      </Divider>

      <Form form={scanForm} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={
            <Space size={6}>
              <EditOutlined style={{ color: "#94a3b8" }} />
              <span>QR code or order code</span>
            </Space>
          }
          name="qrPayload"
          rules={[
            {
              required: true,
              message: "Scan or enter a pickup QR payload.",
            },
          ]}
        >
          <Input.TextArea
            autoFocus
            rows={3}
            placeholder="Enter order code or paste QR data"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
