// lib/generateDocx.ts
"use node";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from "docx";

export async function generateDocxFromMarkdown(
  reportMarkdown: string,
  projectName: string,
): Promise<Buffer> {
  // TODO: parse your markdown sections into structured data
  // for now we parse line by line — works well for our structured output

  const lines = reportMarkdown.split("\n");
  const children: Paragraph[] = [];

  function parseTextWithBold(text: string): TextRun[] {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return new TextRun({ text: part.slice(2, -2), bold: true });
      }
      return new TextRun({ text: part });
    });
  }

  for (const line of lines) {
    if (line.trim() === "") continue;

    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          children: parseTextWithBold(line.replace("# ", "")),
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      );
    } else if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          children: parseTextWithBold(line.replace("## ", "")),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "6C47FF" },
          },
        }),
      );
    } else if (line.startsWith("### ")) {
      children.push(
        new Paragraph({
          children: parseTextWithBold(line.replace("### ", "")),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      );
    } else if (line.trim().startsWith("- ")) {
      // Bullet points (including nested ones)
      const indent = line.search(/\S/);
      const level = Math.floor(indent / 2);
      children.push(
        new Paragraph({
          bullet: { level },
          children: parseTextWithBold(line.trim().replace("- ", "")),
          spacing: { after: 80 },
        }),
      );
    } else if (line.match(/^\s*\d+\. /)) {
      // Numbered lists
      const indent = line.search(/\S/);
      const level = Math.floor(indent / 2);
      children.push(
        new Paragraph({
          numbering: { reference: "default-numbering", level },
          children: parseTextWithBold(line.trim().replace(/^\d+\. /, "")),
          spacing: { after: 80 },
        }),
      );
    } else if (line.startsWith("---")) {
      children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          children: parseTextWithBold(line),
          spacing: { after: 100 },
        }),
      );
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 24 }, // 12pt
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
