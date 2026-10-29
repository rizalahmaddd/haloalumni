import { QRCodeSVG } from 'qrcode.react';

interface Props {
  value: string;
  size?: number;
}

export default function QRCode({ value, size = 92 }: Props) {
  return (
    <div className="alumni-card-qr">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#10101a"
        marginSize={0}
      />
    </div>
  );
}
