import React, { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Modal, Form, Input, Button, Divider } from "antd";
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

  const handleToggleCamera = async () => {
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
  };

  const showLiveCamera = cameraActive && !scanDisabled;

  return (
    <Modal
      key={scannerKey}
      title={
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <QrcodeOutlined />
          </span>
          <span>Scan Pickup QR</span>
        </div>
      }
      open={open}
      width={480}
      confirmLoading={scanning}
      okText="Confirm"
      cancelText="Close"
      onCancel={handleCancel}
      onOk={() => scanForm.submit()}
    >
      <div className="flex flex-col gap-4">
        {/* Camera area */}
        <div>
          {showLiveCamera ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black shadow-inner">
              <div id="qr-reader" style={{ width: "100%" }}></div>

              {/* Corner frame overlay */}
              <div className="pointer-events-none absolute inset-4">
                <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-md border-l-4 border-t-4 border-blue-400" />
                <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-md border-r-4 border-t-4 border-blue-400" />
                <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-md border-b-4 border-l-4 border-blue-400" />
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-md border-b-4 border-r-4 border-blue-400" />
              </div>

              {/* Scanning status badge */}
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Scanning...
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-500">
                <QrcodeOutlined />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700">
                  Camera is off
                </div>
                <div className="text-xs text-slate-400">
                  Tap the button below to start scanning
                </div>
              </div>
            </div>
          )}

          <Button
            block
            size="large"
            type={cameraActive ? "default" : "primary"}
            danger={cameraActive}
            icon={<QrcodeOutlined />}
            loading={cameraLoading}
            className="mt-3"
            onClick={handleToggleCamera}
          >
            {cameraActive ? "Stop Camera" : "Scan with Camera"}
          </Button>

          {showLiveCamera && (
            <div className="mt-2 text-center text-xs text-slate-400">
              📷 Hold the QR code 10–20cm from the camera, in good light.
            </div>
          )}
        </div>

        <Divider className="!my-0 text-xs text-slate-400">
          Or enter manually
        </Divider>

        <Form
          form={scanForm}
          layout="vertical"
          onFinish={handleScanPickupQr}
          className="!mb-0"
        >
          <Form.Item
            name="qrPayload"
            rules={[
              {
                required: true,
                message: "Scan or enter a pickup QR payload.",
              },
            ]}
            className="!mb-0"
          >
            <Input.TextArea
              autoFocus
              rows={3}
              className="font-mono text-xs"
              placeholder='Paste QR payload or enter order code, e.g. "478969"'
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
