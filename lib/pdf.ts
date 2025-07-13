import { ContainerEntity } from "@/app/api/demands/entity/container.entity";
import { DemandEntity } from "@/app/api/demands/entity/demand.entity";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from 'qrcode'; // pour générer le QR code

export type LabelInfos = {
  demandID: string,
  containerID: string,
  associationName: string,
  contents: {
    name: string,
    quantity: number,
  }[]
}

export async function generatePdf(pdfInfos: LabelInfos[]): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFontSize = 12;
  const textFontSize = 9;

  const labelWidth = 595 / 2;
  const labelHeight = 842 / 2;

  for (let i = 0; i < pdfInfos.length; i++) {
    const qrDataUrl = await QRCode.toDataURL(`https://192.168.1.44:3000/demands?selected-data-id=${pdfInfos[i].demandID}`);
    const qrImageBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), c => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrSize = 60;

    const col = i % 2;
    const row = Math.floor(i / 2);

    const xOffset = col * labelWidth;
    const yOffset = 842 - (row + 1) * labelHeight;

    const qrX = xOffset + 20;
    const qrY = yOffset + labelHeight - qrSize - 20;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    let textX = qrX + qrSize + 15;
    let textY = qrY + qrSize - 5;


    // Association name
    page.drawText(`Association ${pdfInfos[i].associationName}`, {
      x: textX,
      y: textY,
      size: titleFontSize,
      font,
      color: rgb(0, 0, 0.6),
    });

    textY -= 18;

    // Container ID
    page.drawText(`Numero contenant : ${pdfInfos[i].containerID}`, {
      x: textX,
      y: textY,
      size: textFontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    textY -= 14;

    // Contents
    page.drawText('Contenus :', {
      x: textX,
      y: textY,
      size: textFontSize,
      font,
    });

    textY -= 14;

    for (const item of pdfInfos[i].contents) {
      page.drawText(`- ${item.quantity} x ${item.name}`, {
        x: textX + 10,
        y: textY,
        size: textFontSize,
        font,
      });
      textY -= 11;
    }
  }

  const pdfBytes = await pdfDoc.saveAsBase64();

  return pdfBytes;
}