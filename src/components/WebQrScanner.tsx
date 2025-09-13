import QrScanner from "qr-scanner";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

export default function WebQrScanner({
  onResult,
}: {
  onResult: (data: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          onResult(result.data);
        },
        { highlightScanRegion: true }
      );
      qrScanner.start();
      setScanner(qrScanner);
      return () => qrScanner.stop();
    }
  }, [videoRef]);

  return (
    <View style={{ flex: 1 }}>
      <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
      <Button onPress={() => scanner?.stop()}>Detener</Button>
    </View>
  );
}
