import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getAllArticlesWithVariantsGroupedByMark } from '@/db/queries/articles';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const groupedArticles = await getAllArticlesWithVariantsGroupedByMark();

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const tableTop = 150;
    const rowHeight = 25;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = tableTop;

    // Add header on first page
    currentPage.drawText('Phone Repair', {
      x: margin,
      y: pageHeight - 50,
      size: 24,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    const contactLines = [
      'WhatsApp: +212 600 000 000',
      'Email: contact@goldstart.app',
      'Catalogue des produits',
    ];

    let contactY = pageHeight - 50;
    for (const line of contactLines) {
      currentPage.drawText(line, {
        x: pageWidth - margin - 150,
        y: contactY,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      contactY -= 15;
    }

    // Draw line separator
    currentPage.drawLine({
      start: { x: margin, y: pageHeight - 120 },
      end: { x: pageWidth - margin, y: pageHeight - 120 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Column positions
    const colX = {
      product: margin,
      variant: 280,
      price: 400,
      stock: 480,
    };

    // Helper to check and add new page if needed
    const checkNewPage = () => {
      if (currentY > pageHeight - 100) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = tableTop;

        // Add page number
        currentPage.drawText(`Page ${pdfDoc.getPageCount()}`, {
          x: pageWidth / 2 - 20,
          y: 30,
          size: 8,
          font: font,
          color: rgb(0.6, 0.6, 0.6),
        });
      }
    };

    // Process each group (mark)
    for (const group of groupedArticles) {
      if (!group.markName || group.articles.length === 0) continue;

      checkNewPage();

      // Mark title
      currentPage.drawText(group.markName, {
        x: margin,
        y: currentY,
        size: 16,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      currentY += 30;

      // Table header
      currentPage.drawText('Produit', {
        x: colX.product + 5,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentPage.drawText('Variantes', {
        x: colX.variant + 5,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentPage.drawText('Prix', {
        x: colX.price + 5,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentPage.drawText('Stock', {
        x: colX.stock + 5,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Draw header background
      currentPage.drawRectangle({
        x: colX.product,
        y: currentY - 5,
        width: pageWidth - 2 * margin,
        height: rowHeight,
        color: rgb(0.96, 0.96, 0.96),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      currentY += rowHeight;

      let rowCounter = 0;

      for (const article of group.articles) {
        for (let i = 0; i < article.variants.length; i++) {
          const variant = article.variants[i];

          checkNewPage();

          // Alternating row background
          if (rowCounter % 2 === 0) {
            currentPage.drawRectangle({
              x: colX.product,
              y: currentY - 5,
              width: pageWidth - 2 * margin,
              height: rowHeight,
              color: rgb(0.98, 0.98, 0.98),
            });
          }
          rowCounter++;

          // Row border
          currentPage.drawRectangle({
            x: colX.product,
            y: currentY - 5,
            width: pageWidth - 2 * margin,
            height: rowHeight,
            borderColor: rgb(0.93, 0.93, 0.93),
            borderWidth: 1,
          });

          // Product cell (only for first variant)
          if (i === 0) {
            currentPage.drawText(article.name, {
              x: colX.product + 5,
              y: currentY,
              size: 8,
              font: font,
              color: rgb(0, 0, 0),
              maxWidth: colX.variant - colX.product - 10,
            });
          }

          // Variant cell
          currentPage.drawText(variant.name, {
            x: colX.variant + 5,
            y: currentY,
            size: 8,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: colX.price - colX.variant - 10,
          });

          // Price cell
          const priceText = variant.price > 0 ? `${variant.price} DH` : 'Sur demande';
          currentPage.drawText(priceText, {
            x: colX.price + 5,
            y: currentY,
            size: 8,
            font: font,
            color: rgb(0, 0, 0),
          });

          // Stock cell
          const stockColor = variant.stock > 0 ? rgb(0.13, 0.77, 0.37) : rgb(0.94, 0.26, 0.26);
          const stockText = variant.stock > 0 ? 'En stock' : 'Rupture';
          currentPage.drawText(stockText, {
            x: colX.stock + 5,
            y: currentY,
            size: 8,
            font: font,
            color: stockColor,
          });

          currentY += rowHeight;
        }
      }

      currentY += 20;
    }

    // Add page numbers to all pages
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      pages[i].drawText(`Page ${i + 1}`, {
        x: pageWidth / 2 - 20,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
      });
    }

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="catalog-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
