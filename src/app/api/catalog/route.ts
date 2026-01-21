import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib'; // Added PDFImage type
import { getAllArticlesWithVariantsGroupedByMark } from '@/lib/queries/articles';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const groupedArticles = await getAllArticlesWithVariantsGroupedByMark();

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 1. Explicitly type logoImage
    let logoImage: PDFImage | undefined;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {
      console.warn("Logo not found at /public/logo.png");
    }

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const rowHeight = 25;
    const headerHeight = 30;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    const colX = {
      product: margin,
      variant: 200,
      price: 400,
      stock: 500,
    };

    const drawHeader = () => {
        // 2. Adjust logo Y-position (moved slightly lower)
        if (logoImage) {
            const dims = logoImage.scale(0.22);
            currentPage.drawImage(logoImage, {
                x: margin,
                y: pageHeight - margin - 65, // Lowered from -40
                width: dims.width,
                height: dims.height,
            });
        }

        // 3. New Header Info with 2 locations and 2 phone numbers
        const infoX = pageWidth - margin - 180;
        let infoY = pageHeight - margin - 10;

        const contactInfo = [
            'Tél 1: +212 600 000 000',
            'Tél 2: +212 611 111 111',
            'Email: contact@goldstart.app',
            'Secteur A, Rue 1, Casablanca',
            'Secteur B, Rue 2, Rabat',
            'Catalogue des produits',
        ];

        contactInfo.forEach((line, index) => {
            // Make the last line (Catalogue) bold or slightly different if desired
            const isTitle = index === contactInfo.length - 1;
            currentPage.drawText(line, {
                x: infoX,
                y: infoY,
                size: 8.5,
                font: isTitle ? fontBold : font,
                color: isTitle ? rgb(0, 0, 0) : rgb(0.4, 0.4, 0.4),
            });
            infoY -= 13;
        });

        currentY = pageHeight - margin - 100; // Adjusted starting point for content
    };

    const checkNewPage = (neededHeight: number) => {
      if (currentY - neededHeight < margin + 40) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
        // Optional: you could call drawHeader() on every page if you want the logo everywhere
        return true;
      }
      return false;
    };

    drawHeader();

    for (const group of groupedArticles) {
      if (!group.markName || group.articles.length === 0) continue;

      checkNewPage(100);

      currentY -= 30;
      currentPage.drawText(group.markName, {
        x: margin,
        y: currentY,
        size: 18,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      currentY -= 30;

      // Header Background
      currentPage.drawRectangle({
        x: margin,
        y: currentY - 5,
        width: pageWidth - (margin * 2),
        height: headerHeight,
        color: rgb(0.98, 0.98, 0.98),
      });

      const headerY = currentY + 7;
      const headers = [
          { text: 'Produit', x: colX.product + 5 },
          { text: 'Variantes', x: colX.variant + 5 },
          { text: 'Prix', x: colX.price + 5 },
          { text: 'Stock', x: colX.stock + 5 }
      ];

      headers.forEach(h => {
          currentPage.drawText(h.text, { x: h.x, y: headerY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      });

      currentPage.drawLine({
          start: { x: margin, y: currentY - 5 },
          end: { x: pageWidth - margin, y: currentY - 5 },
          thickness: 1,
          color: rgb(0.9, 0.9, 0.9),
      });

      currentY -= 5;

      for (const article of group.articles) {
        const articleTotalHeight = article.variants.length * rowHeight;

        if (checkNewPage(articleTotalHeight)) {
            // Draw header again on new page for table context
            currentY -= 30;
        }

        const productBlockTop = currentY;

        article.variants.forEach((variant: typeof article.variants[number]) => {
          currentY -= rowHeight;
          const textY = currentY + 7;

          // Variant Text
          currentPage.drawText(variant.name, {
            x: colX.variant + 5,
            y: textY,
            size: 9,
            font: font,
          });

          // Price Bold
          const priceText = variant.price > 0 ? `${variant.price} DH` : 'Sur demande';
          currentPage.drawText(priceText, {
            x: colX.price + 5,
            y: textY,
            size: 9,
            font: fontBold,
            color: rgb(0, 0, 0),
          });

          // Stock Color
          const isStock = variant.stock > 0;
          currentPage.drawText(isStock ? 'En stock' : 'Rupture', {
            x: colX.stock + 5,
            y: textY,
            size: 9,
            font: font,
            color: isStock ? rgb(0.13, 0.6, 0.3) : rgb(0.8, 0.2, 0.2),
          });

          currentPage.drawLine({
            start: { x: colX.variant, y: currentY },
            end: { x: pageWidth - margin, y: currentY },
            thickness: 0.5,
            color: rgb(0.9, 0.9, 0.9),
          });
        });

        // Merged Product Cell
        currentPage.drawRectangle({
            x: colX.product,
            y: currentY,
            width: colX.variant - colX.product,
            height: articleTotalHeight,
            borderColor: rgb(0.9, 0.9, 0.9),
            borderWidth: 0.5,
        });

        currentPage.drawText(article.name, {
            x: colX.product + 5,
            y: productBlockTop - (articleTotalHeight / 2) - 4,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
            maxWidth: colX.variant - colX.product - 10,
        });

        currentPage.drawLine({
            start: { x: colX.variant, y: productBlockTop },
            end: { x: colX.variant, y: currentY },
            thickness: 0.5,
            color: rgb(0.9, 0.9, 0.9),
        });

        currentPage.drawLine({
            start: { x: margin, y: currentY },
            end: { x: pageWidth - margin, y: currentY },
            thickness: 0.5,
            color: rgb(0.9, 0.9, 0.9),
        });
      }
      currentY -= 5;
    }

    const pages = pdfDoc.getPages();
    pages.forEach((page, i) => {
        page.drawText(`Page ${i + 1} / ${pages.length}`, {
            x: pageWidth / 2 - 30,
            y: 20,
            size: 8,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
        });
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="catalog-${Date.now()}.pdf"`,
      },
    });
  } catch (_) {
    console.error('PDF generation error');
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}