import { CVData } from '../types';

export const downloadPDF = (cvData: CVData, elementId: string = 'cv-preview-for-pdf', tier?: 'guest' | 'free' | 'pro') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download PDF');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    alert('Preview not found');
    return;
  }

  const content = element.innerHTML;

  printWindow.document.write(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${cvData.personal.name || 'My CV'}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          .print-instructions { display: none !important; }
          body { 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          @page { 
            margin: 0;
            size: A4;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Page break handling to prevent content cuts */
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            break-after: avoid;
          }
          
          /* Avoid breaks inside these elements */
          div, section, article, .experience-item, .education-item, .project-item {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Specifically for common CV section patterns */
          .mb-6, .mb-8, .mb-4, .space-y-4 > div, .space-y-6 > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .watermark {
            position: fixed;
            bottom: 10mm;
            right: 10mm;
            text-align: center;
            opacity: 0.6;
          }
          .watermark-text {
            font-size: 10px;
            color: #666;
            margin-bottom: 6px;
            font-weight: 500;
          }
          .watermark-logo {
            width: 80px;
            height: 35px;
            object-fit: contain;
          }
        }
        @media screen {
          .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            text-align: center;
            opacity: 0.6;
            z-index: 1000;
          }
          .watermark-text {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .watermark-logo {
            width: 100px;
            height: 45px;
            object-fit: contain;
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
            max-width: 320px;
          }
          .print-instructions h3 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0079FF;
          }
          .print-instructions ol {
            margin: 16px 0;
            padding-left: 20px;
            font-weight: 500;
          }
          .print-instructions li {
            margin: 8px 0;
            font-size: 14px;
          }
          .print-instructions button {
            width: 100%;
            padding: 12px;
            margin-top: 12px;
            background: #0079FF;
            color: white;
            border: 2px solid black;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 2px 2px 0px 0px #000;
            transition: transform 0.1s, box-shadow 0.1s;
          }
          .print-instructions button:hover {
            transform: translate(2px, 2px);
            box-shadow: none;
          }
          .print-instructions button.cancel-btn {
            background: #ef4444;
          }
        }
        body { 
          font-family: system-ui, -apple-system, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>
    <body>
      <div class="print-instructions">
        <h3>📥 Download as PDF</h3>
        <ol>
          <li>Destination: <strong>Save as PDF</strong></li>
          <li>Turn OFF "Headers and footers"</li>
          <li>Turn ON "Background graphics"</li>
          <li>Click <strong>Save</strong></li>
        </ol>
        <button onclick="window.print()">Open Print Dialog</button>
        <button class="cancel-btn" onclick="window.close()">Cancel</button>
      </div>
      
      <div id="cv-content">
        ${content}
      </div>

      ${tier !== 'pro' ? `
      <!-- Watermark (only for non-Pro users) -->
      <div class="watermark">
        <div class="watermark-text">Created by</div>
        <img src="/LogoPrimaryReCV.png" alt="Logo" class="watermark-logo" />
      </div>
      ` : ''}

      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
        document.addEventListener('contextmenu', event => event.preventDefault());
        document.onkeydown = function(e) {
          if (event.keyCode == 123) return false;
          if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) return false;
          if (e.ctrlKey && e.keyCode == 85) return false;
        };
      </script>
    </body>
  </html>
`);

  printWindow.document.close();
};
