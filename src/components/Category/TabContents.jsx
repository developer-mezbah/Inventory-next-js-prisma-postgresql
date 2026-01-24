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
                    /* Embed fonts */
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
                    
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
                        width: 100%;
                        border-collapse: collapse;
                        margin: 25px 0 30px 0;
                        font-size: 11px;
                    }
                    
                    th {
                        background: #3B82F6;
                        color: white;
                        padding: 12px 8px;
                        text-align: left;
                        font-weight: 600;
                        border-right: 1px solid #2563eb;
                    }
                    
                    th:last-child {
                        border-right: none;
                    }
                    
                    td {
                        padding: 10px 8px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    tr:nth-child(even) {
                        background: #f8fafc;
                    }
                    
                    /* Status badges */
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 500;
                    }
                    
                    .status-good { background: #d1fae5; color: #059669; }
                    .status-low { background: #fee2e2; color: #dc2626; }
                    
                    /* Margin colors */
                    .margin-high { color: #059669; font-weight: 600; }
                    .margin-medium { color: #3B82F6; font-weight: 600; }
                    .margin-low { color: #f59e0b; font-weight: 600; }
                    
                    /* Footer */
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #e2e8f0;
                        color: #64748b;
                        font-size: 11px;
                        line-height: 1.4;
                    }
                    
                    /* Ensure currency symbols display correctly */
                    .currency-cell {
                        font-family: 'Arial', sans-serif;
                        font-weight: 600;
                        white-space: nowrap;
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
                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Subcategory</th>
                            <th>Stock Qty</th>
                            <th>Min Stock</th>
                            <th>Purchase Price</th>
                            <th>Sale Price</th>
                            <th>Profit Margin</th>
                            <th>Status</th>
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
                                        <td>${item.itemName || 'N/A'}</td>
                                        <td>${getSubcategoryName(item.subCategoryId)}</td>
                                        <td>${openingQuantity}</td>
                                        <td>${minStock}</td>
                                        <td class="currency-cell">${formatCurrency(purchasePrice)}</td>
                                        <td class="currency-cell">${formatCurrency(salePrice)}</td>
                                        <td class="${marginClass} currency-cell">${margin.toFixed(2)}%</td>
                                        <td>
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
                setTimeout(resolve, 1000);
            });
            
            // Use html2canvas to capture the iframe content
            const canvas = await html2canvas(iframe.contentDocument.body, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#FFFFFF',
                logging: false,
                width: 794,
                height: iframe.contentDocument.body.scrollHeight,
                windowWidth: 794,
                windowHeight: iframe.contentDocument.body.scrollHeight,
                onclone: (clonedDoc) => {
                    // Ensure fonts are loaded
                    clonedDoc.body.style.fontFamily = "'Inter', 'Roboto', 'Segoe UI', Arial, sans-serif";
                }
            });
            
            // Calculate PDF dimensions (A4)
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const imgWidth = pdfWidth - 20; // Account for margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Create PDF
            const pdf = new jsPDF({
                orientation: imgHeight > pdfHeight ? 'portrait' : 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            let position = 10;
            let remainingHeight = imgHeight;
            
            while (remainingHeight > 0) {
                // Add image to PDF
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', 1.0),
                    'JPEG',
                    10, // x position
                    position, // y position
                    imgWidth,
                    Math.min(remainingHeight, pdfHeight - 20)
                );
                
                remainingHeight -= (pdfHeight - 20);
                position = 10; // Reset position for next page
                
                if (remainingHeight > 0) {
                    pdf.addPage();
                }
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

    // Function to download as Office-compatible DOC
    const handleExportDocs = () => {
        if (!category?.items || category.items.length === 0) {
            toast.error('No items to export');
            return;
        }

        try {
            // Generate Office-compatible HTML
            const totals = calculateTotals();
            const now = new Date();
            
            const officeHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${categoryName} Inventory Report</title>
                    <style>
                        body {
                            font-family: 'Calibri', 'Arial', sans-serif;
                            font-size: 11pt;
                            color: #000000;
                            margin: 20px;
                        }
                        .header {
                            border-bottom: 3px solid #2E74B5;
                            padding-bottom: 15px;
                            margin-bottom: 25px;
                        }
                        .company-name {
                            color: #2E74B5;
                            font-size: 24pt;
                            font-weight: bold;
                        }
                        .report-title {
                            color: #2E74B5;
                            font-size: 18pt;
                            font-weight: bold;
                            margin: 15px 0;
                        }
                        .summary-grid {
                            display: table;
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        .summary-row {
                            display: table-row;
                        }
                        .summary-cell {
                            display: table-cell;
                            padding: 15px;
                            border: 1px solid #95B3D7;
                            text-align: center;
                            background: #DAEEF3;
                            font-weight: bold;
                        }
                        table.data-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            border: 2px solid #366092;
                        }
                        table.data-table th {
                            background: #366092;
                            color: white;
                            padding: 12px;
                            font-weight: bold;
                            border: 1px solid #95B3D7;
                        }
                        table.data-table td {
                            padding: 10px;
                            border: 1px solid #95B3D7;
                        }
                        .currency {
                            font-family: 'Cambria', 'Times New Roman', serif;
                        }
                        .footer {
                            font-size: 10pt;
                            color: #7F7F7F;
                            margin-top: 30px;
                            padding-top: 15px;
                            border-top: 2px solid #CCC;
                        }
                        .low-stock {
                            background-color: #FFF2CC;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-name">${companyInfo.name}</div>
                        <div style="font-size: 11pt; color: #666; margin: 10px 0;">
                            ${companyInfo.address}<br>
                            Phone: ${companyInfo.phone} | Email: ${companyInfo.email}
                        </div>
                        <div class="report-title">${categoryName} Inventory Report</div>
                        <div style="font-size: 11pt; color: #666;">
                            Generated: ${now.toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    
                    <!-- Summary -->
                    <div class="summary-grid">
                        <div class="summary-row">
                            <div class="summary-cell">Total Items: ${totals.totalItems}</div>
                            <div class="summary-cell">Stock Value: ${formatCurrency(totals.totalStockValue)}</div>
                            <div class="summary-cell">Sale Value: ${formatCurrency(totals.totalSaleValue)}</div>
                            <div class="summary-cell">Low Stock Items: ${totals.lowStockItems}</div>
                        </div>
                    </div>
                    
                    <!-- Financial Summary -->
                    <div style="background: #F2F2F2; padding: 15px; margin: 20px 0; border: 1px solid #D9D9D9;">
                        <div style="font-weight: bold; margin-bottom: 10px; color: #2E74B5;">Financial Summary</div>
                        <div style="display: table; width: 100%;">
                            <div style="display: table-row;">
                                <div style="display: table-cell; padding: 10px; text-align: center;">
                                    <div style="font-size: 10pt; color: #666;">Avg Profit Margin</div>
                                    <div style="font-size: 14pt; font-weight: bold; color: #059669;">${totals.avgProfitMargin.toFixed(2)}%</div>
                                </div>
                                <div style="display: table-cell; padding: 10px; text-align: center;">
                                    <div style="font-size: 10pt; color: #666;">Potential Profit</div>
                                    <div style="font-size: 14pt; font-weight: bold; color: #059669;">${formatCurrency(totals.potentialProfit)}</div>
                                </div>
                                <div style="display: table-cell; padding: 10px; text-align: center;">
                                    <div style="font-size: 10pt; color: #666;">Profit Ratio</div>
                                    <div style="font-size: 14pt; font-weight: bold; color: #059669;">${totals.profitRatio.toFixed(2)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Data Table -->
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Subcategory</th>
                                <th>Stock Qty</th>
                                <th>Min Stock</th>
                                <th>Purchase Price</th>
                                <th>Sale Price</th>
                                <th>Profit Margin</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${category?.items && category.items.length > 0 ? 
                                category.items.map(item => {
                                    const openingQuantity = item.stock?.openingQuantity || 0;
                                    const minStock = item.stock?.minStockToMaintain || 0;
                                    const purchasePrice = item.purchasePrice || 0;
                                    const salePrice = item.salePrice || 0;
                                    const margin = purchasePrice > 0 ? (((salePrice - purchasePrice) / purchasePrice) * 100) : 0;
                                    const isLowStock = openingQuantity <= minStock;
                                    
                                    return `
                                        <tr ${isLowStock ? 'class="low-stock"' : ''}>
                                            <td>${item.itemName || 'N/A'}</td>
                                            <td>${getSubcategoryName(item.subCategoryId)}</td>
                                            <td>${openingQuantity}</td>
                                            <td>${minStock}</td>
                                            <td class="currency">${formatCurrency(purchasePrice)}</td>
                                            <td class="currency">${formatCurrency(salePrice)}</td>
                                            <td class="currency">${margin.toFixed(2)}%</td>
                                            <td>${isLowStock ? '<strong>LOW STOCK</strong>' : 'In Stock'}</td>
                                        </tr>
                                    `;
                                }).join('') 
                                : 
                                '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #666; font-style: italic;">No inventory items found</td></tr>'
                            }
                        </tbody>
                    </table>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div><strong>${companyInfo.footerNote}</strong></div>
                        <div style="margin-top: 10px;">
                            ${companyInfo.address} | ${companyInfo.phone} | ${companyInfo.website}
                        </div>
                        <div style="margin-top: 5px; font-size: 9pt;">
                            Report ID: ${categoryName.toUpperCase().replace(/[^A-Z0-9]/g, '')}_${now.getTime()}
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            // Create blob with proper MIME type for Word
            const blob = new Blob(['\ufeff', officeHTML], { 
                type: 'application/msword;charset=utf-8' 
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${categoryName.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date().toISOString().split('T')[0]}.doc`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            toast.success('DOC file downloaded! Compatible with Microsoft Office.');
            
        } catch (error) {
            console.error('DOCS export error:', error);
            toast.error(`DOC generation failed: ${error.message}`);
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
            const printWindow = window.open('', '_blank', 'width=900,height=600');
            
            if (!printWindow) {
                toast.error('Please allow popups to print the report');
                return;
            }
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = () => {
                    setTimeout(() => printWindow.close(), 1000);
                };
            }, 300);
            
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
                            
                            {/* Docs */}
                            <button
                                onClick={handleExportDocs}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 ease-in-out border border-blue-200 hover:border-blue-300 bg-white flex items-center space-x-1"
                                title="Download as DOC"
                            >
                               <SiGoogledocs className="h-5 w-5" />
                               <span className="text-sm">DOC</span>
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