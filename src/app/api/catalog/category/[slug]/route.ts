import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import { getCategoryBySlug } from '@/lib/queries/categories';
import { getArticlesWithVariantsByCategory } from '@/lib/queries/articles';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const articles = await getArticlesWithVariantsByCategory(category.id);

    // Group articles by mark
    const groupedByMark = articles.reduce((acc: Record<string, typeof articles>, article) => {
      const markName = article.markName || 'Sans marque';
      if (!acc[markName]) {
        acc[markName] = [];
      }
      acc[markName].push(article);
      return acc;
    }, {});

    // Convert to array format
    const groupedArticles = Object.entries(groupedByMark).map(([markName, articles]) => ({
      markName: markName === 'Sans marque' ? null : markName,
      articles,
    }));

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Load header image
    let logoImage: PDFImage | undefined;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'pdf-header.png');
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {
      console.warn('Logo not found at /public/pdf-header.png');
    }

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 30;
    const rowHeight = 18;
    const columnGap = 20;
    const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;
    const minBottomY = margin + 20; // Minimum Y before page break

    // Column positions
    const colLeft = {
      x: margin,
      productWidth: 70,
      variantWidth: 90,
      priceWidth: 50,
    };
    const colRight = {
      x: margin + columnWidth + columnGap,
      productWidth: 70,
      variantWidth: 90,
      priceWidth: 50,
    };

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;
    let currentColumn: 'left' | 'right' = 'left';

    const headerHeight = logoImage ? 100 : 0;
    const titleHeight = 30;
    const colHeaderHeight = 20;
    const markHeaderHeight = 22;

    // Draw header image
    if (logoImage) {
      currentPage.drawImage(logoImage, {
        x: 0,
        y: pageHeight - headerHeight,
        width: pageWidth,
        height: headerHeight,
      });
    }

    // Draw title
    currentY = pageHeight - headerHeight - titleHeight;
    currentPage.drawText(category.name, {
      x: margin,
      y: currentY,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Draw column headers
    const drawColumnHeaders = (colX: number, config: typeof colLeft) => {
      const y = currentY - colHeaderHeight - 5;

      // Background
      currentPage.drawRectangle({
        x: colX,
        y: y,
        width: config.productWidth + config.variantWidth + config.priceWidth,
        height: colHeaderHeight,
        color: rgb(252 / 255, 57 / 255, 0),
      });

      // Text
      currentPage.drawText('Produit', {
        x: colX + 5,
        y: y + 6,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      currentPage.drawText('Variant', {
        x: colX + config.productWidth + 5,
        y: y + 6,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      currentPage.drawText('Prix', {
        x: colX + config.productWidth + config.variantWidth + 5,
        y: y + 6,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      // Border
      currentPage.drawRectangle({
        x: colX,
        y: y,
        width: config.productWidth + config.variantWidth + config.priceWidth,
        height: colHeaderHeight,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 0.5,
      });

      // Vertical lines
      currentPage.drawLine({
        start: { x: colX + config.productWidth, y: y + colHeaderHeight },
        end: { x: colX + config.productWidth, y: y },
        thickness: 0.5,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentPage.drawLine({
        start: { x: colX + config.productWidth + config.variantWidth, y: y + colHeaderHeight },
        end: { x: colX + config.productWidth + config.variantWidth, y: y },
        thickness: 0.5,
        color: rgb(0.2, 0.2, 0.2),
      });
    };

    drawColumnHeaders(colLeft.x, colLeft);
    drawColumnHeaders(colRight.x, colRight);

    // Track Y for each column separately
    let yLeft = currentY - colHeaderHeight - 5;
    let yRight = currentY - colHeaderHeight - 5;

    const addNewPage = () => {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);

      // Draw header on new page
      if (logoImage) {
        currentPage.drawImage(logoImage, {
          x: 0,
          y: pageHeight - headerHeight,
          width: pageWidth,
          height: headerHeight,
        });
      }

      // Draw column headers on new page
      const headerY = pageHeight - headerHeight - colHeaderHeight - 10;

      const drawHeadersOnly = (colX: number, config: typeof colLeft, y: number) => {
        currentPage.drawRectangle({
          x: colX,
          y: y,
          width: config.productWidth + config.variantWidth + config.priceWidth,
          height: colHeaderHeight,
          color: rgb(252 / 255, 57 / 255, 0),
        });
        currentPage.drawText('Produit', { x: colX + 5, y: y + 6, size: 9, font: fontBold, color: rgb(1, 1, 1) });
        currentPage.drawText('Variant', { x: colX + config.productWidth + 5, y: y + 6, size: 9, font: fontBold, color: rgb(1, 1, 1) });
        currentPage.drawText('Prix', { x: colX + config.productWidth + config.variantWidth + 5, y: y + 6, size: 9, font: fontBold, color: rgb(1, 1, 1) });
        currentPage.drawRectangle({
          x: colX,
          y: y,
          width: config.productWidth + config.variantWidth + config.priceWidth,
          height: colHeaderHeight,
          borderColor: rgb(0.2, 0.2, 0.2),
          borderWidth: 0.5,
        });
      };

      drawHeadersOnly(colLeft.x, colLeft, headerY);
      drawHeadersOnly(colRight.x, colRight, headerY);

      yLeft = headerY;
      yRight = headerY;
    };

    const canFit = (y: number, height: number) => y - height >= minBottomY;

    for (const group of groupedArticles) {
      if (!group.markName || group.articles.length === 0) continue;

      // Find the lowest Y position between columns
      const lowestY = Math.min(yLeft, yRight);

      // Check if mark header can fit
      if (!canFit(lowestY, markHeaderHeight + 10)) {
        addNewPage();
      }

      // Draw mark header at the lowest Y position
      const markY = Math.min(yLeft, yRight);

      currentPage.drawRectangle({
        x: margin,
        y: markY - markHeaderHeight,
        width: pageWidth - margin * 2,
        height: markHeaderHeight,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });

      currentPage.drawText(group.markName, {
        x: margin + 10,
        y: markY - markHeaderHeight + 7,
        size: 11,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Update both Y positions
      yLeft = markY - markHeaderHeight;
      yRight = markY - markHeaderHeight;

      for (const article of group.articles) {
        const articleHeight = article.variants.length * rowHeight;

        // Determine which column to use
        const leftCanFit = canFit(yLeft, articleHeight);
        const rightCanFit = canFit(yRight, articleHeight);

        let useColumn: 'left' | 'right';
        let startY: number;
        let config: typeof colLeft;
        let colX: number;

        if (currentColumn === 'left' && leftCanFit) {
          useColumn = 'left';
          startY = yLeft;
          config = colLeft;
          colX = colLeft.x;
        } else if (currentColumn === 'right' && rightCanFit) {
          useColumn = 'right';
          startY = yRight;
          config = colRight;
          colX = colRight.x;
        } else if (leftCanFit) {
          useColumn = 'left';
          startY = yLeft;
          config = colLeft;
          colX = colLeft.x;
        } else if (rightCanFit) {
          useColumn = 'right';
          startY = yRight;
          config = colRight;
          colX = colRight.x;
        } else {
          // Need new page
          addNewPage();
          useColumn = 'left';
          startY = yLeft;
          config = colLeft;
          colX = colLeft.x;
        }

        currentColumn = useColumn;
        const endY = startY - articleHeight;

        // Draw variant rows
        for (let i = 0; i < article.variants.length; i++) {
          const variant = article.variants[i];
          const rowY = startY - (i + 1) * rowHeight;

          // Alternating background
          const bgColor = i % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1);
          currentPage.drawRectangle({
            x: colX + config.productWidth,
            y: rowY,
            width: config.variantWidth + config.priceWidth,
            height: rowHeight,
            color: bgColor,
          });

          // Variant name
          const variantName = variant.name.length > 22
            ? variant.name.substring(0, 22) + '...'
            : variant.name;
          currentPage.drawText(variantName, {
            x: colX + config.productWidth + 5,
            y: rowY + 5,
            size: 8,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
          });

          // Price
          const priceText = variant.price > 0 ? `${variant.price} DH` : 'Sur demande';
          currentPage.drawText(priceText, {
            x: colX + config.productWidth + config.variantWidth + 5,
            y: rowY + 5,
            size: 8,
            font: fontBold,
            color: rgb(0, 0, 0),
          });

          // Horizontal lines
          currentPage.drawLine({
            start: { x: colX + config.productWidth, y: rowY + rowHeight },
            end: { x: colX + config.productWidth + config.variantWidth + config.priceWidth, y: rowY + rowHeight },
            thickness: 0.3,
            color: rgb(0.85, 0.85, 0.85),
          });
          currentPage.drawLine({
            start: { x: colX + config.productWidth, y: rowY },
            end: { x: colX + config.productWidth + config.variantWidth + config.priceWidth, y: rowY },
            thickness: 0.3,
            color: rgb(0.85, 0.85, 0.85),
          });
        }

        // Product cell
        currentPage.drawRectangle({
          x: colX,
          y: endY,
          width: config.productWidth,
          height: articleHeight,
          color: rgb(0.96, 0.96, 0.96),
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 0.5,
        });

        // Product name (centered)
        const productName = article.name.length > 14
          ? article.name.substring(0, 14) + '...'
          : article.name;
        const textWidth = fontBold.widthOfTextAtSize(productName, 9);
        const productY = startY - articleHeight / 2 - 3;

        currentPage.drawText(productName, {
          x: colX + (config.productWidth - textWidth) / 2,
          y: productY,
          size: 9,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.1),
        });

        // Vertical separators
        currentPage.drawLine({
          start: { x: colX + config.productWidth, y: startY },
          end: { x: colX + config.productWidth, y: endY },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7),
        });
        currentPage.drawLine({
          start: { x: colX + config.productWidth + config.variantWidth, y: startY },
          end: { x: colX + config.productWidth + config.variantWidth, y: endY },
          thickness: 0.3,
          color: rgb(0.85, 0.85, 0.85),
        });

        // Update column Y position
        if (useColumn === 'left') {
          yLeft = endY;
        } else {
          yRight = endY;
        }

        // Switch column for next article
        currentColumn = currentColumn === 'left' ? 'right' : 'left';
      }
    }

    // Add page numbers
    const pages = pdfDoc.getPages();
    pages.forEach((page, i) => {
      page.drawText(`Page ${i + 1} / ${pages.length}`, {
        x: pageWidth / 2 - 25,
        y: 15,
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
        'Content-Disposition': `attachment; filename="${category.slug}-catalog-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}