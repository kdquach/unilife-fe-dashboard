import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { notify } from "../../../utils/notify";

/**
 * Hook to manage QR code scanning with camera
 * Handles Html5Qrcode lifecycle, camera start/stop, and scan result processing
 */
export function useQrScanner({ onScanSuccess, onScanError }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanDisabled, setScanDisabled] = useState(false);
  
  // Refs to avoid stale closures
  const isProcessingRef = useRef(false);
  const scanDisabledRef = useRef(false);
  const cameraActiveRef = useRef(false);
  const scanOpenRef = useRef(false);
  const lastScannedQrRef = useRef(null);
  const scanCooldownRef = useRef(0);
  const scanLockRef = useRef(false);
  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);
  const handleScanResultRef = useRef(null);

  // Sync refs with state values
  useEffect(() => {
    scanDisabledRef.current = scanDisabled;
  }, [scanDisabled]);

  useEffect(() => {
    cameraActiveRef.current = cameraActive;
  }, [cameraActive]);

  useEffect(() => {
    scanOpenRef.current = true; // Will be controlled by parent component
  }, []);

  // Handle camera start/stop with Html5Qrcode
  useEffect(() => {
    if (cameraActive && !scanDisabled) {
      const startScanner = async () => {
        try {
          setCameraLoading(true);

          // Wait for DOM to be ready and element to be rendered
          let retries = 0;
          const maxRetries = 10;
          let element = null;

          while (retries < maxRetries && !element) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            element = document.getElementById("qr-reader");
            retries++;
          }

          if (!element) {
            throw new Error("QR reader element not found in DOM after multiple attempts");
          }

          // Clear any existing scanner instance
          if (html5QrCodeRef.current) {
            try {
              await html5QrCodeRef.current.stop();
              await html5QrCodeRef.current.clear();
            } catch (e) {
              // expected if already stopped
            }
          }

          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
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
              // Ignore common scanning errors
              if (
                !errorMessage?.includes("NotFoundException") &&
                !errorMessage?.includes("IndexSizeError") &&
                !errorMessage?.includes("getImageData") &&
                !errorMessage?.includes("No QR code")
              ) {
                console.error("Scanning error:", errorMessage);
                if (onScanError) {
                  onScanError(errorMessage);
                }
              }
            },
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
      // Cleanup: only clear if scanner exists, don't stop to avoid race conditions.
      // Parent component handles the stop; this just ensures cleanup.
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current
            .clear()
            .then(() => {
              html5QrCodeRef.current = null;
              isStoppingRef.current = false;
            })
            .catch(() => {
              html5QrCodeRef.current = null;
              isStoppingRef.current = false;
            });
        } catch (err) {
          html5QrCodeRef.current = null;
          isStoppingRef.current = false;
        }
      }
    };
  }, [cameraActive, scanDisabled, onScanError]);

  useEffect(
    () => () => {
      // Cleanup when component unmounts
      setCameraActive(false);
      setScanDisabled(false);
      isProcessingRef.current = false;
      scanLockRef.current = false;
      lastScannedQrRef.current = null;
      scanCooldownRef.current = 0;
    },
    [],
  );

  const handleScanResult = useCallback(
    (decodedText) => {
      if (!decodedText || scanDisabledRef.current || !cameraActiveRef.current || !scanOpenRef.current) {
        return;
      }

      // Prevent duplicate scans with a cooldown window
      const now = Date.now();
      if (lastScannedQrRef.current === decodedText && now - scanCooldownRef.current < 3000) {
        return;
      }

      lastScannedQrRef.current = decodedText;
      scanCooldownRef.current = Date.now();
      setScanDisabled(true);
      setCameraActive(false);

      // Stop the scanner immediately to prevent further scans
      if (html5QrCodeRef.current && !isStoppingRef.current) {
        isStoppingRef.current = true;

        try {
          html5QrCodeRef.current
            .stop()
            .catch(() => {})
            .then(() => {
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

      // Call the parent's scan success handler
      if (onScanSuccess) {
        onScanSuccess(decodedText);
      }
    },
    [onScanSuccess],
  );

  // Keep a ref in sync so the QR callback always calls the latest handler
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  }, [handleScanResult]);

  const closeScanModal = async () => {
    // Force stop the scanner immediately with proper error handling
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (stopErr) {
          // expected if already stopped
        }
        try {
          await html5QrCodeRef.current.clear();
        } catch (clearErr) {
          // expected if already cleared
        }
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      // no-op
    }

    // Reset all states and refs
    setCameraActive(false);
    setScanDisabled(false);
    isProcessingRef.current = false;
    scanLockRef.current = false;
    lastScannedQrRef.current = null;
    scanCooldownRef.current = 0;
    isStoppingRef.current = false;
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      // Force stop the scanner when clicking Stop Camera
      try {
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (stopErr) {
            // expected if already stopped
          }
          try {
            await html5QrCodeRef.current.clear();
          } catch (clearErr) {
            // expected if already cleared
          }
          html5QrCodeRef.current = null;
        }
      } catch (err) {
        // no-op
      }
    }
    setCameraActive(!cameraActive);
  };

  const resetScanner = () => {
    setScanDisabled(false);
    isProcessingRef.current = false;
    scanLockRef.current = false;
    lastScannedQrRef.current = null;
    scanCooldownRef.current = 0;
  };

  return {
    cameraActive,
    cameraLoading,
    scanDisabled,
    setCameraActive,
    setScanDisabled,
    closeScanModal,
    toggleCamera,
    resetScanner,
  };
}
