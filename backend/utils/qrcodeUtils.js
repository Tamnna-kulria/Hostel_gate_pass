import QRCode from "qrcode";

export async function generateQrCodeImage(text) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300
  });
}