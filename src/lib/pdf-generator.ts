import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import type { Receipt, StoreInfo } from './types';

export function generatePdf(receipt: Receipt, storeInfo: StoreInfo) {
  const doc = new jsPDF();
  
  // Header
  if (storeInfo.logo) {
    try {
      doc.addImage(storeInfo.logo, 'PNG', 15, 12, 24, 24);
    } catch(e) {
      console.error("Error adding logo to PDF", e);
    }
  }
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(storeInfo.name, 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(storeInfo.address, 105, 28, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('Sales Receipt', 105, 45, { align: 'center' });

  // Customer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.customerName, 20, 67);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt #:', 140, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.id, 165, 60);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 140, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(format(parseISO(receipt.date), 'MMMM dd, yyyy'), 165, 67);

  // Line items table
  const tableColumn = ["Product", "Quantity", "Unit Price", "Total"];
  const tableRows: (string|number)[][] = [];

  receipt.lineItems.forEach(item => {
    const row = [
        item.productName,
        item.quantity,
        `${item.price.toFixed(2)} DA`,
        `${(item.price * item.quantity).toFixed(2)} DA`
    ];
    tableRows.push(row);
  });

  (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      headStyles: { fillColor: [22, 163, 74] },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, finalY + 15);
  doc.text(`${receipt.total.toFixed(2)} DA`, 190, finalY + 15, { align: 'right' });
  
  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, finalY + 30, { align: 'center' });

  doc.save(`receipt-${receipt.id}.pdf`);
}
