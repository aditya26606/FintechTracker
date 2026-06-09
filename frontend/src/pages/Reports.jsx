import React, { useState } from 'react';
import apiRequest from '../api';
import { useToast } from '../context/ToastContext';
import { jsPDF } from 'jspdf';
import CustomSelect from '../components/CustomSelect';
import ExcelJS from 'exceljs';

const reportTypeOptions = [
  { value: 'daily', label: 'Daily Statement', icon: '📅' },
  { value: 'weekly', label: 'Weekly Statement', icon: '📆' },
  { value: 'monthly', label: 'Monthly Statement', icon: '📊' },
  { value: 'yearly', label: 'Yearly Statement', icon: '📈' }
];
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  TrendingUp, 
  Loader, 
  Info,
  DollarSign
} from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const toast = useToast();

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/reports?type=${reportType}`);
      setReportData(data);
      toast.showToast(`${data.title} generated successfully!`, 'success');
    } catch (err) {
      toast.showToast('Failed to compile report summaries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const handleExportCSV = () => {
    if (!reportData || reportData.transactions.length === 0) return;

    const headers = ['Index', 'Date', 'Category', 'Description', 'Amount (INR)'];
    const rows = reportData.transactions.map((t, idx) => [
      idx + 1,
      new Date(t.date).toLocaleDateString(),
      t.category,
      t.description || 'None',
      t.amount
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fintech-report-${reportType}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.showToast('CSV report downloaded.', 'success');
  };

  
  const handleExportExcel = async () => {
    if (!reportData) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ledger Report');

      
      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'FintechTracker Ledger Report';
      titleCell.font = { name: 'Outfit', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0B0F19' } 
      };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 35;

      
      worksheet.mergeCells('A2:E2');
      const subtitleCell = worksheet.getCell('A2');
      const startDateStr = new Date(reportData.period.start).toLocaleDateString();
      const endDateStr = new Date(reportData.period.end).toLocaleDateString();
      const generatedStr = new Date().toLocaleString();
      subtitleCell.value = `Period: ${startDateStr} to ${endDateStr}  |  Generated: ${generatedStr}`;
      subtitleCell.font = { name: 'Outfit', size: 10, italic: true, color: { argb: 'FF94A3B8' } };
      subtitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0B0F19' }
      };
      subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(2).height = 24;

      
      worksheet.addRow([]);

      
      worksheet.addRow(['FINANCIAL SUMMARY']).font = { name: 'Outfit', size: 11, bold: true, color: { argb: 'FF38BDF8' } };
      
      const summaryStartRow = worksheet.lastRow.number + 1;
      worksheet.addRow(['Metric', 'Value']);
      worksheet.addRow(['Total Spent', reportData.summary.totalSpent]);
      worksheet.addRow(['Transaction Count', reportData.summary.transactionCount]);
      worksheet.addRow(['Average Transaction Size', reportData.summary.averageTransaction]);
      const summaryEndRow = worksheet.lastRow.number;

      
      const headerRow = worksheet.getRow(summaryStartRow);
      headerRow.font = { name: 'Outfit', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.eachCell(c => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      headerRow.height = 20;

      for (let r = summaryStartRow + 1; r <= summaryEndRow; r++) {
        const row = worksheet.getRow(r);
        row.font = { name: 'Outfit', size: 9 };
        row.getCell(1).font = { bold: true };
        row.height = 18;
        
        
        if (r === summaryStartRow + 1 || r === summaryStartRow + 3) {
          const cell = row.getCell(2);
          cell.numFmt = '₹#,##0.00';
          cell.alignment = { horizontal: 'right' };
        } else {
          row.getCell(2).alignment = { horizontal: 'right' };
        }
        
        
        row.eachCell(c => {
          c.border = {
            top: { style: 'thin', color: { argb: 'FF334155' } },
            bottom: { style: 'thin', color: { argb: 'FF334155' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } }
          };
        });
      }

      worksheet.addRow([]); 

      
      worksheet.addRow(['CATEGORY BREAKDOWN']).font = { name: 'Outfit', size: 11, bold: true, color: { argb: 'FF38BDF8' } };
      const catStartRow = worksheet.lastRow.number + 1;
      worksheet.addRow(['Category', 'Spent Amount']);
      
      Object.entries(reportData.categoryBreakdown).forEach(([cat, val]) => {
        worksheet.addRow([cat, val]);
      });
      const catEndRow = worksheet.lastRow.number;

      
      const catHeaderRow = worksheet.getRow(catStartRow);
      catHeaderRow.font = { name: 'Outfit', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      catHeaderRow.eachCell(c => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      catHeaderRow.height = 20;

      for (let r = catStartRow + 1; r <= catEndRow; r++) {
        const row = worksheet.getRow(r);
        row.font = { name: 'Outfit', size: 9 };
        row.height = 18;
        const valCell = row.getCell(2);
        valCell.numFmt = '₹#,##0.00';
        valCell.alignment = { horizontal: 'right' };
        
        row.eachCell(c => {
          c.border = {
            top: { style: 'thin', color: { argb: 'FF334155' } },
            bottom: { style: 'thin', color: { argb: 'FF334155' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } }
          };
        });
      }

      worksheet.addRow([]); 

      
      worksheet.addRow(['DETAILED TRANSACTION LOGS']).font = { name: 'Outfit', size: 11, bold: true, color: { argb: 'FF38BDF8' } };
      const txStartRow = worksheet.lastRow.number + 1;
      
      worksheet.addRow(['Index', 'Date', 'Category', 'Description', 'Amount']);
      
      reportData.transactions.forEach((t, idx) => {
        worksheet.addRow([
          idx + 1,
          new Date(t.date).toLocaleDateString(),
          t.category,
          t.description || '-',
          t.amount
        ]);
      });
      const txEndRow = worksheet.lastRow.number;

      
      const txHeaderRow = worksheet.getRow(txStartRow);
      txHeaderRow.font = { name: 'Outfit', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      txHeaderRow.eachCell(c => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      txHeaderRow.height = 20;

      for (let r = txStartRow + 1; r <= txEndRow; r++) {
        const row = worksheet.getRow(r);
        row.font = { name: 'Outfit', size: 9 };
        row.height = 18;
        
        row.getCell(1).alignment = { horizontal: 'center' };
        row.getCell(2).alignment = { horizontal: 'center' };
        row.getCell(3).alignment = { horizontal: 'center' };
        
        const amtCell = row.getCell(5);
        amtCell.numFmt = '₹#,##0.00';
        amtCell.alignment = { horizontal: 'right' };
        
        row.eachCell(c => {
          c.border = {
            top: { style: 'thin', color: { argb: 'FF334155' } },
            bottom: { style: 'thin', color: { argb: 'FF334155' } },
            left: { style: 'thin', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: 'FF334155' } }
          };
        });
      }

      
      worksheet.autoFilter = {
        from: { row: txStartRow, column: 1 },
        to: { row: txEndRow, column: 5 }
      };

      
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: txStartRow, topLeftCell: `A${txStartRow + 1}`, activeCell: 'A1' }
      ];

      
      worksheet.columns.forEach(col => {
        let maxLen = 12;
        col.eachCell({ includeEmpty: false }, (cell) => {
          if (cell.value) {
            const cellStr = cell.value.toString();
            if (cellStr.length > maxLen) {
              maxLen = cellStr.length;
            }
          }
        });
        col.width = Math.min(maxLen + 4, 40); 
      });

      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `fintech-ledger-report-${reportType}-${Date.now()}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      toast.showToast('Professional Excel report generated and downloaded.', 'success');

    } catch (err) {
      console.error(err);
      toast.showToast('Error producing Excel file.', 'error');
    }
  };

  
  const handleExportPDF = () => {
    if (!reportData) return;

    try {
      const doc = new jsPDF();
      
      
      doc.setFillColor(9, 13, 22); 
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('FintechTracker Ledger Report', 15, 25);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Period: ${new Date(reportData.period.start).toLocaleDateString()} to ${new Date(reportData.period.end).toLocaleDateString()}`, 15, 33);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 33);

      
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Financial Summary', 15, 55);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Total Spent: Rs. ${reportData.summary.totalSpent.toLocaleString()}`, 15, 65);
      doc.text(`Transactions count: ${reportData.summary.transactionCount}`, 15, 72);
      doc.text(`Average Transaction size: Rs. ${reportData.summary.averageTransaction.toLocaleString()}`, 15, 79);

      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Category-wise Breakdown', 120, 55);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      let catY = 65;
      Object.entries(reportData.categoryBreakdown).forEach(([cat, val]) => {
        doc.text(`${cat}: Rs. ${val.toLocaleString()}`, 120, catY);
        catY += 7;
      });

      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Detailed Transaction Logs', 15, 120);

      doc.setFontSize(9);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, 128, 180, 8, 'F');
      doc.text('Date', 17, 133);
      doc.text('Category', 50, 133);
      doc.text('Description', 90, 133);
      doc.text('Amount (Rs)', 170, 133);

      doc.setFont('Helvetica', 'normal');
      let tableY = 142;
      reportData.transactions.forEach((t, idx) => {
        if (tableY > 280) {
          doc.addPage();
          tableY = 20;
        }
        
        doc.text(new Date(t.date).toLocaleDateString(), 17, tableY);
        doc.text(t.category, 50, tableY);
        doc.text(t.description ? t.description.substring(0, 35) : '-', 90, tableY);
        doc.text(t.amount.toLocaleString(undefined, {minimumFractionDigits: 2}), 170, tableY);
        tableY += 8;
      });

      doc.save(`fintech-report-${reportType}-${Date.now()}.pdf`);
      toast.showToast('PDF report generated and downloaded.', 'success');
    } catch (err) {
      toast.showToast('Error producing PDF printout.', 'error');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      
      <div className="p-6 glass-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neonBlue/10 text-neonBlue border border-neonBlue/15 rounded-xl">
            <FileText size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Report Generation Panel</h4>
            <p className="text-xs text-textSecondary">Select a period interval to build expense statements.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <CustomSelect
            value={reportType}
            onChange={setReportType}
            options={reportTypeOptions}
            className="w-full sm:w-48"
          />

          <button 
            onClick={handleGenerateReport} 
            disabled={loading}
            className="glass-btn-primary py-2.5 px-5 text-sm flex-grow sm:flex-grow-0"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={16} />
                <span>Compiling...</span>
              </>
            ) : (
              <span>Compile Statement</span>
            )}
          </button>
        </div>
      </div>

      
      {reportData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          
          <div className="space-y-6 lg:col-span-1">
            <div className="glass-card p-6 space-y-4">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-glassBorder pb-3">
                Ledger Summaries
              </h4>
              
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textSecondary">Total Expenses:</span>
                  <span className="font-extrabold text-neonRose">₹{reportData.summary.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textSecondary">Total Transactions:</span>
                  <span className="font-bold text-textPrimary">{reportData.summary.transactionCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textSecondary">Avg. Size:</span>
                  <span className="font-bold text-neonBlue">₹{reportData.summary.averageTransaction.toLocaleString()}</span>
                </div>
              </div>

              
              <div className="pt-4 border-t border-glassBorder/40 space-y-3">
                <button 
                  onClick={handleExportPDF}
                  className="w-full glass-btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download PDF Report</span>
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="w-full glass-btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet size={14} />
                  <span>Download Excel Report</span>
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="w-full text-textSecondary hover:text-textPrimary text-[10px] font-bold text-center block w-full hover:underline pt-1 cursor-pointer"
                >
                  Download Raw CSV Data
                </button>
              </div>
            </div>

            
            <div className="glass-card p-6 space-y-4">
              <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-glassBorder pb-3">
                Category Spending
              </h4>
              
              <div className="space-y-3 pt-1">
                {Object.entries(reportData.categoryBreakdown).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between items-center text-xs">
                    <span className="text-textSecondary font-semibold">{cat}</span>
                    <span className="font-bold text-textPrimary">₹{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div className="glass-card p-6 lg:col-span-2 space-y-4 overflow-hidden">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-glassBorder pb-3">
              Included Transactions ({reportData.transactions.length})
            </h4>

            <div className="max-h-96 overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glassBorder/40 text-textSecondary uppercase tracking-widest font-semibold pb-2">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glassBorder/20 text-xs">
                  {reportData.transactions.length > 0 ? (
                    reportData.transactions.map(t => (
                      <tr key={t._id || t.id} className="hover:bg-slate-900/10">
                        <td className="py-2.5 pr-4 text-textSecondary">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-textMuted border border-glassBorder">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 truncate max-w-[200px] text-textPrimary">
                          {t.description || '-'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-neonRose">
                          ₹{t.amount.toLocaleString(undefined, {minimumFractionDigits:2})}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-textMuted italic">
                        No transactions found during this report duration window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-card p-12 text-center text-textMuted italic flex flex-col items-center justify-center gap-3">
          <Info size={32} className="text-textMuted" />
          <p className="text-xs">Click the "Compile Statement" button above to view reports statistics.</p>
        </div>
      )}

    </div>
  );
};

export default Reports;
