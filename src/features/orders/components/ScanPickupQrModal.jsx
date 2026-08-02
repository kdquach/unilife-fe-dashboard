import React, { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Modal, Form, Input, Button, Space } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { orderService } from "../orderService";
import { notify } from "../../../utils/notify";

export default function ScanPickupQrModal({ open, onClose, onSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanDisabled, setScanDisabled] = useState(false);
  const [scanForm] = Form.useForm();
  const [scannerKey, setScannerKey] = useState(0);

  const isProcessingRef = useRef(false);
  const scanDisabledRef = useRef(false);
  const cameraActiveRef = useRef(false);
  const scanOpenRef = useRef(false);
  const lastScannedQrRef = useRef(null);
  const scanCooldownRef = useRef(0);
  const scanLockRef = useRef(false);
  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);

  const handleScanPickupQr = async (values) => {
    try {
      setScanning(true);
      isProcessingRef.current = true;

      const qrPayload = typeof values.qrPayload === 'string' ? values.qrPayload.trim() : values.qrPayload;
      
      let payload;
      if (values.orderCode) {
        payload = { orderCode: values.orderCode };
      } else {
        try {
          const parsed = JSON.parse(qrPayload);
          if (typeof parsed === 'object' && parsed !== null) {
            payload = { qrPayload };
          } else {
            if (/^\d+$/.test(qrPayload)) {
              payload = { orderCode: qrPayload };
            } else {
              payload = { qrPayload };
            }
          }
        } catch {
          if (/^\d+$/.test(qrPayload)) {
            payload = { orderCode: qrPayload };
          } else {
            payload = { qrPayload };
          }
        }
      }

      const result = await orderService.scanPickupQr(payload);

      notify.success(
        result.created ? "Pickup QR Scanned" : "Pickup QR Already Scanned",
        `Queue #${result.queue?.queueNumber || "-"} is ready for kitchen.`,
      );

      resetScanner();
      onClose();
      scanForm.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Scan error:", error);
      notify.error("Pickup QR Scan Failed", error.message);
      resetScanner();
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setCameraActive(false);
    setScanDisabled(false);
    isProcessingRef.current = false;
    scanLockRef.current = false;
    lastScannedQrRef.current = null;
    scanCooldownRef.current = 0;
    setScannerKey(prev => prev + 1);
  };

  const handleScanResult = useCallback((decodedText) => {
    if (!decodedText || scanDisabledRef.current || !cameraActiveRef.current || !scanOpenRef.current) {
      return;
    }
    
    const now = Date.now();
    if (lastScannedQrRef.current === decodedText && (now - scanCooldownRef.current) < 3000) {
      return;
    }
    
    lastScannedQrRef.current = decodedText;
    scanCooldownRef.current = Date.now();
    setScanDisabled(true);
    setCameraActive(false);
    
    if (html5QrCodeRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      
      try {
        html5QrCodeRef.current.stop().catch(() => {}).then(() => {
          html5QrCodeRef.current.clear().catch(() => {}).then(() => {
            html5QrCodeRef.current = null;
            isStoppingRef.current = false;
          });
        });
      } catch (e) {
        try {
          html5QrCodeRef.current.clear().catch(() => {}).then(() => {
            html5QrCodeRef.current = null;
            isStoppingRef.current = false;
          });
        } catch (e2) {
          html5QrCodeRef.current = null;
          isStoppingRef.current = false;
        }
      }
    }
    
    setTimeout(() => {
      onClose();
    }, 500);
    
    scanForm.setFieldsValue({ qrPayload: decodedText });
    handleScanPickupQr({ qrPayload: decodedText });
  }, [scanForm, handleScanPickupQr, onClose]);

  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  }, [handleScanResult]);

  const handleScanResultRef = useRef(null);

  useEffect(() => {
    scanDisabledRef.current = scanDisabled;
  }, [scanDisabled]);

  useEffect(() => {
    cameraActiveRef.current = cameraActive;
  }, [cameraActive]);

  useEffect(() => {
    scanOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (cameraActive && !scanDisabled) {
      const startScanner = async () => {
        try {
          setCameraLoading(true);
          
          let retries = 0;
          const maxRetries = 10;
          let element = null;
          
          while (retries < maxRetries && !element) {
            await new Promise(resolve => setTimeout(resolve, 100));
            element = document.getElementById("qr-reader");
            retries++;
          }
          
          if (!element) {
            throw new Error("QR reader element not found in DOM after multiple attempts");
          }
          
          if (html5QrCodeRef.current) {
            try {
              await html5QrCodeRef.current.stop();
              await html5QrCodeRef.current.clear();
            } catch (e) {
              console.log("Clear error (expected):", e);
            }
          }
          
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;
          
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
          
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              if (handleScanResultRef.current) {
                handleScanResultRef.current(decodedText);
              }
            },
            (errorMessage) => {
              if (!errorMessage?.includes('NotFoundException') && 
                  !errorMessage?.includes('IndexSizeError') &&
                  !errorMessage?.includes('getImageData') &&
                  !errorMessage?.includes('No QR code')) {
                console.error("Scanning error:", errorMessage);
              }
            }
          );
        } catch (error) {
          console.error("Failed to start scanner:", error);
          notify.error("Camera Error", `Failed to start camera scanner: ${error.message}`);
          setCameraActive(false);
        } finally {
          setCameraLoading(false);
        }
      };

      startScanner();
    }

    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear().then(() => {
            html5QrCodeRef.current = null;
            isStoppingRef.current = false;
          }).catch(err => {
            html5QrCodeRef.current = null;
            isStoppingRef.current = false;
          });
        } catch (err) {
          html5QrCodeRef.current = null;
          isStoppingRef.current = false;
        }
      }
    };
  }, [cameraActive, scanDisabled]);

  useEffect(() => {
    return () => {
      resetScanner();
    };
  }, []);

  const handleCancel = async () => {
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (stopErr) {
          console.log(" onCancel stop error (expected if already stopped):", stopErr);
        }
        try {
          await html5QrCodeRef.current.clear();
        } catch (clearErr) {
          console.log(" onCancel clear error:", clearErr);
        }
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.log(" onCancel cleanup error:", err);
    }
    
    resetScanner();
    onClose();
    scanForm.resetFields();
  };

  return (
    <Modal
      key={scannerKey}
      title="Scan Pickup QR"
      open={open}
      confirmLoading={scanning}
      onCancel={handleCancel}
      onOk={() => scanForm.submit()}
    >
      <div className="mb-4">
        <Space>
          <Button
            icon={<QrcodeOutlined />}
            onClick={async () => {
              if (cameraActive) {
                try {
                  if (html5QrCodeRef.current) {
                    try {
                      await html5QrCodeRef.current.stop();
                    } catch (stopErr) {
                      console.log("Stop Camera stop error:", stopErr);
                    }
                    try {
                      await html5QrCodeRef.current.clear();
                    } catch (clearErr) {
                      console.log("Stop Camera clear error:", clearErr);
                    }
                    html5QrCodeRef.current = null;
                  }
                } catch (err) {
                  console.log("Stop Camera cleanup error:", err);
                }
              }
              setCameraActive(!cameraActive);
            }}
          >
            {cameraActive ? "Stop Camera" : "Scan with Camera"}
          </Button>
        </Space>
        
        {cameraActive && !scanDisabled && (
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <div id="qr-reader" style={{ width: '100%' }}></div>
          </div>
        )}
        
        {!cameraActive && (
          <div className="mt-3 text-sm text-slate-500">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Camera access requires HTTPS or localhost</li>
              <li>Allow camera permission when prompted</li>
              <li>Make sure no other app is using the camera</li>
              <li>Hold QR code steady and at proper distance</li>
              <li>Ensure good lighting and focus</li>
              <li>Use manual input below if camera doesn't work</li>
            </ul>
          </div>
        )}
        
        {cameraActive && (
          <div className="mt-3 text-xs text-slate-400">
            <p>📷 Point camera at QR code. Hold steady at 10-20cm distance.</p>
          </div>
        )}
      </div>

      <Form form={scanForm} layout="vertical" onFinish={handleScanPickupQr}>
        <Form.Item
          label="QR payload or order code"
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
            rows={4}
            placeholder='Scan QR here, paste JSON like {"type":"UNILIFE_PICKUP","orderId":"...","orderCode":"..."}, or enter order code like "478969"'
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
