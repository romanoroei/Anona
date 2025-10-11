// מחשבון אנונה - מבוסס על הקובץ הסופי
class AnnuityCalculator {
    constructor() {
        this.results = null;
    }

    // המרת אחוזים לעשרוניות
    percentToDecimal(percent) {
        return percent / 100;
    }

    // חישוב ריבית חודשית אפקטיבית
    calculateMonthlyRate(annualRate) {
        if (annualRate === 0) return 0;
        return Math.pow(1 + annualRate, 1/12) - 1;
    }

    // עיצוב מספר עם פסיקים
    formatNumber(number, decimals = 0) {
        if (isNaN(number) || number === null || number === undefined) return '0';
        return new Intl.NumberFormat('he-IL', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    // פרסר מחרוזת מספר עם פסיקים
    parseNumber(str) {
        if (typeof str === 'number') return str;
        if (!str) return 0;
        return parseFloat(str.toString().replace(/,/g, '')) || 0;
    }

    // חישוב משיכות אנונה מלא
    calculate(params) {
        try {

            
            // המרת פרמטרים
            const initialAmount = this.parseNumber(params.initialAmount);
            const annualReturn = this.percentToDecimal(parseFloat(params.annualReturn));
            const annualFee = this.percentToDecimal(parseFloat(params.annualFee));
            const withdrawalAmount = this.parseNumber(params.withdrawalAmount);
            const taxType = params.taxType; // 'real' או 'nominal'
            const withdrawalMethod = params.withdrawalMethod; // 'gross' או 'net'
            const showMaxMonths = params.showMaxMonths === true; // האם להציג עד יתרה 0
            const requestedMonths = params.requestedMonths || 12; // מספר החודשים המבוקש
            
            // הגדרת אינפלציה בהתאם לסוג המס
            let annualInflation = 0;
            if (taxType === 'real') {
                annualInflation = this.percentToDecimal(parseFloat(params.annualInflation || 0));
            } else {
                annualInflation = 0; // מס נומינלי - אין אינפלציה
            }

            // שיעורי מס
            const taxRate = taxType === 'real' ? 0.25 : 0.15; // 25% ריאלי, 15% נומינלי

            // חישוב ריביות חודשיות אפקטיביות
            const monthlyReturn = this.calculateMonthlyRate(annualReturn);
            const monthlyFee = this.calculateMonthlyRate(annualFee);
            const monthlyInflation = this.calculateMonthlyRate(annualInflation);

            console.log('Monthly rates:', { monthlyReturn, monthlyFee, monthlyInflation });

            // מערכים לשמירת תוצאות
            const results = [];
            let currentBalance = initialAmount;
            let costBasis = initialAmount; // בסיס העלות
            let monthCounter = 0;
            const maxIterations = 600; // מגבלה למניעת לולאה אינסופית

            // לולאת חישוב חודשי
            while (currentBalance > 0.01 && monthCounter < maxIterations) {
                monthCounter++;

                // שווי תחילת חודש
                const startBalance = currentBalance;

                // תשואה חודשית
                const returnAmount = startBalance * monthlyReturn;
                const balanceAfterReturn = startBalance + returnAmount;

                // דמי ניהול (על הסכום אחרי תשואה)
                const managementFee = balanceAfterReturn * monthlyFee;
                const balanceAfterFee = balanceAfterReturn - managementFee;

                // עדכון בסיס העלות (רק למס ריאלי)
                if (taxType === 'real' && monthlyInflation > 0) {
                    costBasis = costBasis * (1 + monthlyInflation);
                }

                // חישוב רווח חייב במס
                const taxableGain = Math.max(0, balanceAfterFee - costBasis);
                const gainRatio = balanceAfterFee > 0 ? taxableGain / balanceAfterFee : 0;

                // קביעת סכום המשיכה בפועל
                let actualWithdrawal = 0;
                let tax = 0;
                let netWithdrawal = 0;

                if (withdrawalMethod === 'gross') {
                    // משיכה ברוטו - הסכום שהמשתמש הזין הוא לפני מס
                    actualWithdrawal = Math.min(withdrawalAmount, balanceAfterFee);
                    
                    // חישוב מס על החלק החייב
                    const withdrawalGainPortion = actualWithdrawal * gainRatio;
                    tax = withdrawalGainPortion * taxRate;
                    netWithdrawal = actualWithdrawal - tax;
                    
                } else {
                    // משיכה נטו - הסכום שהמשתמש הזין הוא אחרי מס
                    // צריך לחשב כמה לקחת ברוטו כדי לקבל את הסכום הנטו הרצוי
                    const desiredNet = Math.min(withdrawalAmount, balanceAfterFee * (1 - gainRatio * taxRate));
                    
                    if (gainRatio > 0) {
                        // יש רווח - צריך לחשב משיכה ברוטו
                        actualWithdrawal = desiredNet / (1 - gainRatio * taxRate);
                        actualWithdrawal = Math.min(actualWithdrawal, balanceAfterFee);
                    } else {
                        // אין רווח - אין מס
                        actualWithdrawal = Math.min(desiredNet, balanceAfterFee);
                    }
                    
                    // חישוב מס בפועל
                    const withdrawalGainPortion = actualWithdrawal * gainRatio;
                    tax = withdrawalGainPortion * taxRate;
                    netWithdrawal = actualWithdrawal - tax;
                }

                // אם אין מספיק כסף למשיכה מינימלית, עוצרים
                if (actualWithdrawal < 1) {
                    break;
                }

                // יתרה אחרי משיכה
                const endBalance = balanceAfterFee - actualWithdrawal;

                // עדכון בסיס עלות (הורדת החלק שנמשך מהקרן)
                const principalWithdrawn = actualWithdrawal - (actualWithdrawal * gainRatio);
                costBasis = Math.max(0, costBasis - principalWithdrawn);

                // שמירת תוצאות החודש
                results.push({
                    month: monthCounter,
                    startBalance: startBalance,
                    returnAmount: returnAmount,
                    balanceAfterReturn: balanceAfterReturn,
                    managementFee: managementFee,
                    balanceAfterFee: balanceAfterFee,
                    costBasis: costBasis,
                    taxableGain: taxableGain,
                    gainRatio: gainRatio,
                    actualWithdrawal: actualWithdrawal,
                    tax: tax,
                    netWithdrawal: netWithdrawal,
                    endBalance: endBalance,
                    principalWithdrawn: principalWithdrawn
                });

                // עדכון למחזור הבא
                currentBalance = endBalance;

                // אם לא מציגים הכל ועברנו את מספר החודשים המבוקש, עוצרים
                if (!showMaxMonths && monthCounter >= requestedMonths) {
                    break;
                }
            }

            // חישוב סיכומים
            const totalWithdrawn = results.reduce((sum, r) => sum + r.actualWithdrawal, 0);
            const totalTax = results.reduce((sum, r) => sum + r.tax, 0);
            const totalNet = results.reduce((sum, r) => sum + r.netWithdrawal, 0);
            const totalFees = results.reduce((sum, r) => sum + r.managementFee, 0);
            const finalBalance = results.length > 0 ? results[results.length - 1].endBalance : initialAmount;

            // חישוב מספר החודשים המקסימלי האפשרי - תמיד עצמאי!
            let maxPossibleMonths;
            
            // האם החישוב הנוכחי הסתיים בגלל שהכסף נגמר?
            const endedDueToNoMoney = results.length > 0 && results[results.length - 1].endBalance <= 0.01;
            
            if (endedDueToNoMoney || showMaxMonths) {
                // אם הכסף נגמר או שרצנו חישוב עד הסוף - זה המקסימום
                maxPossibleMonths = results.length;
            } else {
                // אחרת - נחשב את המקסימום האמיתי עם סימולציה מלאה
                // ללא קשר למה שהמשתמש ביקש להציג
                let tempBalance = initialAmount;
                let tempCostBasis = initialAmount;
                let tempMonths = 0;
                
                while (tempBalance > 0.01 && tempMonths < maxIterations) {
                    tempMonths++;
                    
                    // תשואה חודשית
                    const tempReturn = tempBalance * monthlyReturn;
                    const tempAfterReturn = tempBalance + tempReturn;
                    
                    // דמי ניהול
                    const tempFee = tempAfterReturn * monthlyFee;
                    const tempAfterFee = tempAfterReturn - tempFee;
                    
                    // עדכון בסיס עלות לאינפלציה
                    if (taxType === 'real' && monthlyInflation > 0) {
                        tempCostBasis = tempCostBasis * (1 + monthlyInflation);
                    }
                    
                    // חישוב משיכה ומס מדויק
                    let tempWithdrawal = 0;
                    
                    if (withdrawalMethod === 'gross') {
                        tempWithdrawal = Math.min(withdrawalAmount, tempAfterFee);
                        if (tempWithdrawal > 0) {
                            const tempGainRatio = tempAfterFee > 0 ? Math.max(0, tempAfterFee - tempCostBasis) / tempAfterFee : 0;
                            const tempGainPortion = tempWithdrawal * tempGainRatio;
                            const tempTax = tempGainPortion * taxRate;
                        }
                    } else {
                        const tempGainRatio = tempAfterFee > 0 ? Math.max(0, tempAfterFee - tempCostBasis) / tempAfterFee : 0;
                        const tempMaxNetAfterTax = tempAfterFee * (1 - tempGainRatio * taxRate);
                        const desiredNet = Math.min(withdrawalAmount, tempMaxNetAfterTax);
                        
                        if (tempGainRatio > 0 && desiredNet > 0) {
                            tempWithdrawal = Math.min(desiredNet / (1 - tempGainRatio * taxRate), tempAfterFee);
                        } else {
                            tempWithdrawal = Math.min(desiredNet, tempAfterFee);
                        }
                    }
                    
                    if (tempWithdrawal < 0.01) {
                        break;
                    }
                    
                    tempBalance = tempAfterFee - tempWithdrawal;
                    
                    // עדכון בסיס עלות
                    if (tempBalance > 0 && tempAfterFee > 0) {
                        const tempPrincipalWithdrawn = tempWithdrawal * (1 - Math.max(0, tempAfterFee - tempCostBasis) / tempAfterFee);
                        tempCostBasis = Math.max(0, tempCostBasis - tempPrincipalWithdrawn);
                    }
                }
                
                maxPossibleMonths = tempMonths;
            }
            
            // דיבאג - בואו נבדוק מה קורה
            console.log('חישוב חודשים מקסימליים:', {
                showMaxMonths: showMaxMonths,
                requestedMonths: requestedMonths,
                actualCalculatedMonths: results.length,
                maxPossibleMonths: maxPossibleMonths,
                endedDueToNoMoney: endedDueToNoMoney,
                lastBalance: results.length > 0 ? results[results.length - 1].endBalance : 0
            });

            this.results = {
                monthlyData: results,
                summary: {
                    initialAmount: initialAmount,
                    totalWithdrawn: totalWithdrawn,
                    totalTax: totalTax,
                    totalNet: totalNet,
                    totalFees: totalFees,
                    finalBalance: finalBalance,
                    actualMonths: results.length,
                    maxPossibleMonths: showMaxMonths ? results.length : maxPossibleMonths,
                    monthlyWithdrawal: results.length > 0 ? results[0].actualWithdrawal : 0,
                    averageNetWithdrawal: results.length > 0 ? totalNet / results.length : 0
                },
                parameters: {
                    initialAmount: initialAmount,
                    annualReturn: annualReturn,
                    monthlyReturn: monthlyReturn,
                    annualFee: annualFee,
                    monthlyFee: monthlyFee,
                    annualInflation: annualInflation,
                    monthlyInflation: monthlyInflation,
                    taxType: taxType,
                    taxRate: taxRate,
                    withdrawalMethod: withdrawalMethod,
                    withdrawalAmount: withdrawalAmount,
                    showMaxMonths: showMaxMonths
                }
            };

            console.log('Calculation completed:', this.results);
            return this.results;

        } catch (error) {
            console.error('שגיאה בחישוב:', error);
            throw new Error('שגיאה בביצוע החישוב: ' + error.message);
        }
    }

    // קבלת התוצאות האחרונות
    getResults() {
        return this.results;
    }

    // חישוב משיכה מקסימלית אפשרית לתקופה נתונה
    calculateMaxWithdrawal(params, targetMonths = 120) {
        let low = 1000;
        let high = this.parseNumber(params.initialAmount) / 10;
        let bestWithdrawal = low;
        const precision = 100; // דיוק של 100 ש"ח

        // חיפוש בינארי למציאת המשיכה המקסימלית
        while (high - low > precision) {
            const mid = Math.floor((low + high) / 2);
            
            // בדיקה עם משיכה זו
            const testParams = { ...params };
            testParams.withdrawalAmount = mid;
            testParams.showMaxMonths = true;

            try {
                const result = this.calculate(testParams);
                const actualMonths = result.summary.actualMonths;

                if (actualMonths >= targetMonths) {
                    bestWithdrawal = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            } catch (error) {
                high = mid - 1;
            }
        }

        return bestWithdrawal;
    }

    // חישוב תחזית עתידית
    calculateProjection(params, projectionMonths = 60) {
        const currentResults = this.calculate({...params, showMaxMonths: true});
        
        if (!currentResults.monthlyData.length) {
            return null;
        }

        const lastMonth = currentResults.monthlyData[currentResults.monthlyData.length - 1];
        const monthlyRate = currentResults.parameters.monthlyReturn;
        const monthlyFee = currentResults.parameters.monthlyFee;
        
        // תחזית פשוטה - המשך החישוב מהנקודה הנוכחית
        let projectedBalance = lastMonth.endBalance;
        const projections = [];

        for (let i = 1; i <= projectionMonths; i++) {
            if (projectedBalance <= 0) break;
            
            const returnAmount = projectedBalance * monthlyRate;
            const afterReturn = projectedBalance + returnAmount;
            const fee = afterReturn * monthlyFee;
            const afterFee = afterReturn - fee;
            
            projections.push({
                month: lastMonth.month + i,
                projectedBalance: afterFee,
                isProjection: true
            });
            
            projectedBalance = afterFee;
        }

        return projections;
    }
}

// יצירת מופע גלובלי
window.annuityCalculator = new AnnuityCalculator();