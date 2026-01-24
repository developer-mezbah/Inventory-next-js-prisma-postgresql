import React, { useCallback, useState, useRef } from 'react'
import TransactionsTable from './TransactionsTable';
import MoveCategoryModal from './MoveCategoryModal';
import { FaFilePdf } from 'react-icons/fa';
import { SiGoogledocs } from 'react-icons/si';
import { toast } from 'react-toastify';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TabContents = ({ subcategory, category, categoryName }) => {
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const { currencySymbol } = useCurrencyStore();
    const reportRef = useRef(null);
    const openMoveModal = useCallback(() => setShowMoveModal(true), []);
    const closeMoveModal = useCallback(() => setShowMoveModal(false), []);

    // Format currency with dynamic symbol
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return `${currencySymbol}0.00`;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace('$', currencySymbol);
    };

    // Calculate total values
    const calculateTotals = () => {
        if (!category?.items || category.items.length === 0) {
            return {
                totalItems: 0,
                totalStockValue: 0,
                totalSaleValue: 0,
                avgProfitMargin: 0,
                lowStockItems: 0
            };
        }
        
        const items = category.items;
        let totalStockValue = 0;
        let totalSaleValue = 0;
        let totalMargin = 0;
        let lowStockItems = 0;
        
        items.forEach(item => {
            const openingQuantity = item.stock?.openingQuantity || 0;
            const purchasePrice = item.purchasePrice || 0;
            const salePrice = item.salePrice || 0;
            const minStock = item.stock?.minStockToMaintain || 0;
            
            totalStockValue += purchasePrice * openingQuantity;
            totalSaleValue += salePrice * openingQuantity;
            
            if (purchasePrice > 0) {
                totalMargin += ((salePrice - purchasePrice) / purchasePrice) * 100;
            }
            
            if (openingQuantity <= minStock) {
                lowStockItems++;
            }
        });
        
        const avgProfitMargin = items.length > 0 ? totalMargin / items.length : 0;
        
        return {
            totalItems: items.length,
            totalStockValue,
            totalSaleValue,
            avgProfitMargin,
            lowStockItems,
            potentialProfit: totalSaleValue - totalStockValue,
            profitRatio: totalStockValue > 0 ? ((totalSaleValue / totalStockValue - 1) * 100) : 0
        };
    };

    // Get subcategory name by ID
    const getSubcategoryName = (subCategoryId) => {
        if (!category?.subcategories) return 'N/A';
        const subcat = category.subcategories.find(sub => sub.id === subCategoryId);
        return subcat?.name?.trim() || 'N/A';
    };

    // Company info
    const companyInfo = {
        name: "EduBooks Inc.",
        address: "123 Education Street, Academic City",
        phone: "+1 (555) 123-4567",
        email: "info@edubooks.com",
        website: "www.edubooks.com",
        taxId: "TAX-EDU-789012",
        footerNote: "Inventory Report • Confidential"
    };

    // Generate HTML content for report
    const generateReportHTML = () => {
        const totals = calculateTotals();
        const now = new Date();
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <title>${categoryName} Inventory Report</title>
                <style>
                    /* Print-specific styles */
                    @media print {
                        * {
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        body {
                            width: 100% !important;
                            margin: 0 auto !important;
                            padding: 10mm !important;
                            font-size: 11pt !important;
                        }
                        
                        table {
                            page-break-inside: auto !important;
                            border-collapse: collapse !important;
                        }
                        
                        tr {
                            page-break-inside: avoid !important;
                            page-break-after: auto !important;
                        }
                        
                        thead {
                            display: table-header-group !important;
                        }
                        
                        tfoot {
                            display: table-footer-group !important;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                    }
                    
                    /* Base styles */
                    * { 
                        box-sizing: border-box; 
                        margin: 0; 
                        padding: 0; 
                    }
                    
                    body { 
                        font-family: 'Inter', 'Roboto', 'Segoe UI', Arial, sans-serif;
                        font-size: 12px; 
                        line-height: 1.4;
                        color: #000000;
                        padding: 20px;
                        background: white;
                        width: 794px; /* A4 width in pixels */
                        margin: 0 auto;
                    }
                    
                    /* Header */
                    .header {
                        text-align: center;
                        margin-bottom: 25px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #3B82F6;
                    }
                    
                    .company-name {
                        color: #3B82F6;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .report-title {
                        font-size: 18px;
                        color: #1e293b;
                        margin: 10px 0;
                        font-weight: 600;
                    }
                    
                    .report-date {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 10px;
                    }
                    
                    /* Summary Grid */
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        margin: 20px 0;
                    }
                    
                    .summary-item {
                        background: #f8fafc;
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 4px solid #3B82F6;
                        text-align: center;
                    }
                    
                    .summary-item:nth-child(2) { border-left-color: #10B981; }
                    .summary-item:nth-child(3) { border-left-color: #F59E0B; }
                    .summary-item:nth-child(4) { border-left-color: #EF4444; }
                    
                    .summary-label {
                        font-size: 11px;
                        color: #666;
                        margin-bottom: 8px;
                        font-weight: 500;
                    }
                    
                    .summary-value {
                        font-size: 18px;
                        font-weight: bold;
                        color: #1e293b;
                    }
                    
                    /* Financial Summary */
                    .financial-summary {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin: 25px 0;
                        background: #f1f5f9;
                        padding: 20px;
                        border-radius: 8px;
                    }
                    
                    .financial-item {
                        text-align: center;
                    }
                    
                    .financial-label {
                        font-size: 11px;
                        color: #64748b;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                    }
                    
                    .financial-value {
                        font-size: 16px;
                        font-weight: bold;
                        color: #1e293b;
                    }
                    
                    .financial-value.profit { color: #059669; }
                    
                    /* Table */
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin: 25px 0 30px 0 !important;
                        font-size: 11px !important;
                        table-layout: fixed !important;
                        word-wrap: break-word !important;
                    }
                    
                    th {
                        background: #3B82F6 !important;
                        color: white !important;
                        padding: 12px 8px !important;
                        text-align: left !important;
                        font-weight: 600 !important;
                        border: 1px solid #2563eb !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    th:last-child {
                        border-right: 1px solid #2563eb !important;
                    }
                    
                    td {
                        padding: 10px 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                    }
                    
                    tr:nth-child(even) {
                        background: #f8fafc !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Status badges */
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 500;
                    }
                    
                    .status-good { 
                    // backgrFound: #d1fae5 !important;
                     color: #059669 !important; }
                    .status-low { 
                    // background: #fee2e2 !important;
                     color: #dc2626 !important; }
                    
                    /* Margin colors */
                    .margin-high { color: #059669 !important; font-weight: 600 !important; }
                    .margin-medium { color: #3B82F6 !important; font-weight: 600 !important; }
                    .margin-low { color: #f59e0b !important; font-weight: 600 !important; }
                    
                    /* Footer */
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #e2e8f0;
                        color: #64748b;
                        font-size: 11px;
                        line-height: 1.4;
                        page-break-inside: avoid;
                    }
                    
                    /* Ensure currency symbols display correctly */
                    .currency-cell {
                        font-family: 'Arial', sans-serif;
                        font-weight: 600;
                        white-space: nowrap;
                    }
                    
                    /* Print margins */
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    
                    @page :first {
                        margin-top: 20mm;
                    }
                </style>
            </head>
            <body>
                <!-- Header -->
                <div class="header">
                    <div class="company-name">${companyInfo.name}</div>
                    <div style="font-size: 12px; color: #666; margin: 5px 0;">
                        ${companyInfo.address} • ${companyInfo.phone} • ${companyInfo.email}
                    </div>
                    <div class="report-title">${categoryName} Inventory Report</div>
                    <div class="report-date">
                        Generated: ${now.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                
                <!-- Summary Grid -->
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Items</div>
                        <div class="summary-value">${totals.totalItems}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Stock Value</div>
                        <div class="summary-value">${formatCurrency(totals.totalStockValue)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Sale Value</div>
                        <div class="summary-value">${formatCurrency(totals.totalSaleValue)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Low Stock Items</div>
                        <div class="summary-value">${totals.lowStockItems}</div>
                    </div>
                </div>
                
                <!-- Financial Summary -->
                <div class="financial-summary">
                    <div class="financial-item">
                        <div class="financial-label">Avg Profit Margin</div>
                        <div class="financial-value profit">${totals.avgProfitMargin.toFixed(2)}%</div>
                    </div>
                    <div class="financial-item">
                        <div class="financial-label">Potential Profit</div>
                        <div class="financial-value profit">${formatCurrency(totals.potentialProfit)}</div>
                    </div>
                    <div class="financial-item">
                        <div class="financial-label">Profit Ratio</div>
                        <div class="financial-value profit">${totals.profitRatio.toFixed(2)}%</div>
                    </div>
                </div>
                
                <!-- Table -->
                <table cellpadding="0" cellspacing="0">
                    <thead>
                        <tr>
                            <th style="width: 20%;">Item Name</th>
                            <th style="width: 15%;">Subcategory</th>
                            <th style="width: 10%;">Stock Qty</th>
                            <th style="width: 10%;">Min Stock</th>
                            <th style="width: 12%;">Purchase Price</th>
                            <th style="width: 12%;">Sale Price</th>
                            <th style="width: 11%;">Profit Margin</th>
                            <th style="width: 10%;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${category?.items && category.items.length > 0 ? 
                            category.items.map(item => {
                                const openingQuantity = item.stock?.openingQuantity || 0;
                                const minStock = item.stock?.minStockToMaintain || 0;
                                const purchasePrice = item.purchasePrice || 0;
                                const salePrice = item.salePrice || 0;
                                const profit = salePrice - purchasePrice;
                                const margin = purchasePrice > 0 ? ((profit / purchasePrice) * 100) : 0;
                                const isLowStock = openingQuantity <= minStock;
                                const marginClass = margin >= 50 ? 'margin-high' : margin >= 20 ? 'margin-medium' : 'margin-low';
                                
                                return `
                                    <tr>
                                        <td style="width: 20%;">${item.itemName || 'N/A'}</td>
                                        <td style="width: 15%;">${getSubcategoryName(item.subCategoryId)}</td>
                                        <td style="width: 10%; text-align: center;">${openingQuantity}</td>
                                        <td style="width: 10%; text-align: center;">${minStock}</td>
                                        <td style="width: 12%;" class="currency-cell">${formatCurrency(purchasePrice)}</td>
                                        <td style="width: 12%;" class="currency-cell">${formatCurrency(salePrice)}</td>
                                        <td style="width: 11%;" class="${marginClass} currency-cell">${margin.toFixed(2)}%</td>
                                        <td style="width: 10%; text-align: center;">
                                            <span class="status-badge ${isLowStock ? 'status-low' : 'status-good'}">
                                                ${isLowStock ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('') 
                            : 
                            '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #666; font-style: italic;">No items found</td></tr>'
                        }
                    </tbody>
                </table>
                
                <!-- Footer -->
                <div class="footer">
                    <div>${companyInfo.footerNote}</div>
                    <div style="margin-top: 8px;">
                        ${companyInfo.address} • ${companyInfo.phone} • ${companyInfo.website}
                    </div>
                    <div style="margin-top: 5px; font-size: 10px; color: #94a3b8;">
                        Report ID: ${categoryName.toUpperCase().replace(/[^A-Z0-9]/g, '')}_${now.getTime()}
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    // Function to create and download PDF using jsPDF and html2canvas
    const handleExportPDF = async () => {
        if (!category?.items || category.items.length === 0) {
            toast.error('No items to export');
            return;
        }

        try {
            setIsGeneratingPDF(true);
            toast.info('Generating PDF... Please wait');
            
            // Create a temporary iframe to render the HTML
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '794px'; // A4 width in pixels
            iframe.style.height = '1123px'; // A4 height in pixels
            iframe.style.left = '-9999px';
            iframe.style.top = '-9999px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            
            // Write HTML content to iframe
            const htmlContent = generateReportHTML();
            iframe.contentDocument.open();
            iframe.contentDocument.write(htmlContent);
            iframe.contentDocument.close();
            
            // Wait for iframe to load
            await new Promise(resolve => {
                iframe.onload = resolve;
                // Fallback timeout
                setTimeout(resolve, 1500);
            });
            
            // Calculate content height
            const contentHeight = iframe.contentDocument.body.scrollHeight;
            const scale = 2;
            
            // Use html2canvas to capture the iframe content
            const canvas = await html2canvas(iframe.contentDocument.body, {
                scale: scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#FFFFFF',
                logging: false,
                width: 794,
                height: contentHeight,
                windowWidth: 794,
                windowHeight: contentHeight,
                onclone: (clonedDoc) => {
                    // Ensure fonts are loaded
                    clonedDoc.body.style.fontFamily = "'Inter', 'Roboto', 'Segoe UI', Arial, sans-serif";
                    clonedDoc.body.style.width = '794px';
                }
            });
            
            // Calculate PDF dimensions (A4)
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            
            // Calculate image dimensions to fit within page margins
            const margin = 10; // 10mm margins on all sides
            const usableWidth = pdfWidth - (2 * margin);
            const usableHeight = pdfHeight - (2 * margin);
            
            const imgWidth = usableWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Create PDF in portrait orientation
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Add content to PDF with proper centering
            let heightLeft = imgHeight;
            let position = 0;
            
            // First page
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                margin, // x position (left margin)
                margin + position, // y position (top margin)
                imgWidth,
                Math.min(imgHeight, usableHeight)
            );
            
            heightLeft -= usableHeight;
            position = -usableHeight;
            
            // Add additional pages if needed
            while (heightLeft > 0) {
                pdf.addPage();
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', 1.0),
                    'JPEG',
                    margin,
                    margin,
                    imgWidth,
                    Math.min(heightLeft, usableHeight)
                );
                heightLeft -= usableHeight;
            }
            
            // Save PDF
            const fileName = `${categoryName.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            // Clean up
            document.body.removeChild(iframe);
            setIsGeneratingPDF(false);
            
            toast.success('PDF downloaded successfully!');
            
        } catch (error) {
            console.error('PDF export error:', error);
            setIsGeneratingPDF(false);
            toast.error(`PDF generation failed: ${error.message}`);
            
            // Fallback to HTML download if PDF generation fails
            toast.info('Trying fallback method...');
            handleExportPDFFallback();
        }
    };

    // Fallback method: Generate HTML and let user print to PDF
    const handleExportPDFFallback = () => {
        try {
            const reportContent = generateReportHTML();
            
            // Create blob and download
            const blob = new Blob([reportContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${categoryName.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf.html`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            toast.info('Downloaded as HTML. Open in browser and use "Print to PDF"');
            
        } catch (error) {
            console.error('Fallback PDF export error:', error);
            toast.error('All export methods failed. Please try again.');
        }
    };

    // Print functionality
    const handlePrint = () => {
        if (!category?.items || category.items.length === 0) {
            toast.error('No items to print');
            return;
        }

        try {
            const printContent = generateReportHTML();
            const printWindow = window.open('', '_blank', 'width=900,height=600,toolbar=0,scrollbars=1,status=0');
            
            if (!printWindow) {
                toast.error('Please allow popups to print the report');
                return;
            }
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Wait for content to load
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                
                // Close window after printing
                printWindow.onafterprint = () => {
                    setTimeout(() => {
                        if (!printWindow.closed) {
                            printWindow.close();
                        }
                    }, 500);
                };
                
                // Fallback close in case onafterprint doesn't fire
                setTimeout(() => {
                    if (!printWindow.closed) {
                        printWindow.close();
                    }
                }, 3000);
                
            }, 500);
            
            toast.info('Opening print dialog...');
            
        } catch (error) {
            console.error('Print error:', error);
            toast.error(`Print failed: ${error.message}`);
        }
    };

    return (
        <div className="font-inter antialiased">
            {/* Main Card Container */}
            <div className="w-full bg-white border border-gray-300 rounded-xl shadow-md">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex justify-between items-center">
                        {/* Title */}
                        <div className="flex items-center text-lg font-semibold text-gray-800">
                            <span className="mr-1">{categoryName || 'Category Name'}</span>
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({category?.items ? category.items.length : 0} items)
                            </span>
                        </div>

                        {/* Export Actions */}
                        <div className="flex space-x-2 items-center">
                            {/* Print */}
                            <button
                                onClick={handlePrint}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-blue-50 rounded-lg transition-all duration-200 ease-in-out border border-gray-200 hover:border-blue-300 bg-white"
                                title="Print Report"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {/* PDF */}
                            <button
                                onClick={handleExportPDF}
                                disabled={isGeneratingPDF}
                                className={`p-2 rounded-lg transition-all duration-200 ease-in-out border bg-white flex items-center space-x-1 ${
                                    isGeneratingPDF 
                                        ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                                        : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300'
                                }`}
                                title={isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}
                            >
                                <FaFilePdf className="h-5 w-5" />
                                <span className="text-sm">
                                    {isGeneratingPDF ? 'Generating...' : 'PDF'}
                                </span>
                            </button>
                          

                            {/* Separator */}
                            <div className="h-6 w-px bg-gray-300 mx-1"></div>

                            {/* Move To This Category button */}
                            <button
                                onClick={openMoveModal} 
                                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
                            >
                                Move To This Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-md font-semibold text-gray-500">
                            Items Summary
                        </div>
                        <div className="text-sm text-gray-500">
                            <span className="font-bold">{currencySymbol}</span> Currency
                        </div>
                    </div>
                    
                    {/* Compact summary display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="text-xs text-gray-500 mb-1">Total Items</div>
                            <div className="text-lg font-bold text-gray-800">
                                {category?.items ? category.items.length : 0}
                            </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="text-xs text-gray-500 mb-1">Stock Value</div>
                            <div className="text-lg font-bold text-gray-800">
                                {formatCurrency(category?.items ? 
                                    category.items.reduce((sum, item) => 
                                        sum + ((item.purchasePrice || 0) * (item.stock?.openingQuantity || 0)), 0) 
                                    : 0)}
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <div className="text-xs text-gray-500 mb-1">Sale Value</div>
                            <div className="text-lg font-bold text-gray-800">
                                {formatCurrency(category?.items ? 
                                    category.items.reduce((sum, item) => 
                                        sum + ((item.salePrice || 0) * (item.stock?.openingQuantity || 0)), 0) 
                                    : 0)}
                            </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="text-xs text-gray-500 mb-1">Low Stock</div>
                            <div className="text-lg font-bold text-gray-800">
                                {category?.items ? 
                                    category.items.filter(item => 
                                        (item.stock?.openingQuantity || 0) <= (item.stock?.minStockToMaintain || 0)
                                    ).length 
                                    : 0}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-0.5 bg-gray-200 border-t border-b border-gray-300"></div>
                <TransactionsTable data={category?.items || []} subcategory={subcategory} />
            </div>

            <MoveCategoryModal isOpen={showMoveModal} onClose={closeMoveModal} />
        </div>
    )
}

export default TabContents;