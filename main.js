// הקובץ הראשי לניהול המחשבון - גרסה מעודכנת
class AnnuityApp {
    constructor() {
        this.isCalculating = false;
        this.currentResults = null;
        this.init();
    }

    // אתחול האפליקציה
    init() {
        this.setupEventListeners();
        this.setupNumberFormatting();
        this.setupKeyboardShortcuts();
        this.setupTaxTypeHandling();
        this.loadSavedData();
        this.initPrivacyBanner();
        _added_helper_hideResultsInitially();
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // כפתור חישוב
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.performCalculation());
        }

        // כפתור ניקוי
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAndReset());
        }

        // אפשרויות מתקדמות
        const advancedToggle = document.getElementById('advancedToggle');
        if (advancedToggle) {
            advancedToggle.addEventListener('click', () => this.toggleAdvancedOptions());
        }

        // שינוי סוג מס
        const taxType = document.getElementById('taxType');
        if (taxType) {
            taxType.addEventListener('change', () => this.handleTaxTypeChange());
        }

        // כפתורי הצגת טבלה
        const showLimitedTableBtn = document.getElementById('showLimitedTableBtn');
        if (showLimitedTableBtn) {
            showLimitedTableBtn.addEventListener('click', () => this.showLimitedTable());
        }

        const showFullTableBtn = document.getElementById('showFullTableBtn');
        if (showFullTableBtn) {
            showFullTableBtn.addEventListener('click', () => this.showFullTable());
        }

        const hideTableBtn = document.getElementById('hideTableBtn');
        if (hideTableBtn) {
            hideTableBtn.addEventListener('click', () => this.hideTable());
        }

        // תובנות פיננסיות
        this.setupInsightsToggle();

        // כפתורי ייצוא
        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        }

        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        }

        // כפתורי שיתוף
        const shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn');
        if (shareWhatsAppBtn) {
            shareWhatsAppBtn.addEventListener('click', () => this.shareWhatsApp());
        }

        const shareFacebookBtn = document.getElementById('shareFacebookBtn');
        if (shareFacebookBtn) {
            shareFacebookBtn.addEventListener('click', () => this.shareFacebook());
        }

        const shareLinkedInBtn = document.getElementById('shareLinkedInBtn');
        if (shareLinkedInBtn) {
            shareLinkedInBtn.addEventListener('click', () => this.shareLinkedIn());
        }

        const shareEmailBtn = document.getElementById('shareEmailBtn');
        if (shareEmailBtn) {
            shareEmailBtn.addEventListener('click', () => this.shareEmail());
        }

        // כלים מקצועיים
        this.setupToolsEventListeners();

        // מודל סגירה
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        // סגירת מודל בלחיצה מחוץ לתוכן
        const modal = document.getElementById('toolModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    // הגדרת מאזיני אירועים לכלים
    setupToolsEventListeners() {
        const maxWithdrawalTool = document.getElementById('maxWithdrawalTool');
        if (maxWithdrawalTool) {
            maxWithdrawalTool.addEventListener('click', () => this.runMaxWithdrawalTool());
        }

        const sensitivityTool = document.getElementById('sensitivityTool');
        if (sensitivityTool) {
            sensitivityTool.addEventListener('click', () => this.runSensitivityTool());
        }

        const taxComparisonTool = document.getElementById('taxComparisonTool');
        if (taxComparisonTool) {
            taxComparisonTool.addEventListener('click', () => this.runTaxComparisonTool());
        }

        const optimizationTool = document.getElementById('optimizationTool');
        if (optimizationTool) {
            optimizationTool.addEventListener('click', () => this.runOptimizationTool());
        }
    }

    // הגדרת עיצוב מספרים
    setupNumberFormatting() {
        const numberInputs = document.querySelectorAll('.number-input');
        numberInputs.forEach(input => {
            // שדה מספר החודשים מטופל בנפרד
            if (input.id === 'monthsToDisplay') {
                input.addEventListener('input', (e) => this.formatMonthsInput(e.target));
                input.addEventListener('blur', (e) => this.formatMonthsInput(e.target));
            } else {
                input.addEventListener('input', (e) => this.formatNumberInput(e.target));
                input.addEventListener('blur', (e) => this.formatNumberInput(e.target));
            }
        });

        const rtlInputs = document.querySelectorAll('.rtl-align, .number-input');
        rtlInputs.forEach(input => {
            input.style.textAlign = 'right';
            input.style.direction = 'rtl';
        });
    }

    // הגדרת קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.performCalculation();
            }
            
            if (e.key === 'Escape') {
                // אם אין מודל פתוח, בצע ניקוי
                const modal = document.getElementById('toolModal');
                if (modal && modal.style.display === 'flex') {
                    this.closeModal();
                } else {
                    this.clearAndReset();
                }
            }
        });
    }

    // הגדרת טיפול בסוגי מס
    setupTaxTypeHandling() {
        this.setupAdvancedOptions(); // הגדרת אפשרויות מתקדמות
        this.handleTaxTypeChange(); // קריאה ראשונית
    }

    // הגדרת אפשרויות מתקדמות
    setupAdvancedOptions() {
        const advancedOptions = document.getElementById('advancedOptions');
        if (advancedOptions) {
            advancedOptions.classList.remove('open');
        }
    }

    // החלפת מצב אפשרויות מתקדמות
    toggleAdvancedOptions() {
        const advancedOptions = document.getElementById('advancedOptions');
        const toggleBtn = document.getElementById('advancedToggle');
        const toggleIcon = toggleBtn?.querySelector('.toggle-icon');

        if (advancedOptions && toggleBtn && toggleIcon) {
            if (advancedOptions.classList.contains('open')) {
                advancedOptions.classList.remove('open');
                toggleBtn.classList.remove('active');
                toggleIcon.textContent = '▼';
            } else {
                advancedOptions.classList.add('open');
                toggleBtn.classList.add('active');
                toggleIcon.textContent = '▲';
            }
        }
    }

    // טיפול בשינוי סוג מס
    handleTaxTypeChange() {
        const taxType = document.getElementById('taxType');
        const inflationGroup = document.getElementById('inflationGroup');
        const inflationInput = document.getElementById('annualInflation');

        if (taxType && inflationGroup && inflationInput) {
            if (taxType.value === 'nominal') {
                // מס נומינלי - הסתרת שדה אינפלציה
                inflationGroup.style.opacity = '0.5';
                inflationInput.disabled = true;
                inflationInput.value = '0';
                inflationGroup.querySelector('.range-info').textContent = 'לא רלוונטי למס נומינלי';
            } else {
                // מס ריאלי - הצגת שדה אינפלציה
                inflationGroup.style.opacity = '1';
                inflationInput.disabled = false;
                if (inflationInput.value === '0') {
                    inflationInput.value = '3';
                }
                inflationGroup.querySelector('.range-info').textContent = 'רלוונטי רק למס ריאלי';
            }
        }
    }

    // טעינת נתונים שמורים
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('annuityCalculatorData_v2');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.populateFormWithData(data);
            }
        } catch (error) {
            console.log('לא נמצאו נתונים שמורים או שגיאה בטעינה');
        }
    }

    // שמירת נתונים
    saveData() {
        try {
            const formData = this.getFormData();
            localStorage.setItem('annuityCalculatorData_v2', JSON.stringify(formData));
        } catch (error) {
            console.log('שגיאה בשמירת נתונים');
        }
    }

    // מילוי הטופס בנתונים
    populateFormWithData(data) {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        });
        
        // טיפול מיוחד בשדה החודשים
        const monthsInput = document.getElementById('monthsToDisplay');
        if (monthsInput && data.monthsToDisplay) {
            monthsInput.value = data.monthsToDisplay;
        }
        
        // עיצוב מחדש של שדות מספריים
        const numberInputs = document.querySelectorAll('.number-input');
        numberInputs.forEach(input => {
            if (input.id === 'monthsToDisplay') {
                this.formatMonthsInput(input);
            } else {
                this.formatNumberInput(input);
            }
        });
        
        // עדכון מצב מס
        this.handleTaxTypeChange();
    }

    // קבלת נתוני הטופס
    getFormData() {
        const monthsInput = document.getElementById('monthsToDisplay')?.value || 'מקסימום חודשים';
        let showMaxMonths = false;
        let requestedMonths = 12;
        
        if (monthsInput === 'מקסימום חודשים' || monthsInput.toLowerCase().includes('מקסימום')) {
            showMaxMonths = true;
        } else {
            const parsedMonths = parseInt(monthsInput.replace(/[^\d]/g, ''));
            if (!isNaN(parsedMonths) && parsedMonths > 0) {
                requestedMonths = parsedMonths;
            }
        }
        
        return {
            initialAmount: document.getElementById('initialAmount')?.value || '1,000,000',
            annualReturn: document.getElementById('annualReturn')?.value || '6',
            annualFee: document.getElementById('annualFee')?.value || '0.85',
            withdrawalAmount: document.getElementById('withdrawalAmount')?.value || '6,000',
            taxType: document.getElementById('taxType')?.value || 'real',
            annualInflation: document.getElementById('annualInflation')?.value || '3',
            withdrawalMethod: document.getElementById('withdrawalMethod')?.value || 'gross',
            monthsToDisplay: monthsInput, // שמירת הערך המקורי
            showMaxMonths: showMaxMonths,
            requestedMonths: requestedMonths
        };
    }

    // עיצוב קלט מספרי עם פסיקים
    formatNumberInput(input) {
        if (!input.value) return;
        
        const numericValue = input.value.replace(/,/g, '');
        
        if (isNaN(numericValue) || numericValue === '') return;
        
        const formattedValue = new Intl.NumberFormat('en-US').format(parseFloat(numericValue));
        
        const cursorPosition = input.selectionStart;
        const originalLength = input.value.length;
        
        input.value = formattedValue;
        
        const newLength = formattedValue.length;
        const newCursorPosition = cursorPosition + (newLength - originalLength);
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    // עיצוב שדה מספר החודשים
    formatMonthsInput(input) {
        if (!input.value) return;
        
        // אם השדה מכיל "מקסימום" - השאר כמו שהוא
        if (input.value.toLowerCase().includes('מקסימום')) {
            input.value = 'מקסימום חודשים';
            return;
        }
        
        // אחרת - נסה לעצב כמספר
        const numericValue = input.value.replace(/,/g, '').replace(/[^\d]/g, '');
        
        if (numericValue === '') {
            input.value = 'מקסימום חודשים';
            return;
        }
        
        const parsedNumber = parseInt(numericValue);
        if (!isNaN(parsedNumber) && parsedNumber > 0) {
            input.value = new Intl.NumberFormat('en-US').format(parsedNumber);
        } else {
            input.value = 'מקסימום חודשים';
        }
    }

    // ביצוע החישוב
    async performCalculation() {
        if (this.isCalculating) return;

        try {
            this.isCalculating = true;
            this.showLoadingSpinner(true);

            const formData = this.getFormData();
            
            // שמירת הנתונים
            this.saveData();

            // ביצוע החישוב
            const results = window.annuityCalculator.calculate(formData);
            this.currentResults = results;

            // הצגת התוצאות
            this.displayResults(results);

            // עדכון הנחות החישוב (מעל הטבלה) בכל חישוב
            this.displayCalculationAssumptions(results);

            // הצגת חלק התוצאות
            const resultsSection = document.getElementById('resultsSection');
            if (resultsSection) {
                
                // ADDED: unhide sections after calculation
                ['#resultsSection','.table-section','.export-section','.contact-section','.insights-section','#insightsPanel','.tools-section']
                    .forEach(sel => { 
                        const el = document.querySelector(sel); 
                        if (el) { 
                            el.classList.remove('is-hidden'); 
                            el.style.display = 'block'; 
                            // retrigger fade-in
                            el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in');
                        }
                    });

                resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            console.error('שגיאה בחישוב:', error);
            this.showError('שגיאה בביצוע החישוב: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.showLoadingSpinner(false);
        }
    }

    // הצגת תוצאות
    displayResults(results) {
        this.displaySummaryCards(results);
        this.displayTaxInfo(results);
        this.updateTableDisplayOptions(results);
        this.prepareFinancialInsights(results);
        
        // הסתרת הטבלה - המשתמש יבחר אם להציג אותה
        const tableContainer = document.getElementById('tableContainer');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
        
        // הסתרת תובנות - המשתמש יבחר אם להציג אותן
        const insightsPanel = document.getElementById('insightsPanel');
        if (insightsPanel) {
            insightsPanel.classList.remove('open');
        }
    }

    // הכנת תובנות כלכליות
    prepareFinancialInsights(results) {
        // עדכון מדדי הביצועים
        this.updateInsightMetrics(results);
        
        // אם פאנל התובנות פתוח, עדכן את הגרפים
        const insightsPanel = document.getElementById('insightsPanel');
        if (insightsPanel && insightsPanel.classList.contains('open')) {
            setTimeout(() => {
                this.drawCharts(results);
            }, 100);
        }
    }

    // עדכון מדדי תובנות
    updateInsightMetrics(results) {
        try {
            // תשואה מצטברת נטו
            const netAnnualReturn = document.getElementById('netAnnualReturn');
            if (netAnnualReturn) {
                const totalReturn = ((results.summary.totalNet / results.summary.initialAmount) - 1) * 100;
                const years = results.summary.actualMonths / 12;
                const annualizedReturn = (Math.pow(results.summary.totalNet / results.summary.initialAmount, 1/years) - 1) * 100;
                netAnnualReturn.textContent = `${annualizedReturn.toFixed(2)}% שנתי (${totalReturn.toFixed(1)}% מצטבר)`;
            }

            // אחוז השחתה של הקרן
            const principalDepletion = document.getElementById('principalDepletion');
            if (principalDepletion) {
                const depletionRate = ((results.summary.initialAmount - results.summary.finalBalance) / results.summary.initialAmount) * 100;
                principalDepletion.textContent = `${depletionRate.toFixed(1)}% מהקרן נוצלה`;
            }

            // יעילות מיסוי - אחוז הכסף שנשאר אחרי מס
            const taxEfficiency = document.getElementById('taxEfficiency');
            if (taxEfficiency) {
                const efficiency = ((results.summary.totalWithdrawn - results.summary.totalTax) / results.summary.totalWithdrawn) * 100;
                const avgTaxRate = (results.summary.totalTax / results.summary.totalWithdrawn) * 100;
                taxEfficiency.textContent = `${efficiency.toFixed(1)}% (מס ממוצע: ${avgTaxRate.toFixed(1)}%)`;
            }

            // כוח קנייה בחודש האחרון
            const purchasingPower = document.getElementById('purchasingPower');
            if (purchasingPower) {
                const inflationRate = results.parameters.annualInflation || 0;
                const months = results.summary.actualMonths;
                if (results.parameters.taxType === 'real' && inflationRate > 0) {
                    const realValue = 100 / Math.pow(1 + inflationRate, months/12);
                    const monthlyAmount = results.parameters.withdrawalAmount;
                    const realMonthlyValue = monthlyAmount * (realValue / 100);
                    purchasingPower.textContent = `${realValue.toFixed(1)}% (~${window.annuityCalculator.formatNumber(realMonthlyValue)} ₪ בערך נוכחי)`;
                } else {
                    purchasingPower.textContent = '100% (ללא התחשבות באינפלציה)';
                }
            }

            // עלות דמי ניהול כוללת
            const totalFeeCost = document.getElementById('totalFeeCost');
            if (totalFeeCost && results.monthlyData) {
                const totalFees = results.monthlyData.reduce((sum, month) => sum + (month.managementFee || 0), 0);
                const feePercentage = (totalFees / results.summary.initialAmount) * 100;
                totalFeeCost.textContent = `${window.annuityCalculator.formatNumber(totalFees)} ₪ (${feePercentage.toFixed(2)}% מההשקעה)`;
            }

            // הוספת תובנות נוספות
            this.updateAdditionalInsights(results);

        } catch (error) {
            console.log('שגיאה בעדכון מדדי תובנות:', error);
        }
    }

    // עדכון אזהרות והמלצות
    updateWarningsAndRecommendations(results) {
        const warningsContainer = document.getElementById('warningsContainer');
        if (!warningsContainer) return;

        let warnings = [];
        let recommendations = [];

        // בדיקת יחס משיכה למאזן
        const withdrawalRate = (results.parameters.withdrawalAmount * 12) / results.summary.initialAmount * 100;
        if (withdrawalRate > 4) {
            warnings.push(`🔴 <strong>שיעור משיכה גבוה:</strong> ${withdrawalRate.toFixed(1)}% שנתי עלול לזקוק את הקרן מהר מדי`);
            recommendations.push(`📉 <strong>הפחת משיכה:</strong> שקול להפחית את המשיכה החודשית ל-${window.annuityCalculator.formatNumber(Math.round(results.summary.initialAmount * 0.04 / 12))} ₪`);
        } else if (withdrawalRate < 2) {
            recommendations.push(`📈 <strong>פוטנציאל למשיכה גבוהה יותר:</strong> ניתן להגדיל את המשיכה ל-${window.annuityCalculator.formatNumber(Math.round(results.summary.initialAmount * 0.035 / 12))} ₪ בחודש`);
        }

        // בדיקת תקופת המשיכה
        const years = results.summary.actualMonths / 12;
        if (years < 10) {
            warnings.push(`⏰ <strong>תקופה קצרה:</strong> הכספים יסתיימו תוך ${years.toFixed(1)} שנים`);
            recommendations.push(`🕐 <strong>האריך תקופה:</strong> הפחת את המשיכה כדי להאריך את התקופה ל-15-20 שנים`);
        } else if (years > 30) {
            recommendations.push(`🎯 <strong>תקופה ארוכה:</strong> ניתן להגדיל את המשיכה ולעדיין להחזיק ${Math.round(years * 0.7)} שנים`);
        }

        // בדיקת יעילות מיסוי
        const taxRate = (results.summary.totalTax / results.summary.totalWithdrawn) * 100;
        if (results.parameters.taxType === 'real' && taxRate > 20) {
            recommendations.push(`💰 <strong>מס גבוה:</strong> שקול מס נומינלי - עלול להיות יותר יעיל (${taxRate.toFixed(1)}% מס ממוצע נוכחי)`);
        } else if (results.parameters.taxType === 'nominal' && results.parameters.annualInflation > 0.02) {
            recommendations.push(`📊 <strong>אינפלציה גבוהה:</strong> מס ריאלי עלול להיות יותר יעיל עם אינפלציה של ${(results.parameters.annualInflation * 100).toFixed(1)}%`);
        }

        // בדיקת דמי ניהול
        const annualFeePercent = results.parameters.annualFee * 100;
        if (annualFeePercent > 1.2) {
            warnings.push(`💸 <strong>דמי ניהול גבוהים:</strong> ${annualFeePercent.toFixed(2)}% שנתי משפיע משמעותית על התשואה`);
            recommendations.push(`🔍 <strong>בדוק חלופות:</strong> דמי ניהול נמוכים יותר יכולים לשפר את התוצאות באופן משמעותי`);
        }

        // יצירת HTML
        let html = '';
        if (warnings.length > 0) {
            html += '<div class="warnings-section"><h5>⚠️ אזהרות:</h5><ul>';
            warnings.forEach(warning => html += `<li>${warning}</li>`);
            html += '</ul></div>';
        }

        if (recommendations.length > 0) {
            html += '<div class="recommendations-section"><h5>💡 המלצות:</h5><ul>';
            recommendations.forEach(rec => html += `<li>${rec}</li>`);
            html += '</ul></div>';
        }

        if (html === '') {
            html = '<div class="no-warnings">✅ <strong>תכנון מאוזן:</strong> הפרמטרים נראים סבירים ואין אזהרות מיוחדות.</div>';
        }

        warningsContainer.innerHTML = html;
    }

    // תובנות נוספות מתקדמות
    updateAdditionalInsights(results) {
        // אם יש מקום להוסיף תובנות נוספות בעתיד
        this.createCapitalCompositionChart(results);
        this.updateInflationImpact(results);
    }

    // יצירת גרף הרכב הון
    createCapitalCompositionChart(results) {
        const ctx = document.getElementById('compositionChart');
        if (!ctx) return;

        // חישוב פילוח ההשקעה
        // סה"כ קרן ששולמה למשיכות (ללא מסים)
        const netWithdrawn = results.summary.totalWithdrawn - results.summary.totalTax;
        
        // פילוח המשיכות נטו לקרן ותשואה
        const principalWithdrawn = Math.min(netWithdrawn, results.summary.initialAmount);
        const returnWithdrawn = Math.max(0, netWithdrawn - principalWithdrawn);
        
        // מסים ששולמו
        const taxPaid = results.summary.totalTax;
        
        // יתרה נותרת
        const remainingBalance = results.summary.finalBalance;
        
        // קרן שלא נמשכה (עדיין בתיק)
        const principalRemaining = Math.max(0, results.summary.initialAmount - principalWithdrawn);

        // מחיקת גרף קיים
        if (window.compositionChartInstance) {
            window.compositionChartInstance.destroy();
        }

        // בדיקה אם יש תשואה שנמשכה
        const hasReturnWithdrawn = returnWithdrawn > 1000; // סף מינימלי
        
        let chartData, chartLabels, chartColors;
        
        if (hasReturnWithdrawn) {
            // אם יש תשואה שנמשכה - הצג את כל הרכיבים
            chartData = [principalWithdrawn, returnWithdrawn, taxPaid, principalRemaining];
            chartLabels = ['קרן שנמשכה', 'תשואה שנמשכה', 'מסים ששולמו', 'יתרה נותרת'];
            chartColors = ['#EF4444', '#10B981', '#F59E0B', '#3B82F6'];
        } else {
            // אם רק קרן נמשכה - פילוח פשוט יותר
            chartData = [principalWithdrawn, taxPaid, remainingBalance];
            chartLabels = ['קרן שנמשכה', 'מסים ששולמו', 'יתרה נותרת'];
            chartColors = ['#EF4444', '#F59E0B', '#3B82F6'];
        }

        window.compositionChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = window.annuityCalculator.formatNumber(context.parsed);
                                // חישוב אחוז מתוך הסכום הכולל
                                const total = chartData.reduce((sum, val) => sum + val, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${value} ₪ (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // עדכון השפעת אינפלציה
    updateInflationImpact(results) {
        const inflationImpact = document.getElementById('inflationImpact');
        if (!inflationImpact) return;

        const inflationRate = results.parameters.annualInflation || 0;
        const years = results.summary.actualMonths / 12;
        
        if (inflationRate > 0) {
            const nominalAmount = results.parameters.withdrawalAmount;
            const realAmountFirstMonth = nominalAmount;
            const realAmountLastMonth = nominalAmount / Math.pow(1 + inflationRate, years);
            const purchasingPowerLoss = ((realAmountFirstMonth - realAmountLastMonth) / realAmountFirstMonth) * 100;
            
            inflationImpact.innerHTML = `
                <strong>השפעת האינפלציה:</strong><br>
                משיכה בחודש הראשון: ${window.annuityCalculator.formatNumber(realAmountFirstMonth)} ₪<br>
                ערך משיכה בחודש האחרון: ~${window.annuityCalculator.formatNumber(realAmountLastMonth)} ₪<br>
                <span class="text-warning">אובדן כוח קנייה: ${purchasingPowerLoss.toFixed(1)}%</span>
            `;
        } else {
            inflationImpact.innerHTML = '<strong>השפעת האינפלציה:</strong> לא הוגדרה אינפלציה בחישוב';
        }
    }

    // ניקוי והתחלה מחדש
    clearAndReset() {
        // ניקוי localStorage
        localStorage.removeItem('annuityCalculatorData');
        
        // איפוס שדות לברירת מחדל
        document.getElementById('initialAmount').value = '1,000,000';
        document.getElementById('annualReturn').value = '6';
        document.getElementById('withdrawalAmount').value = '6,000';
        document.getElementById('annualFee').value = '0.85';
        document.getElementById('taxType').value = 'real';
        document.getElementById('annualInflation').value = '3';
        document.getElementById('withdrawalMethod').value = 'gross';
        document.getElementById('monthsToDisplay').value = 'מקסימום חודשים';
        
        // סגירת אפשרויות מתקדמות
        const advancedOptions = document.getElementById('advancedOptions');
        const advancedToggle = document.getElementById('advancedToggle');
        const toggleIcon = advancedToggle?.querySelector('.toggle-icon');
        
        if (advancedOptions) {
            advancedOptions.classList.remove('open');
        }
        if (advancedToggle) {
            advancedToggle.classList.remove('active');
        }
        if (toggleIcon) {
            toggleIcon.textContent = '▼';
        }
        
        // הסתרת תוצאות
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        // ADDED: re-hide until next calc
        ['#resultsSection','.table-section','.export-section','.contact-section','.insights-section','#insightsPanel','.tools-section']
            .forEach(sel => { const el = document.querySelector(sel); if (el) { el.classList.add('is-hidden'); el.style.display = 'none'; }});
        window.scrollTo({ top: 0, behavior: 'smooth' });

        }
        
        // הסתרת טבלה
        const tableContainer = document.getElementById('tableContainer');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
        
        // הסתרת תובנות
        const insightsPanel = document.getElementById('insightsPanel');
        const insightsToggle = document.getElementById('insightsToggle');
        const insightsIcon = insightsToggle?.querySelector('.toggle-icon');
        
        if (insightsPanel) {
            insightsPanel.classList.remove('open');
        }
        if (insightsIcon) {
            insightsIcon.textContent = '▼';
        }
        
        // איפוס גרפים
        if (window.balanceChartInstance) {
            window.balanceChartInstance.destroy();
        }
        if (window.withdrawalChartInstance) {
            window.withdrawalChartInstance.destroy();
        }
        
        // איפוס משתנים
        this.currentResults = null;
        this.isCalculating = false;
        
        
        // איפוס בלוק הנחות החישוב
        const assumptionsContainer = document.getElementById('calculationAssumptions');
        if (assumptionsContainer) {
            assumptionsContainer.innerHTML = '';
        }
// טיפול בשדה האינפלציה
        this.handleTaxTypeChange();
    }

    // עדכון אפשרויות הצגת הטבלה
    updateTableDisplayOptions(results) {
        const formData = this.getFormData();
        const limitedMonthsText = document.getElementById('limitedMonthsText');
        
        // עדכון מספר החודשים המוגבל
        if (limitedMonthsText) {
            const monthsToShow = formData.showMaxMonths ? 12 : formData.requestedMonths;
            limitedMonthsText.textContent = monthsToShow;
        }
        
        // איפוס מצב הכפתורים
        this.updateTableButtons(false, null);
    }

    // הצגת כרטיסי סיכום
    displaySummaryCards(results) {
        const elements = {
            summaryInitial: results.summary.initialAmount,
            summaryWithdrawal: results.summary.monthlyWithdrawal,
            summaryActualMonths: results.summary.actualMonths,
            summaryTotalWithdrawn: results.summary.totalWithdrawn,
            summaryFinalBalance: results.summary.finalBalance
        };
        
        // הצגת מספר חודשים מקסימלי - עצמאי ואובייקטיבי
        const maxMonths = results.summary.maxPossibleMonths;
        const actualMonths = results.summary.actualMonths;
        
        // הצג כרטיס מקסימום נפרד רק אם יש הבדל משמעותי (6+ חודשים)
        // ללא קשר למה שהמשתמש בחר להציג
        if (maxMonths > actualMonths && (maxMonths - actualMonths) >= 6) {
            elements.summaryMaxMonths = maxMonths;
        }

        // עדכון הכרטיסים הקיימים
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // הצגת הכרטיס
                element.parentElement.style.display = 'block';
                
                if (id.includes('Months')) {
                    const months = elements[id];
                    const years = Math.floor(months / 12);
                    const remainingMonths = months % 12;
                    
                    if (years > 0) {
                        const yearsText = `${years} שנ${years === 1 ? 'ה' : 'ים'}${remainingMonths > 0 ? ` ו-${remainingMonths} חודש${remainingMonths > 1 ? 'ים' : ''}` : ''}`;
                        element.innerHTML = `${months} חודש${months > 1 ? 'ים' : ''} <span class="years-notation">(${yearsText})</span>`;
                    } else {
                        element.textContent = `${months} חודש${months > 1 ? 'ים' : ''}`;
                    }
                } else {
                    element.textContent = window.annuityCalculator.formatNumber(elements[id]) + ' ₪';
                }
            }
        });
        
        // הסתרת כרטיס המקסימום אם הוא לא ברשימת האלמנטים
        const maxMonthsCard = document.getElementById('summaryMaxMonths');
        if (maxMonthsCard && !elements.summaryMaxMonths) {
            maxMonthsCard.parentElement.style.display = 'none';
        }
    }

    // הצגת מידע מיסוי
    displayTaxInfo(results) {
        const taxTypeDisplay = document.getElementById('taxTypeDisplay');
        const totalTaxPaid = document.getElementById('totalTaxPaid');
        const totalNetReceived = document.getElementById('totalNetReceived');
        const averageTaxRate = document.getElementById('averageTaxRate');

        if (taxTypeDisplay) {
            const taxType = results.parameters.taxType === 'real' ? 'מס ריאלי (25%)' : 'מס נומינלי (15%)';
            taxTypeDisplay.textContent = taxType;
        }

        if (totalTaxPaid) {
            totalTaxPaid.textContent = window.annuityCalculator.formatNumber(results.summary.totalTax) + ' ₪';
        }

        if (totalNetReceived) {
            totalNetReceived.textContent = window.annuityCalculator.formatNumber(results.summary.totalNet) + ' ₪';
        }

        if (averageTaxRate) {
            const avgRate = results.summary.totalWithdrawn > 0 ? 
                (results.summary.totalTax / results.summary.totalWithdrawn) * 100 : 0;
            averageTaxRate.textContent = avgRate.toFixed(1) + '%';
        }
    }

    // הצגת טבלה מוגבלת
    showLimitedTable() {
        if (!this.currentResults) return;
        
        const formData = this.getFormData();
        const monthsToShow = formData.showMaxMonths ? 12 : formData.requestedMonths;
        
        this.displayTable(this.currentResults, monthsToShow);
        this.updateTableButtons(true, monthsToShow);
    }

    // הצגת טבלה מלאה
    showFullTable() {
        if (!this.currentResults) return;
        
        this.displayTable(this.currentResults, null);
        this.updateTableButtons(false, null);
    }

    // הסתרת טבלה
    hideTable() {
        const tableContainer = document.getElementById('tableContainer');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
        this.updateTableButtons(null, null, true);
    }

    // עדכון כפתורי הטבלה
    updateTableButtons(isLimited, monthsShown, isHidden = false) {
        const showLimitedBtn = document.getElementById('showLimitedTableBtn');
        const showFullBtn = document.getElementById('showFullTableBtn');
        const hideTableBtn = document.getElementById('hideTableBtn');
        const limitedMonthsText = document.getElementById('limitedMonthsText');
        
        if (limitedMonthsText && monthsShown) {
            limitedMonthsText.textContent = monthsShown;
        }
        
        if (showLimitedBtn && showFullBtn && hideTableBtn) {
            if (isHidden) {
                // מצב הסגירה
                showLimitedBtn.style.display = 'inline-block';
                showFullBtn.style.display = 'inline-block';
                hideTableBtn.style.display = 'none';
                showLimitedBtn.classList.remove('active');
                showFullBtn.classList.remove('active');
            } else {
                // מצב הצגה
                showLimitedBtn.style.display = isLimited ? 'none' : 'inline-block';
                showFullBtn.style.display = isLimited ? 'inline-block' : 'none';
                hideTableBtn.style.display = 'inline-block';
                
                if (isLimited) {
                    showLimitedBtn.classList.add('active');
                    showFullBtn.classList.remove('active');
                } else {
                    showLimitedBtn.classList.remove('active');
                    showFullBtn.classList.add('active');
                }
            }
        }
    }

    // הצגת הנחות החישוב
    displayCalculationAssumptions(results) {
        const assumptionsContainer = document.getElementById('calculationAssumptions');
        if (!assumptionsContainer) return;

        const params = results.parameters;
        // סנכרון ערך החודשים עם הטופס הנוכחי כדי למנוע חוסר תאימות
        const formDataMonths = this.getFormData();
        
        // יצירת HTML עבור ההנחות
        let html = `
            <h4>🔍 הנחות שבעזרתן בוצע החישוב</h4>
            <div class="assumptions-grid">
        `;
        
        // השקעה התחלתית
        html += `
            <div class="assumption-item">
                <span class="assumption-label">השקעה התחלתית:</span>
                <span class="assumption-value">${window.annuityCalculator.formatNumber(params.initialAmount)} ₪</span>
            </div>
        `;
        
        // תשואה שנתית
        html += `
            <div class="assumption-item">
                <span class="assumption-label">תשואה שנתית משוערת:</span>
                <span class="assumption-value">${(params.annualReturn * 100).toFixed(2)}%</span>
            </div>
        `;
        
        // סכום משיכה
        const withdrawalTypeText = params.withdrawalMethod === 'gross' ? 'ברוטו (לפני מס)' : 'נטו (אחרי מס)';
        html += `
            <div class="assumption-item">
                <span class="assumption-label">סכום משיכה חודשי:</span>
                <span class="assumption-value">${window.annuityCalculator.formatNumber(params.withdrawalAmount)} ₪ ${withdrawalTypeText}</span>
            </div>
        `;
        
        // דמי ניהול
        html += `
            <div class="assumption-item">
                <span class="assumption-label">דמי ניהול שנתיים:</span>
                <span class="assumption-value">${(params.annualFee * 100).toFixed(2)}%</span>
            </div>
        `;
        
        // סוג מס
        const taxTypeText = params.taxType === 'real' ? 'מס ריאלי (25%)' : 'מס נומינלי (15%)';
        html += `
            <div class="assumption-item">
                <span class="assumption-label">סוג מס:</span>
                <span class="assumption-value">${taxTypeText}</span>
            </div>
        `;
        
        // אינפלציה (רק אם רלוונטי)
        if (params.taxType === 'real' && params.annualInflation > 0) {
            html += `
                <div class="assumption-item">
                    <span class="assumption-label">אינפלציה שנתית:</span>
                    <span class="assumption-value">${(params.annualInflation * 100).toFixed(1)}%</span>
                </div>
            `;
        }
        
        // מספר חודשים מבוקש (מסונכרן עם שדה הטופס)
        {
            const monthsVal = (!formDataMonths.showMaxMonths && formDataMonths.requestedMonths)
                ? `${formDataMonths.requestedMonths} חודש${formDataMonths.requestedMonths > 1 ? 'ים' : ''}`
                : 'מקסימום חודשים אפשריים';
            html += `
                <div class="assumption-item">
                    <span class="assumption-label">מספר חודשי משיכה:</span>
                    <span class="assumption-value">${monthsVal}</span>
                </div>
            `;
        }
        
        // תאריך החישוב
        const now = new Date();
        const dateStr = now.toLocaleDateString('he-IL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        html += `
            <div class="assumption-item">
                <span class="assumption-label">תאריך החישוב:</span>
                <span class="assumption-value">${dateStr}</span>
            </div>
        `;
        
        html += `</div>`;
        
        assumptionsContainer.innerHTML = html;
    }

    // הצגת טבלה
    displayTable(results, monthsLimit = null) {
        const tableContainer = document.getElementById('tableContainer');
        const tableBody = document.getElementById('tableBody');
        
        if (!tableBody || !tableContainer) return;

        // הצגת הטבלה
        tableContainer.style.display = 'block';
        
        // הצגת הנחות החישוב
        this.displayCalculationAssumptions(results);
        
        // ריקון הטבלה
        tableBody.innerHTML = '';

        // קביעת הנתונים להצגה
        let dataToShow = results.monthlyData;
        if (monthsLimit && monthsLimit > 0) {
            dataToShow = results.monthlyData.slice(0, monthsLimit);
        }

        // מילוי הטבלה
        dataToShow.forEach(row => {
            const tr = document.createElement('tr');
            // חישוב שנה וחודש
            const year = Math.floor((row.month - 1) / 12) + 1;
            const monthInYear = ((row.month - 1) % 12) + 1;
            const monthDisplay = year > 1 ? `${row.month} <small class="years-notation">(שנה ${year}, חודש ${monthInYear})</small>` : row.month.toString();
            
            tr.innerHTML = `
                <td>${monthDisplay}</td>
                <td>${window.annuityCalculator.formatNumber(row.startBalance)}</td>
                <td>${window.annuityCalculator.formatNumber(row.returnAmount)}</td>
                <td>${window.annuityCalculator.formatNumber(row.managementFee)}</td>
                <td>${window.annuityCalculator.formatNumber(row.balanceAfterFee)}</td>
                <td>${window.annuityCalculator.formatNumber(row.actualWithdrawal)}</td>
                <td>${window.annuityCalculator.formatNumber(row.tax)}</td>
                <td>${window.annuityCalculator.formatNumber(row.netWithdrawal)}</td>
                <td>${window.annuityCalculator.formatNumber(row.endBalance)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // פונקציות שיתוף
    shareWhatsApp() {
        if (!this.currentResults) {
            this.showError('אין תוצאות לשיתוף. אנא בצע חישוב תחילה.');
            return;
        }
        
        const summary = this.currentResults.summary;
        const message = encodeURIComponent(`🎯 תוצאות מחשבון אנונה מקצועי:
        
💰 השקעה התחלתית: ${window.annuityCalculator.formatNumber(summary.initialAmount)} ₪
📊 משיכה חודשית: ${window.annuityCalculator.formatNumber(summary.monthlyWithdrawal)} ₪
⏳ תקופת המשיכה: ${summary.actualMonths} חודשים
💸 סה"כ נטו לקבלה: ${window.annuityCalculator.formatNumber(summary.totalNet)} ₪
🏦 יתרה סופית: ${window.annuityCalculator.formatNumber(summary.finalBalance)} ₪

חושב על אנונה? בוא נתכנן יחד!
רועי רומנו - מתכנן פיננסי`);
        
        window.open(`https://wa.me/?text=${message}`, '_blank');
    }

    shareFacebook() {
        const url = encodeURIComponent(window.location.href);
        const quote = encodeURIComponent('בדיוק סיימתי לחשב אנונה באמצעות המחשבון המקצועי של רועי רומנו. תוצאות מעניינות! 💰📊');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
    }

    shareLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent('מחשבון אנונה מקצועי - תכנון פיננסי חכם');
        const summary = encodeURIComponent('כלי מקצועי לחישוב משיכות אנונה עם אפשרויות מס מתקדמות ותובנות כלכליות');
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
    }

    shareEmail() {
        if (!this.currentResults) {
            this.showError('אין תוצאות לשיתוף. אנא בצע חישוב תחילה.');
            return;
        }
        
        const summary = this.currentResults.summary;
        const subject = encodeURIComponent('תוצאות מחשבון אנונה מקצועי');
        const body = encodeURIComponent(`שלום,

רציתי לשתף אתכם את התוצאות מחישוב האנונה שביצעתי:

🎯 תוצאות החישוב:
💰 השקעה התחלתית: ${window.annuityCalculator.formatNumber(summary.initialAmount)} ₪
📊 משיכה חודשית: ${window.annuityCalculator.formatNumber(summary.monthlyWithdrawal)} ₪
⏳ תקופת המשיכה: ${summary.actualMonths} חודשים (${(summary.actualMonths/12).toFixed(1)} שנים)
💸 סה"כ נטו לקבלה: ${window.annuityCalculator.formatNumber(summary.totalNet)} ₪
🏦 יתרה סופית: ${window.annuityCalculator.formatNumber(summary.finalBalance)} ₪

החישוב בוצע באמצעות המחשבון המקצועי של רועי רומנו - מתכנן פיננסי (רישיון: 117164)

לחישוב נוסף: ${window.location.href}

בברכה`);
        
        window.open(`mailto:?subject=${subject}&body=${body}`);
    }

    // ייצוא לExcel
    exportToExcel() {
        if (!this.currentResults) {
            this.showError('אין תוצאות לייצוא. אנא בצע חישוב תחילה.');
            return;
        }

        try {
            const result = window.exportManager.exportToExcel(this.currentResults);
            if (result.success) {
                this.showSuccess(`הקובץ ${result.fileName} יוצא בהצלחה`);
            } else {
                this.showError('שגיאה בייצוא: ' + result.error);
            }
        } catch (error) {
            this.showError('שגיאה בייצוא לExcel: ' + error.message);
        }
    }

    // ייצוא ל-PDF
    async exportToPDF() {
        if (!this.currentResults) {
            this.showError('אין תוצאות לייצוא. אנא בצע חישוב תחילה.');
            return;
        }

        // בדיקה שכל הספריות נטענו
        if (!window.exportManager) {
            this.showError('מערכת הייצוא לא זמינה. אנא רענן את הדף ונסה שוב.');
            return;
        }

        if (!window.jspdf) {
            this.showError('ספריית PDF לא נטענה. אנא רענן את הדף ונסה שוב.');
            return;
        }

        if (!window.html2canvas) {
            this.showError('ספריית HTML2Canvas לא נטענה. אנא רענן את הדף ונסה שוב.');
            return;
        }

        try {
            console.log('Starting Hebrew PDF export...');
            console.log('Export manager available:', !!window.exportManager);
            console.log('jsPDF available:', !!window.jspdf);
            console.log('html2canvas available:', !!window.html2canvas);
            console.log('Results data:', this.currentResults);
            
            // הצגת הודעת טעינה
            this.showMessage('יוצר דוח PDF עברי... אנא המתן', 'info');
            
            // קריאה ל-async function
            const result = await window.exportManager.exportToPDF(this.currentResults);
            
            if (result && result.success) {
                this.showSuccess(`הדוח ${result.fileName} יוצא בהצלחה בעברית מלאה! 📄✅`);
            } else {
                console.error('Export failed with result:', result);
                this.showError('שגיאה בייצוא: ' + (result ? result.error : 'תגובה לא תקינה'));
            }
        } catch (error) {
            console.error('PDF Export Error:', error);
            this.showError('שגיאה בייצוא ל-PDF: ' + error.message);
        }
    }

    // הרצת כלי משיכה מקסימלית
    async runMaxWithdrawalTool() {
        if (this.isCalculating) return;

        try {
            this.isCalculating = true;
            this.showLoadingSpinner(true);

            const formData = this.getFormData();
            const results = await window.advancedTools.calculateMaxWithdrawal(formData);
            
            this.showToolResults('חישוב משיכה מקסימלית', this.formatMaxWithdrawalResults(results));

        } catch (error) {
            this.showError('שגיאה בכלי משיכה מקסימלית: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.showLoadingSpinner(false);
        }
    }

    // הרצת כלי ניתוח רגישות
    async runSensitivityTool() {
        if (this.isCalculating) return;

        try {
            this.isCalculating = true;
            this.showLoadingSpinner(true);

            const formData = this.getFormData();
            const results = await window.advancedTools.performSensitivityAnalysis(formData);
            
            this.showToolResults('ניתוח רגישות לפרמטרים', this.formatSensitivityResults(results));

        } catch (error) {
            this.showError('שגיאה בניתוח רגישות: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.showLoadingSpinner(false);
        }
    }

    // הרצת כלי השוואת מס
    async runTaxComparisonTool() {
        if (this.isCalculating) return;

        try {
            this.isCalculating = true;
            this.showLoadingSpinner(true);

            const formData = this.getFormData();
            const results = await window.advancedTools.compareTaxMethods(formData);
            
            this.showToolResults('השוואת מס ריאלי מול נומינלי', this.formatTaxComparisonResults(results));

        } catch (error) {
            this.showError('שגיאה בהשוואת מס: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.showLoadingSpinner(false);
        }
    }

    // הרצת כלי אופטימיזציה
    async runOptimizationTool() {
        if (!this.currentResults) {
            this.showError('אנא בצע חישוב תחילה לפני שימוש בכלי האופטימיזציה.');
            return;
        }

        if (this.isCalculating) return;

        try {
            this.isCalculating = true;
            this.showLoadingSpinner(true);

            const formData = this.getFormData();
            const results = await window.advancedTools.performOptimization(formData);
            
            this.showToolResults('אופטימיזציה חכמה', this.formatOptimizationResults(results));

        } catch (error) {
            this.showError('שגיאה באופטימיזציה חכמה: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.showLoadingSpinner(false);
        }
    }

    // עיצוב תוצאות כלים
    formatMaxWithdrawalResults(results) {
        if (results.error) {
            return `<div class="error">שגיאה: ${results.error}</div>`;
        }

        let html = '<div class="tool-results">';
        
        if (results.results && results.results.length > 0) {
            html += '<h3>משיכה מקסימלית לפי תקופות:</h3>';
            html += '<table class="results-table"><thead><tr>';
            html += '<th>תקופה</th><th>משיכה מקסימלית</th><th>סה״כ נטו</th><th>מס כולל</th>';
            html += '</tr></thead><tbody>';
            
            results.results.forEach(r => {
                html += `<tr>
                    <td>${r.years} שנים</td>
                    <td>${window.annuityCalculator.formatNumber(r.maxWithdrawal)} ₪</td>
                    <td>${window.annuityCalculator.formatNumber(r.totalNet)} ₪</td>
                    <td>${window.annuityCalculator.formatNumber(r.totalTax)} ₪</td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }

        if (results.recommendations && results.recommendations.length > 0) {
            html += '<h3>המלצות:</h3><ul>';
            results.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        html += '</div>';
        return html;
    }

    formatSensitivityResults(results) {
        if (results.error) {
            return `<div class="error">שגיאה: ${results.error}</div>`;
        }

        let html = '<div class="tool-results">';

        if (results.scenarios && results.scenarios.length > 0) {
            html += '<h3>השפעת שינויי פרמטרים:</h3>';
            if (results.comparisonPeriod) {
                const years = Math.floor(results.comparisonPeriod / 12);
                const months = results.comparisonPeriod % 12;
                html += `<p class="comparison-info"><strong>תקופת השוואה:</strong> ${years} שנים${months > 0 ? ` ו-${months} חודשים` : ''} (${results.comparisonPeriod} חודשים)<br>`;
                html += `<em>כל התרחישים מחושבים לאותה תקופה בדיוק על בסיס התרחיש הבסיסי עם הפרמטרים שהזנת</em></p>`;
            }
            html += '<table class="results-table"><thead><tr>';
            html += '<th>תרחיש</th><th>תשואה</th><th>דמי ניהול</th><th>סה״כ נטו</th><th>חודשים</th>';
            html += '</tr></thead><tbody>';
            
            results.scenarios.forEach(s => {

                html += `<tr>
                    <td>${s.scenario}</td>
                    <td>${s.returnRate ? s.returnRate.toFixed(1) + '%' : 'N/A'}</td>
                    <td>${s.feeRate ? s.feeRate.toFixed(2) + '%' : 'N/A'}</td>
                    <td>${s.totalNet ? window.annuityCalculator.formatNumber(s.totalNet) + ' ₪' : 'N/A'}</td>
                    <td>${s.actualMonths || 'N/A'}</td>
                </tr>`;
            });
            
            html += '</tbody></table>';
        }

        if (results.recommendations && results.recommendations.length > 0) {
            html += '<h3>המלצות:</h3><ul>';
            results.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        html += '</div>';
        return html;
    }

    formatTaxComparisonResults(results) {
        if (results.error) {
            return `<div class="error">שגיאה: ${results.error}</div>`;
        }

        let html = '<div class="tool-results">';
        
        // בקרת תשואה אינטראקטיבית
        html += '<div class="interactive-controls">';
        html += '<h4>בחר תשואה שנתית לבדיקה:</h4>';
        html += '<div class="return-rate-selector">';
        [4, 5, 6, 7, 8, 9, 10].forEach(rate => {
            const isActive = rate === (results.returnRate || 6);
            html += `<button class="rate-btn ${isActive ? 'active' : ''}" data-rate="${rate}">${rate}%</button>`;
        });
        html += '</div></div>';

        if (results.results && results.results.length > 0) {
            html += `<h3>${results.title}:</h3>`;
            html += '<div id="taxComparisonTable">';
            html += '<table class="results-table"><thead><tr>';
            html += '<th>אינפלציה</th><th>מס ריאלי - נטו</th><th>מס נומינלי - נטו</th><th>יתרון</th><th>הפרש</th>';
            html += '</tr></thead><tbody>';
            
            results.results.forEach(r => {
                if (r.advantage) {
                    const advantageClass = r.advantage.better === 'real' ? 'real-advantage' : 'nominal-advantage';
                    html += `<tr class="${advantageClass}">
                        <td>${r.inflationRate}%</td>
                        <td>${window.annuityCalculator.formatNumber(r.real.totalNet)} ₪</td>
                        <td>${window.annuityCalculator.formatNumber(r.nominal.totalNet)} ₪</td>
                        <td>${r.advantage.better === 'real' ? 'ריאלי' : 'נומינלי'}</td>
                        <td>${window.annuityCalculator.formatNumber(Math.abs(r.advantage.amount))} ₪</td>
                    </tr>`;
                }
            });
            
            html += '</tbody></table></div>';
        }

        html += '</div>';
        
        // הוספת מאזיני אירועים לכפתורי התשואה
        setTimeout(() => {
            document.querySelectorAll('.rate-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const rate = parseFloat(e.target.dataset.rate);
                    const formData = this.getFormData();
                    
                    // עדכון כפתורים
                    document.querySelectorAll('.rate-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // הרצת חישוב מחדש
                    const newResults = await window.advancedTools.compareTaxMethods(formData, rate);
                    
                    // עדכון הטבלה
                    const table = document.getElementById('taxComparisonTable');
                    if (table) {
                        let tableHtml = '<table class="results-table"><thead><tr>';
                        tableHtml += '<th>אינפלציה</th><th>מס ריאלי - נטו</th><th>מס נומינלי - נטו</th><th>יתרון</th><th>הפרש</th>';
                        tableHtml += '</tr></thead><tbody>';
                        
                        newResults.results.forEach(r => {
                            if (r.advantage) {
                                const advantageClass = r.advantage.better === 'real' ? 'real-advantage' : 'nominal-advantage';
                                tableHtml += `<tr class="${advantageClass}">
                                    <td>${r.inflationRate}%</td>
                                    <td>${window.annuityCalculator.formatNumber(r.real.totalNet)} ₪</td>
                                    <td>${window.annuityCalculator.formatNumber(r.nominal.totalNet)} ₪</td>
                                    <td>${r.advantage.better === 'real' ? 'ריאלי' : 'נומינלי'}</td>
                                    <td>${window.annuityCalculator.formatNumber(Math.abs(r.advantage.amount))} ₪</td>
                                </tr>`;
                            }
                        });
                        tableHtml += '</tbody></table>';
                        table.innerHTML = tableHtml;
                        
                        // עדכון הכותרת
                        const title = document.querySelector('.tool-results h3');
                        if (title) {
                            title.textContent = `${newResults.title}:`;
                        }
                    }
                });
            });
        }, 100);
        
        return html;
    }

    formatOptimizationResults(results) {
        if (results.error) {
            return `<div class="error">שגיאה: ${results.error}</div>`;
        }

        let html = '<div class="tool-results">';

        if (results.recommendations && results.recommendations.length > 0) {
            html += '<h3>המלצות לשיפור:</h3>';
            html += '<table class="results-table"><thead><tr>';
            html += '<th>תחום</th><th>ערך נוכחי</th><th>ערך נבדק</th><th>שיפור צפוי</th>';
            html += '</tr></thead><tbody>';
            
            results.recommendations.forEach(rec => {
                html += `<tr>
                    <td>${rec.type}</td>
                    <td>${rec.currentValue}</td>
                    <td>${rec.recommendedValue}</td>
                    <td>${rec.improvement.toFixed(1)}%</td>
                </tr>`;
            });
            
            html += '</tbody></table>';

            html += '<h4>פירוט המלצות:</h4><ul>';
            results.recommendations.forEach(rec => {
                html += `<li><strong>${rec.type}:</strong> ${rec.description}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>✅ התכנון הנוכחי אופטימלי - לא נמצאו שיפורים משמעותיים.</p>';
        }

        if (results.summary) {
            html += `<div class="summary-box"><h4>סיכום:</h4><p>${results.summary}</p></div>`;
        }

        html += '</div>';
        return html;
    }

    // הצגת תוצאות כלי במודל
    showToolResults(title, content) {
        const modal = document.getElementById('toolModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.style.display = 'block';
        }
    }

    // סגירת מודל
    closeModal() {
        const modal = document.getElementById('toolModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // הצגת ספינר טעינה
    showLoadingSpinner(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    // הצגת הודעת שגיאה
    showError(message) {
        alert('❌ שגיאה: ' + message);
    }

    // הצגת הודעת הצלחה
    showSuccess(message) {
        alert('✅ הצלחה: ' + message);
    }

    // הצגת הודעת מידע
    showMessage(message, type = 'info') {
        let icon = '';
        switch(type) {
            case 'info': icon = 'ℹ️'; break;
            case 'warning': icon = '⚠️'; break;
            case 'loading': icon = '⏳'; break;
            default: icon = 'ℹ️';
        }
        
        // נסה להציג בתוך הדף אם יש אלמנט מתאים, אחרת alert
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.innerHTML = `${icon} ${message}`;
            statusElement.style.display = 'block';
            // הסתר אחרי 3 שניות
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        } else {
            console.log(`${icon} ${message}`);
        }
    }

    // פונקציות לתובנות כלכליות
    setupInsightsToggle() {
        const insightsToggle = document.getElementById('insightsToggle');
        const insightsPanel = document.getElementById('insightsPanel');
        const toggleIcon = insightsToggle?.querySelector('.toggle-icon');

        if (insightsToggle && insightsPanel) {
            insightsToggle.addEventListener('click', () => {
                const isOpen = insightsPanel.classList.contains('open');
                
                if (isOpen) {
                    insightsPanel.classList.remove('open');
                    if (toggleIcon) toggleIcon.textContent = '▼';
                } else {
                    insightsPanel.classList.add('open');
                    if (toggleIcon) toggleIcon.textContent = '▲';
                    
                    // ציור הגרפים כשנפתח הפאנל - עם עיכוב קטן לאנימציה
                    setTimeout(() => {
                        if (this.currentResults) {
                            this.drawCharts(this.currentResults);
                        }
                    }, 300);
                }
            });
        }
    }

    // ציור הגרפים - כעת רק גרף הרכב ההון נוצר באופן אוטומטי
    drawCharts(results) {
        // הגרפים של היתרה והמשיכות הוסרו
        // גרף הרכב ההון נוצר ב-createCapitalCompositionChart
    }

    // ציור גרף יתרה
    drawBalanceChart(monthlyData) {
        const ctx = document.getElementById('balanceChart');
        if (!ctx) return;

        // מחיקת גרף קיים
        if (window.balanceChartInstance) {
            window.balanceChartInstance.destroy();
        }

        const labels = monthlyData.map((item, index) => {
            const year = Math.floor((index + 1) / 12);
            const month = (index + 1) % 12 || 12;
            return year > 0 ? `שנה ${year}, חודש ${month}` : `חודש ${month}`;
        });

        const balanceData = monthlyData.map(item => Math.round(item.endBalance || item.balance || 0));

        window.balanceChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'יתרה בחשבון (₪)',
                    data: balanceData,
                    borderColor: '#1E40AF',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'התפתחות יתרת החשבון לאורך זמן',
                        font: { size: 16, weight: 'bold' },
                        color: '#1F2937'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'זמן',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'יתרה (₪)',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return window.annuityCalculator.formatNumber(value) + ' ₪';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    // ציור גרף משיכות
    drawWithdrawalChart(monthlyData) {
        const ctx = document.getElementById('withdrawalChart');
        if (!ctx) return;

        // מחיקת גרף קיים
        if (window.withdrawalChartInstance) {
            window.withdrawalChartInstance.destroy();
        }

        const labels = monthlyData.map((item, index) => {
            const year = Math.floor((index + 1) / 12);
            const month = (index + 1) % 12 || 12;
            return year > 0 ? `שנה ${year}, חודש ${month}` : `חודש ${month}`;
        });

        const withdrawalData = monthlyData.map(item => Math.round(item.netWithdrawal || item.withdrawal || 0));

        window.withdrawalChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'סכום משיכה חודשי (₪)',
                    data: withdrawalData,
                    backgroundColor: 'rgba(217, 119, 6, 0.8)',
                    borderColor: '#D97706',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'סכומי משיכה חודשיים',
                        font: { size: 16, weight: 'bold' },
                        color: '#1F2937'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'זמן',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'סכום משיכה (₪)',
                            font: { weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                return window.annuityCalculator.formatNumber(value) + ' ₪';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // אתחול באנר פרטיות
    initPrivacyBanner() {
        const privacyBanner = document.getElementById('privacyBanner');
        const acceptBtn = document.getElementById('acceptPrivacy');
        
        if (!privacyBanner || !acceptBtn) return;

        // בדיקה אם המשתמש כבר הסכים
        const hasAccepted = localStorage.getItem('privacyAccepted');
        
        if (!hasAccepted) {
            // הצגת הבאנר אחרי 2 שניות
            setTimeout(() => {
                privacyBanner.classList.add('show');
            }, 2000);
        }

        // מאזין ללחיצה על כפתור המבין
        acceptBtn.addEventListener('click', () => {
            // שמירה ב-localStorage
            localStorage.setItem('privacyAccepted', 'true');
            
            // הסתרת הבאנר
            privacyBanner.classList.remove('show');
            
            // הסרת הבאנר לחלוטין אחרי האנימציה
            setTimeout(() => {
                privacyBanner.style.display = 'none';
            }, 500);
        });

        // סגירה אוטומטית אחרי 30 שניות אם לא לחץ
        setTimeout(() => {
            if (privacyBanner.classList.contains('show')) {
                acceptBtn.click();
            }
        }, 30000);
    }
}

// אתחול האפליקציה כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    window.annuityApp = new AnnuityApp();
});
    // ==== ADDED: helper to hide specific sections by default ====

    function _added_helper_hideResultsInitially() {
        try {
            const selectors = [
                '#resultsSection',
                '.table-section',
                '.export-section',
                '.contact-section',
                // '.contact-section', // נשאר גלוי כברירת מחדל לפי בקשת הלקוח
                '.insights-section',
                '#insightsPanel',
                '.tools-section'
            ];
            selectors.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                    el.classList.add('is-hidden');
                    el.style.display = 'none';
                }
            });
        } catch (e) { console.warn('hide init failed', e); }
    }

    