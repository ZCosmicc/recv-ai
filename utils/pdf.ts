import { CVData } from '../types';

/**
 * Downloads the CV as PDF by:
 * 1. Collecting all pre-paginated .pdf-page divs rendered by CVPagedContent
 * 2. Cloning them into a new print window at actual A4 size
 * 3. Triggering print — each page container maps to exactly one PDF page
 */
export const downloadPDF = (
    cvData: CVData,
    _elementId?: string, // kept for backwards compat, ignored
    tier?: 'guest' | 'free' | 'pro',
) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to download PDF');
        return;
    }

    // Collect all paginated page containers
    const pageEls = document.querySelectorAll<HTMLElement>('[data-pdf-page="true"]');
    if (pageEls.length === 0) {
        alert('No CV content found. Please wait a moment and try again.');
        printWindow.close();
        return;
    }

    // Clone pages HTML
    const pagesHTML = Array.from(pageEls).map(el => el.outerHTML).join('\n');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${cvData.personal.name || 'My CV'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
    }
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      .print-instructions { display: none !important; }
      [data-pdf-page] {
        page-break-after: always;
        break-after: page;
      }
      [data-pdf-page]:last-child {
        page-break-after: avoid;
        break-after: avoid;
      }
    }
    @media screen {
      body { background: #888; }
      [data-pdf-page] {
        margin: 16px auto;
        box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        display: block;
      }
      .print-instructions {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: black;
        padding: 24px;
        border: 4px solid black;
        box-shadow: 6px 6px 0px 0px #000;
        z-index: 9999;
        max-width: 300px;
        font-family: system-ui, sans-serif;
      }
      .print-instructions h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        font-weight: 800;
        text-transform: uppercase;
        color: #0079FF;
      }
      .print-instructions ol {
        margin: 12px 0;
        padding-left: 18px;
      }
      .print-instructions li { margin: 6px 0; font-size: 13px; }
      .print-instructions button {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        background: #0079FF;
        color: white;
        border: 2px solid black;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
      }
      .print-instructions .cancel-btn { background: #ef4444; }
    }
  </style>
</head>
<body>
  <div class="print-instructions">
    <h3>📥 Save as PDF</h3>
    <ol>
      <li>Destination: <strong>Save as PDF</strong></li>
      <li>Turn OFF "Headers and footers"</li>
      <li>Turn ON "Background graphics"</li>
      <li>Margins: <strong>None</strong></li>
      <li>Click <strong>Save</strong></li>
    </ol>
    <button onclick="window.print()">Open Print Dialog</button>
    <button class="cancel-btn" onclick="window.close()">Cancel</button>
  </div>

  ${pagesHTML}

  <script>
    window.onload = () => setTimeout(() => window.print(), 600);
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.onkeydown = function(e) {
      if (e.keyCode === 123) return false;
      if (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) return false;
      if (e.ctrlKey && e.keyCode === 85) return false;
    };
  </script>
</body>
</html>`);

    printWindow.document.close();
};
