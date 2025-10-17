// ייצוא תוצאות לExcel ו-PDF - גרסה מתוקנת
class DataExporter {
    constructor(calculator) {
        this.calculator = calculator;
    }

    // ייצוא לExcel
    exportToExcel(results) {
        try {
            if (!results || !results.monthlyData) {
                throw new Error('אין נתונים לייצוא');
            }



            // יצירת Workbook חדש
            const wb = XLSX.utils.book_new();

            // סיכום תוצאות
            const summaryData = this.prepareSummaryData(results);
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'סיכום תוצאות');

            // נתונים חודשיים
            const monthlyData = this.prepareMonthlyData(results.monthlyData);
            const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
            XLSX.utils.book_append_sheet(wb, monthlyWs, 'נתונים חודשיים');

            // ניתוח מיסוי
            const taxAnalysis = this.prepareTaxAnalysis(results);
            const taxWs = XLSX.utils.json_to_sheet(taxAnalysis);
            XLSX.utils.book_append_sheet(wb, taxWs, 'ניתוח מיסוי');

            // שמירה
            const fileName = `מחשבון_אנונה_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            return { success: true, fileName: fileName };

        } catch (error) {
            console.error('שגיאה בייצוא Excel:', error);
            return { success: false, error: error.message };
        }
    }

    // ייצוא ל-PDF בעברית אמיתית באמצעות HTML2Canvas
    async exportToPDF(results) {
        try {
            console.log('Starting Hebrew PDF export...');
            
            if (!window.html2canvas) {
                console.error('html2canvas not loaded, using English fallback');
                return this.exportToPDFEnglish(results);
            }
            
            return await this.exportHebrewPDF(results);
            
        } catch (error) {
            console.error('Hebrew PDF failed, using English fallback:', error);
            return this.exportToPDFEnglish(results);
        }
    }

    // יצירת דוח בעברית אמיתית
    async exportHebrewPDF(results) {
        try {
            // יצירת HTML עברי זמני
            const htmlContent = this.createHebrewHTML(results);
            
            // יצירת div זמני מחוץ למסך
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '210mm';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.fontFamily = 'Arial, sans-serif';
            tempDiv.style.fontSize = '12px';
            tempDiv.style.lineHeight = '1.4';
            tempDiv.style.padding = '20px';
            tempDiv.innerHTML = htmlContent;
            
            document.body.appendChild(tempDiv);
            
            // צילום מסך באמצעות html2canvas
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            // הסרת הdiv הזמני
            document.body.removeChild(tempDiv);
            
            // המרה ל-PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            
            // שמירה
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `דוח_קצבה_${dateStr}.pdf`;
            doc.save(fileName);
            
            return { success: true, fileName: fileName };
            
        } catch (error) {
            console.error('Hebrew PDF creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // יצירת תוכן HTML בעברית
    createHebrewHTML(results) {
        const formatNum = (num) => {
            if (!num || isNaN(num)) return '0';
            return new Intl.NumberFormat('he-IL').format(parseFloat(num));
        };

        const formatNumWithDecimals = (num) => {
            if (!num || isNaN(num)) return '0.00';
            return new Intl.NumberFormat('he-IL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(parseFloat(num));
        };

        const now = new Date();
        
        let html = '';
        
        // תחילת המבנה
        html += '<div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">';
        
        // כותרת עליונה
        html += '<div style="text-align: center; margin-bottom: 20px;">';
        html += '<h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #2c3e50;">דוח אנונה מקצועי</h1>';
        html += '<p style="font-size: 12px; color: #666; margin: 3px 0;">תאריך הדוח: ' + now.toLocaleDateString('he-IL') + '</p>';
        html += '<p style="font-size: 14px; font-weight: 600; color: #1e40af; margin: 8px 0;">רועי רומנו - מתכנן פיננסי</p>';
        html += '</div>';

        // נתוני השקעה
        html += '<div style="margin-bottom: 15px;">';
        html += '<h2 style="font-size: 14px; font-weight: bold; color: #34495e; border-bottom: 1px solid #3498db; padding-bottom: 3px;">נתוני השקעה</h2>';
        html += '<div style="margin: 8px 0; line-height: 1.4; font-size: 11px;">';
        html += '<p><strong>השקעה התחלתית:</strong> ' + formatNum(results.summary?.initialAmount) + ' ₪</p>';
        html += '<p><strong>תשואה שנתית:</strong> ' + (parseFloat(results.parameters?.annualReturn || 0) * 100).toFixed(2) + '%</p>';
        html += '<p><strong>דמי ניהול שנתיים:</strong> ' + (parseFloat(results.parameters?.annualFee || 0) * 100).toFixed(2) + '%</p>';
        html += '<p><strong>משיכה חודשית:</strong> ' + formatNum(results.parameters?.withdrawalAmount) + ' ₪</p>';
        html += '<p><strong>שיטת משיכה:</strong> ' + (results.parameters?.withdrawalMethod === 'gross' ? 'ברוטו (לפני מס)' : 'נטו (אחרי מס)') + '</p>';
        html += '<p><strong>סוג מס:</strong> ' + (results.parameters?.taxType === 'real' ? 'מס ריאלי (25%)' : 'מס נומינלי (15%)') + '</p>';
        html += '<p><strong>אינפלציה שנתית:</strong> ' + (parseFloat(results.parameters?.annualInflation || 0) * 100).toFixed(2) + '%</p>';
        html += '<p><strong>סך חודשים:</strong> ' + results.summary?.actualMonths + '</p>';
        html += '</div>';
        html += '</div>';

        // תוצאות סיכום
        html += '<div style="margin-bottom: 15px;">';
        html += '<h2 style="font-size: 14px; font-weight: bold; color: #34495e; border-bottom: 1px solid #e74c3c; padding-bottom: 3px;">תוצאות סיכום</h2>';
        html += '<div style="margin: 8px 0; line-height: 1.4; font-size: 11px;">';
        html += '<p><strong>סה"כ נמשך ברוטו:</strong> ' + formatNum(results.summary?.totalWithdrawn) + ' ₪</p>';
        html += '<p><strong>סה"כ מס ששולם:</strong> ' + formatNum(results.summary?.totalTax) + ' ₪</p>';
        html += '<p><strong>סה"כ התקבל נטו:</strong> ' + formatNum(results.summary?.totalNet) + ' ₪</p>';
        html += '<p><strong>יתרה סופית:</strong> ' + formatNum(results.summary?.finalBalance) + ' ₪</p>';
        html += '<p><strong>יעילות המשיכה:</strong> ' + ((results.summary?.totalNet / results.summary?.initialAmount) * 100).toFixed(2) + '%</p>';
        html += '<p><strong>שיעור מס ממוצע:</strong> ' + ((results.summary?.totalTax / results.summary?.totalWithdrawn) * 100).toFixed(2) + '%</p>';
        html += '</div>';
        html += '</div>';

        // ניתוח משיכה מקסימלית
        const maxMonthlyApprox = Math.round(results.summary?.initialAmount * 0.004);
        html += '<div style="margin-bottom: 15px;">';
        html += '<h2 style="font-size: 14px; font-weight: bold; color: #34495e; border-bottom: 1px solid #f39c12; padding-bottom: 3px;">ניתוח משיכה מקסימלית</h2>';
        html += '<div style="margin: 8px 0; line-height: 1.4; font-size: 11px;">';
        html += '<p><strong>משיכה חודשית נוכחית:</strong> ' + formatNum(results.parameters?.withdrawalAmount) + ' ₪</p>';
        html += '<p><strong>משיכה מקסימלית מוערכת:</strong> ~' + formatNum(maxMonthlyApprox) + ' ₪/חודש</p>';
        html += '<p><strong>יחס נוכחי למקסימום:</strong> ' + ((parseFloat(results.parameters?.withdrawalAmount) / maxMonthlyApprox) * 100).toFixed(1) + '%</p>';
        html += '<p><strong>תקופת המשיכה:</strong> ' + results.summary?.actualMonths + ' חודשים (' + (results.summary?.actualMonths / 12).toFixed(1) + ' שנים)</p>';
        html += '</div>';
        html += '</div>';

        // טבלה חודשית (12 חודשים ראשונים)
        if (results.monthlyData && results.monthlyData.length > 0) {
            const displayMonths = Math.min(12, results.monthlyData.length);
            
            html += '<div style="margin-bottom: 20px;">';
            html += '<h2 style="font-size: 16px; font-weight: bold; color: #34495e; border-bottom: 2px solid #9b59b6; padding-bottom: 5px;">פירוט חודשי (12 חודשים ראשונים)</h2>';
            html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px;">';
            html += '<thead>';
            html += '<tr style="background-color: #f8f9fa;">';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">חודש</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">יתרה התחלתית</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">תשואה</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">דמי ניהול</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">משיכה ברוטו</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">מס</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">משיכה נטו</th>';
            html += '<th style="border: 1px solid #ddd; padding: 4px; text-align: center;">יתרה סופית</th>';
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
            
            for (let i = 0; i < displayMonths; i++) {
                const row = results.monthlyData[i];
                html += '<tr>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: center;">' + (i + 1) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.startBalance || 0) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.returnAmount || 0) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.managementFee || 0) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.actualWithdrawal || 0) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.tax || 0) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.netWithdrawal || 0) + '</td>';
                html += '<td style="border: 1px solid #ddd; padding: 3px; text-align: left;">' + formatNumWithDecimals(row.endBalance || 0) + '</td>';
                html += '</tr>';
            }
            
            html += '</tbody>';
            html += '</table>';
            html += '</div>';
        }

        // הערות חשובות
        html += '<div style="margin-top: 15px; padding-top: 8px; border-top: 1px solid #ddd;">';
        html += '<h3 style="font-size: 11px; font-weight: bold; color: #34495e;">הערות חשובות:</h3>';
        html += '<ul style="font-size: 9px; color: #666; line-height: 1.2; margin: 5px 0; padding-right: 15px;">';
        html += '<li>החישובים מבוססים על נוסחאות פיננסיות מדויקות</li>';
        html += '<li>חישובי המס לפי תקנות מס הכנסה הישראליות</li>';
        html += '<li>התוצאות הן תחזית ונתונות לביצועי שוק בפועל</li>';
        html += '<li><strong>כתב ויתור:</strong> הניתוח הינו למטרות מידע בלבד ואינו מהווה ייעוץ השקעות</li>';
        html += '</ul>';
        html += '</div>';

        // פרטים ליצירת קשר - תחתית העמוד
        html += '<div style="margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #27ae60;">';
        html += '<h3 style="font-size: 12px; font-weight: bold; color: #27ae60; text-align: center; margin-bottom: 8px;">פרטים ליצירת קשר</h3>';
        html += '<div style="text-align: center; line-height: 1.4; color: #2c3e50;">';
        html += '<p style="font-size: 11px; font-weight: 600; margin: 4px 0;">רועי רומנו - מתכנן פיננסי</p>';
        html += '<p style="font-size: 10px; margin: 2px 0;">רישיון: 117164 | טל: 052-8089808 | אימייל: roeir@ar-fo.co.il</p>';
        html += '</div>';
        html += '</div>';

        // סגירת המבנה
        html += '</div>';

        return html;
    }

    // גיבוי - ייצוא באנגלית אם העברית נכשלה
    exportToPDFEnglish(results) {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                return { success: false, error: 'PDF library not loaded' };
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // כותרת באנגלית
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('Professional Annuity Report', 105, 20, { align: 'center' });
            
            const now = new Date();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text('Report Date: ' + now.toLocaleDateString('he-IL'), 105, 30, { align: 'center' });
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Roei Romano - Financial Planner', 105, 40, { align: 'center' });
            
            // פרטי קשר בתחתית
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Contact Information', 105, 250, { align: 'center' });
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Roei Romano - Financial Planner', 105, 260, { align: 'center' });
            doc.text('License: 117164', 105, 267, { align: 'center' });
            doc.text('Tel: 052-8089808', 105, 274, { align: 'center' });
            doc.text('Email: roeir@ar-fo.co.il', 105, 281, { align: 'center' });
            
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `Annuity_Report_${dateStr}.pdf`;
            doc.save(fileName);
            
            return { success: true, fileName: fileName };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // הכנת נתוני סיכום לExcel
    prepareSummaryData(results) {
        if (!results || !results.parameters || !results.summary) {
            console.error('Invalid results for summary data:', results);
            return [];
        }

        const safeNum = (value) => isNaN(value) || value === null || value === undefined ? 0 : Number(value);
        const formatNumber = (num) => new Intl.NumberFormat('he-IL').format(safeNum(num));
        
        const taxType = results.parameters.taxType === 'real' ? 'מס ריאלי (25%)' : 'מס נומינלי (15%)';
        const withdrawalMethod = results.parameters.withdrawalMethod === 'gross' ? 'ברוטו (לפני מס)' : 'נטו (אחרי מס)';
        
        return [
            { 'פרמטר': 'השקעה התחלתית', 'ערך': `${formatNumber(results.summary.initialAmount)} ש"ח` },
            { 'פרמטר': 'תשואה שנתית', 'ערך': `${(safeNum(results.parameters.annualReturn) * 100).toFixed(2)}%` },
            { 'פרמטר': 'דמי ניהול שנתיים', 'ערך': `${(safeNum(results.parameters.annualFee) * 100).toFixed(2)}%` },
            { 'פרמטר': 'סוג מס', 'ערך': taxType },
            { 'פרמטר': 'אינפלציה שנתית', 'ערך': `${(safeNum(results.parameters.annualInflation) * 100).toFixed(2)}%` },
            { 'פרמטר': 'שיטת משיכה', 'ערך': withdrawalMethod },
            { 'פרמטר': '', 'ערך': '' },
            { 'פרמטר': 'תוצאות החישוב:', 'ערך': '' },
            { 'פרמטר': 'משיכה חודשית ממוצעת', 'ערך': `${formatNumber(results.parameters.withdrawalAmount)} ש"ח` },
            { 'פרמטר': 'מספר חודשי משיכה בפועל', 'ערך': safeNum(results.summary.actualMonths) },
            { 'פרמטר': 'סה"כ נמשך ברוטו', 'ערך': `${formatNumber(results.summary.totalWithdrawn)} ש"ח` },
            { 'פרמטר': 'סה"כ מס ששולם', 'ערך': `${formatNumber(results.summary.totalTax)} ש"ח` },
            { 'פרמטר': 'סה"כ נטו התקבל', 'ערך': `${formatNumber(results.summary.totalNet)} ש"ח` },
            { 'פרמטר': 'יתרה סופית', 'ערך': `${formatNumber(results.summary.finalBalance)} ש"ח` },
            { 'פרמטר': '', 'ערך': '' },
            { 'פרמטר': 'מדדי ביצועים:', 'ערך': '' },
            { 'פרמטר': 'יעילות משיכה', 'ערך': `${((safeNum(results.summary.totalNet) / safeNum(results.summary.initialAmount)) * 100).toFixed(1)}%` },
            { 'פרמטר': 'שיעור מס ממוצע', 'ערך': `${((safeNum(results.summary.totalTax) / safeNum(results.summary.totalWithdrawn)) * 100).toFixed(2)}%` }
        ];
    }

    // הכנת נתונים חודשיים לExcel
    prepareMonthlyData(monthlyData) {
        if (!monthlyData || !Array.isArray(monthlyData) || monthlyData.length === 0) {
            console.error('Invalid monthly data for Excel export:', monthlyData);
            return [];
        }
        
        return monthlyData.map(row => {
            // בדיקה שהנתונים קיימים ותקינים
            const safeNum = (value) => isNaN(value) || value === null || value === undefined ? 0 : Number(value);
            
            return {
                'חודש': safeNum(row.month),
                'יתרה התחלתית': Math.round(safeNum(row.startBalance)),
                'תשואה חודשית': Math.round(safeNum(row.returnAmount)),
                'דמי ניהול': Math.round(safeNum(row.managementFee)),
                'יתרה לפני משיכה': Math.round(safeNum(row.balanceAfterFee)),
                'רווח חייב במס': Math.round(safeNum(row.taxableGain)),
                'יחס רווח': (safeNum(row.gainRatio) * 100).toFixed(2) + '%',
                'משיכה ברוטו': Math.round(safeNum(row.actualWithdrawal)),
                'מס': Math.round(safeNum(row.tax)),
                'משיכה נטו': Math.round(safeNum(row.netWithdrawal)),
                'יתרה סופית': Math.round(safeNum(row.endBalance)),
                'בסיס עלות': Math.round(safeNum(row.costBasis))
            };
        });
    }

    // הכנת ניתוח מיסוי לExcel
    prepareTaxAnalysis(results) {
        if (!results || !results.parameters || !results.summary) {
            console.error('Invalid results for tax analysis:', results);
            return [];
        }

        const safeNum = (value) => isNaN(value) || value === null || value === undefined ? 0 : Number(value);
        const formatNumber = (num) => new Intl.NumberFormat('he-IL').format(safeNum(num));
        
        const analysis = [];
        
        analysis.push({ 'נושא': 'ניתוח מיסוי כללי', 'ערך': '', 'הערות': '' });
        analysis.push({ 'נושא': 'סוג מס', 'ערך': results.parameters.taxType === 'real' ? 'ריאלי (25%)' : 'נומינלי (15%)', 'הערות': 'שיטת המיסוי שנבחרה' });
        analysis.push({ 'נושא': 'סה"כ מס ששולם', 'ערך': `${formatNumber(results.summary.totalTax)} ש"ח`, 'הערות': 'כל המס שנגבה במהלך התקופה' });
        analysis.push({ 'נושא': 'שיעור מס ממוצע', 'ערך': `${((safeNum(results.summary.totalTax) / safeNum(results.summary.totalWithdrawn)) * 100).toFixed(2)}%`, 'הערות': 'אחוז המס מסה"כ המשיכות' });
        analysis.push({ 'נושא': 'אינפלציה שנתית', 'ערך': `${(safeNum(results.parameters.annualInflation) * 100).toFixed(2)}%`, 'הערות': 'רלוונטי רק למס ריאלי' });
        analysis.push({ 'נושא': 'יעילות מיסוי', 'ערך': `${(100 - ((safeNum(results.summary.totalTax) / safeNum(results.summary.totalWithdrawn)) * 100)).toFixed(2)}%`, 'הערות': 'אחוז הכסף שנשאר אחרי מס' });
        
        return analysis;
    }
}

// אתחול המערכת לייצוא
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.annuityCalculator) {
            window.exportManager = new DataExporter(window.annuityCalculator);
            console.log('Export manager initialized successfully');
        } else {
            setTimeout(() => {
                if (window.annuityCalculator) {
                    window.exportManager = new DataExporter(window.annuityCalculator);
                    console.log('Export manager initialized on second attempt');
                }
            }, 1000);
        }
    }, 100);
});