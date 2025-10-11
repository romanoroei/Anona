// כלים מקצועיים מתקדמים למחשבון אנונה
class AdvancedTools {
    constructor(calculator) {
        this.calculator = calculator;
    }

    // כלי 1: חישוב משיכה מקסימלית לתקופות שונות
    async calculateMaxWithdrawal(params) {
        try {
            const targetPeriods = [5, 10, 15, 20, 25, 30]; // שנים
            const results = [];

            for (const years of targetPeriods) {
                const targetMonths = years * 12;
                const maxWithdrawal = this.calculator.calculateMaxWithdrawal(params, targetMonths);
                
                // חישוב דוגמה עם המשיכה המקסימלית
                const testParams = { ...params };
                testParams.withdrawalAmount = maxWithdrawal;
                testParams.showMaxMonths = true;

                const simulation = this.calculator.calculate(testParams);
                
                results.push({
                    years: years,
                    months: targetMonths,
                    maxWithdrawal: maxWithdrawal,
                    totalWithdrawn: simulation.summary.totalWithdrawn,
                    totalTax: simulation.summary.totalTax,
                    totalNet: simulation.summary.totalNet,
                    finalBalance: simulation.summary.finalBalance,
                    actualMonths: simulation.summary.actualMonths,
                    sustainable: simulation.summary.actualMonths >= targetMonths
                });
            }

            return {
                title: 'חישוב משיכה מקסימלית',
                results: results,
                recommendations: this.generateMaxWithdrawalRecommendations(results, params)
            };

        } catch (error) {
            console.error('שגיאה בחישוב משיכה מקסימלית:', error);
            return {
                title: 'שגיאה בחישוב משיכה מקסימלית',
                error: error.message
            };
        }
    }

    // כלי 2: ניתוח רגישות לשינויי פרמטרים
    async performSensitivityAnalysis(params) {
        try {
            const baseReturn = parseFloat(params.annualReturn);
            const baseFee = parseFloat(params.annualFee);
            
            const scenarios = [
                { name: 'תשואה נמוכה (-2%)', returnChange: -2, feeChange: 0 },
                { name: 'תשואה נמוכה (-1%)', returnChange: -1, feeChange: 0 },
                { name: 'תרחיש בסיסי', returnChange: 0, feeChange: 0 },
                { name: 'תשואה גבוהה (+1%)', returnChange: 1, feeChange: 0 },
                { name: 'תשואה גבוהה (+2%)', returnChange: 2, feeChange: 0 },
                { name: `דמי ניהול גבוהים (${(baseFee + 0.1).toFixed(2)}%)`, returnChange: 0, feeChange: 0.1 },
                { name: `דמי ניהול נמוכים (${Math.max(0, baseFee - 0.1).toFixed(2)}%)`, returnChange: 0, feeChange: -0.1 }
            ];

            const results = [];
            let baseResult = null;
            let comparisonMonths = null;
            let isMaxMonthsMode = false;

            // שלב 1: חישוב תרחיש בסיסי כדי לקבוע את תקופת ההשוואה
            const baseScenario = scenarios.find(s => s.name === 'תרחיש בסיסי');
            if (baseScenario) {
                const baseParams = { ...params }; // משתמש בפרמטרים המקוריים של המשתמש
                const baseSimulation = this.calculator.calculate(baseParams);
                comparisonMonths = baseSimulation.summary.actualMonths;
                isMaxMonthsMode = params.showMaxMonths === true;
                

            }

            for (const scenario of scenarios) {
                const testParams = { ...params }; // מתחיל עם הפרמטרים המקוריים
                
                // מעדכן רק את התשואה ודמי הניהול
                const newReturn = Math.max(0, baseReturn + scenario.returnChange);
                const newFee = Math.max(0, Math.round((baseFee + scenario.feeChange) * 100) / 100);
                
                testParams.annualReturn = newReturn.toString();
                testParams.annualFee = newFee.toString();
                
                // אם המשתמש ביקש מקסימום חודשים, נגביל לתקופה של התרחיש הבסיסי
                if (isMaxMonthsMode && comparisonMonths) {
                    testParams.showMaxMonths = false;
                    testParams.requestedMonths = comparisonMonths;
                }
                
                try {
                    const simulation = this.calculator.calculate(testParams);
                    const result = {
                        scenario: scenario.name,
                        returnRate: newReturn,
                        feeRate: newFee,
                        totalWithdrawn: simulation.summary.totalWithdrawn,
                        totalTax: simulation.summary.totalTax,
                        totalNet: simulation.summary.totalNet,
                        finalBalance: simulation.summary.finalBalance,
                        actualMonths: simulation.summary.actualMonths,
                        efficiency: simulation.summary.totalWithdrawn / simulation.summary.initialAmount
                    };
                    
                    if (scenario.name === 'תרחיש בסיסי') {
                        baseResult = result;
                    }
                    
                    results.push(result);
                    
                } catch (error) {
                    results.push({
                        scenario: scenario.name,
                        returnRate: testParams.annualReturn,
                        feeRate: testParams.annualFee,
                        error: 'כישלון בחישוב'
                    });
                }
            }

            // הסרת חישוב השינויים - לא בשימוש יותר בתצוגה

            return {
                title: 'ניתוח רגישות לשינויי פרמטרים',
                scenarios: results,
                baseScenario: baseResult,
                comparisonPeriod: comparisonMonths,
                recommendations: this.generateSensitivityRecommendations(results, baseResult)
            };

        } catch (error) {
            console.error('שגיאה בניתוח רגישות:', error);
            return {
                title: 'שגיאה בניתוח רגישות',
                error: error.message
            };
        }
    }

    // כלי 3: השוואת מס ריאלי מול נומינלי
    async compareTaxMethods(params, customReturnRate = null) {
        try {
            const inflationRates = [1, 2, 3, 4, 5]; // אחוזי אינפלציה שונים
            const returnRate = customReturnRate || parseFloat(params.annualReturn);
            const results = [];

            for (const inflation of inflationRates) {
                // חישוב עם מס ריאלי
                const realTaxParams = { ...params };
                realTaxParams.taxType = 'real';
                realTaxParams.annualInflation = inflation;
                realTaxParams.annualReturn = returnRate;
                realTaxParams.showMaxMonths = true;

                // חישוב עם מס נומינלי
                const nominalTaxParams = { ...params };
                nominalTaxParams.taxType = 'nominal';
                nominalTaxParams.annualInflation = 0; // לא רלוונטי למס נומינלי
                nominalTaxParams.annualReturn = returnRate;
                nominalTaxParams.showMaxMonths = true;

                try {
                    const realResult = this.calculator.calculate(realTaxParams);
                    const nominalResult = this.calculator.calculate(nominalTaxParams);

                    results.push({
                        inflationRate: inflation,
                        real: {
                            totalWithdrawn: realResult.summary.totalWithdrawn,
                            totalTax: realResult.summary.totalTax,
                            totalNet: realResult.summary.totalNet,
                            actualMonths: realResult.summary.actualMonths,
                            averageTaxRate: realResult.summary.totalTax / realResult.summary.totalWithdrawn * 100
                        },
                        nominal: {
                            totalWithdrawn: nominalResult.summary.totalWithdrawn,
                            totalTax: nominalResult.summary.totalTax,
                            totalNet: nominalResult.summary.totalNet,
                            actualMonths: nominalResult.summary.actualMonths,
                            averageTaxRate: nominalResult.summary.totalTax / nominalResult.summary.totalWithdrawn * 100
                        },
                        advantage: null // יחושב בהמשך
                    });

                } catch (error) {
                    results.push({
                        inflationRate: inflation,
                        error: error.message
                    });
                }
            }

            // חישוב יתרון
            results.forEach(r => {
                if (r.real && r.nominal) {
                    const realAdvantage = r.real.totalNet - r.nominal.totalNet;
                    r.advantage = {
                        amount: realAdvantage,
                        percentage: (realAdvantage / r.nominal.totalNet) * 100,
                        better: realAdvantage > 0 ? 'real' : 'nominal'
                    };
                }
            });

            return {
                title: `השוואת מס ריאלי מול נומינלי - סכומים נטו לקבלה (תשואה ${returnRate}%)`,
                results: results,
                returnRate: returnRate
            };

        } catch (error) {
            console.error('שגיאה בהשוואת מס:', error);
            return {
                title: 'שגיאה בהשוואת מס',
                error: error.message
            };
        }
    }

    // כלי 4: אופטימיזציה חכמה
    async performOptimization(params) {
        try {
            const recommendations = [];
            const currentResult = this.calculator.calculate({...params, showMaxMonths: true});
            
            // אופטימיזציה 1: סוג מס
            const taxOptimization = await this.optimizeTaxChoice(params, currentResult);
            recommendations.push(taxOptimization);

            // אופטימיזציה 2: שיטת משיכה
            const withdrawalOptimization = await this.optimizeWithdrawalMethod(params, currentResult);
            recommendations.push(withdrawalOptimization);

            // אופטימיזציה 3: אופק זמן ומשיכה
            const timeOptimization = await this.analyzeTimeHorizonOptimization(params, currentResult);
            recommendations.push(timeOptimization);

            return {
                title: 'אופטימיזציה חכמה',
                recommendations: recommendations.filter(r => r.improvement !== 0)
            };

        } catch (error) {
            console.error('שגיאה באופטימיזציה חכמה:', error);
            return {
                title: 'שגיאה באופטימיזציה חכמה',
                error: error.message
            };
        }
    }

    // פונקציות עזר לאופטימיזציה
    async optimizeTaxChoice(params, currentResult) {
        const alternativeTax = params.taxType === 'real' ? 'nominal' : 'real';
        
        const testParams = { ...params };
        testParams.taxType = alternativeTax;
        if (alternativeTax === 'nominal') {
            testParams.annualInflation = 0;
        }
        
        try {
            const alternativeResult = this.calculator.calculate({...testParams, showMaxMonths: true});
            const netDifference = alternativeResult.summary.totalNet - currentResult.summary.totalNet;
            const improvement = (netDifference / currentResult.summary.totalNet) * 100;

            return {
                type: 'סוג מס',
                currentValue: params.taxType === 'real' ? 'מס ריאלי (25%)' : 'מס נומינלי (15%)',
                recommendedValue: alternativeTax === 'real' ? 'מס ריאלי (25%)' : 'מס נומינלי (15%)',
                improvement: improvement,
                netDifference: netDifference,
                description: improvement > 1 ? 
                    `שינוי ל${alternativeTax === 'real' ? 'מס ריאלי (25% על רווחים אחרי אינפלציה)' : 'מס נומינלי (15% על כל רווח)'} יכול להגדיל את סה"כ הסכום שתמשוך ב-${this.calculator.formatNumber(Math.abs(netDifference))} ₪` :
                    'שיטת המס הנוכחית אופטימלית'
            };
        } catch (error) {
            return {
                type: 'סוג מס',
                improvement: 0,
                description: 'לא ניתן לבצע אופטימיזציה של סוג המס'
            };
        }
    }

    async optimizeWithdrawalMethod(params, currentResult) {
        const alternativeMethod = params.withdrawalMethod === 'gross' ? 'net' : 'gross';
        
        const testParams = { ...params };
        testParams.withdrawalMethod = alternativeMethod;
        
        try {
            const alternativeResult = this.calculator.calculate({...testParams, showMaxMonths: true});
            const netDifference = alternativeResult.summary.totalNet - currentResult.summary.totalNet;
            const percentageImprovement = (netDifference / currentResult.summary.totalNet) * 100;
            
            // בדיקות נוספות לאיכות ההמלצה
            const monthsDifference = alternativeResult.summary.actualMonths - currentResult.summary.actualMonths;
            const isSignificantImprovement = Math.abs(percentageImprovement) > 2; // לפחות 2% שיפור
            const isBetterOrEqualDuration = monthsDifference >= -1; // לא פחות מחודש אחד
            const isAbsoluteImprovementGood = Math.abs(netDifference) > 5000; // לפחות 5000 ש"ח הבדל
            
            // המלצה רק אם יש שיפור משמעותי באמת
            const shouldRecommend = isSignificantImprovement && isBetterOrEqualDuration && isAbsoluteImprovementGood && netDifference > 0;

            return {
                type: 'שיטת משיכה',
                currentValue: params.withdrawalMethod === 'gross' ? 'ברוטו' : 'נטו',
                recommendedValue: alternativeMethod === 'gross' ? 'ברוטו' : 'נטו',
                improvement: shouldRecommend ? Math.abs(percentageImprovement) : 0,
                netDifference: netDifference,
                description: shouldRecommend ? 
                    `שינוי לשיטת משיכה ${alternativeMethod === 'gross' ? 'ברוטו (קובע סכום לפני מס)' : 'נטו (קובע סכום אחרי מס)'} יכול להגדיל את סה"כ הסכום שתקבל בפועל ב-${Math.abs(percentageImprovement).toFixed(1)}% (${this.calculator.formatNumber(Math.abs(netDifference))} ₪ יותר סה"כ)` :
                    'שיטת המשיכה הנוכחית אופטימלית עבור הפרמטרים שלך'
            };
        } catch (error) {
            return {
                type: 'שיטת משיכה',
                improvement: 0,
                description: 'לא ניתן לבצע אופטימיזציה של שיטת המשיכה'
            };
        }
    }


    async analyzeTimeHorizonOptimization(params, currentResult) {
        // ניתוח אופטימיזציה של אופק הזמן
        const currentAmount = this.calculator.parseNumber(params.withdrawalAmount);
        const initialAmount = this.calculator.parseNumber(params.initialAmount);
        const currentMonths = currentResult.summary.actualMonths;
        const currentYears = Math.floor(currentMonths / 12);
        
        // בדיקת משיכה מותאמת לאופק זמן ארוך יותר
        const reducedAmount = Math.round(currentAmount * 0.85);
        const testParams = { ...params };
        testParams.withdrawalAmount = reducedAmount;

        try {
            const extendedResult = this.calculator.calculate({...testParams, showMaxMonths: true});
            const extendedMonths = extendedResult.summary.actualMonths;
            const extendedYears = Math.floor(extendedMonths / 12);
            
            const monthsGained = extendedMonths - currentMonths;
            const yearValue = Math.abs(extendedResult.summary.totalNet - currentResult.summary.totalNet);
            
            const improvement = monthsGained > 12 ? (monthsGained / currentMonths) * 100 : 0;

            return {
                type: 'אופטימיזציה זמנית',
                currentValue: `${currentYears} שנים (${currentAmount.toLocaleString()} ₪/חודש)`,
                recommendedValue: improvement > 5 ? `${extendedYears} שנים (${reducedAmount.toLocaleString()} ₪/חודש)` : 'המשך במתכונת הנוכחית',
                improvement: improvement > 5 ? improvement : 0,
                description: improvement > 5 ? 
                    `הפחתת משיכה ב-15% תאריך את התכנית ב-${Math.floor(monthsGained/12)} שנים נוספות` :
                    'האיזון הנוכחי בין משיכה לאופק זמן מתאים'
            };
        } catch (error) {
            return {
                type: 'אופטימיזציה זמנית',
                improvement: 0,
                description: 'לא ניתן לבצע ניתוח אופטימיזציה זמנית'
            };
        }
    }

    // חישוב ציון לתרחיש
    calculateScenarioScore(result) {
        if (!result || !result.summary) return 0;
        
        const efficiency = result.summary.totalNet / result.summary.initialAmount;
        const sustainability = result.summary.actualMonths / 120; // ציפייה ל-10 שנים
        const taxEfficiency = 1 - (result.summary.totalTax / result.summary.totalWithdrawn);
        
        return (efficiency * 40) + (Math.min(sustainability, 1) * 40) + (taxEfficiency * 20);
    }

    calculateOverallScore(result, params) {
        return Math.round(this.calculateScenarioScore(result) * 10);
    }

    // יצירת המלצות
    generateMaxWithdrawalRecommendations(results, params) {
        const recommendations = [];
        
        const sustainableResults = results.filter(r => r.sustainable);
        if (sustainableResults.length > 0) {
            const best = sustainableResults[sustainableResults.length - 1];
            recommendations.push(`המשיכה המקסימלית הארוכת טווח היא ${this.calculator.formatNumber(best.maxWithdrawal)} ₪ לחודש למשך ${best.years} שנים`);
            recommendations.push(`עם משיכה זו תקבל סה"כ ${this.calculator.formatNumber(best.totalNet)} ₪ נטו`);
        }
        
        return recommendations;
    }

    generateSensitivityRecommendations(results, baseResult) {
        const recommendations = [];
        
        if (!baseResult) return recommendations;

        // בדיקת רגישות לתשואה
        const returnSensitive = results.filter(r => r.withdrawnChange && Math.abs(r.withdrawnChange) > 10);
        if (returnSensitive.length > 0) {
            recommendations.push('התכנית רגישה מאוד לשינויי תשואה - חשוב לבחור השקעות יציבות');
        }

        // בדיקת השפעת דמי ניהול
        const feeResults = results.filter(r => r.scenario.includes('דמי ניהול'));
        if (feeResults.length > 0) {
            const feeImpact = feeResults.find(r => r.withdrawnChange);
            if (feeImpact && Math.abs(feeImpact.withdrawnChange) > 5) {
                recommendations.push('דמי הניהול משפיעים משמעותית - כדאי לחפש תכניות עם דמי ניהול נמוכים יותר');
            }
        }
        
        return recommendations;
    }

    generateTaxComparisonRecommendations(results, params) {
        const recommendations = [];
        
        const validResults = results.filter(r => r.advantage);
        if (validResults.length === 0) return recommendations;

        // בדיקת מגמה
        const lowInflationAdvantage = validResults.find(r => r.inflationRate <= 2);
        const highInflationAdvantage = validResults.find(r => r.inflationRate >= 4);

        if (lowInflationAdvantage && highInflationAdvantage) {
            if (lowInflationAdvantage.advantage.better === 'nominal' && highInflationAdvantage.advantage.better === 'real') {
                recommendations.push('באינפלציה נמוכה (עד 2%) מס נומינלי עדיף, באינפלציה גבוהה (מעל 4%) מס ריאלי עדיף');
            }
        }

        const currentInflation = parseFloat(params.annualInflation || 3);
        const currentInflationResult = validResults.find(r => Math.abs(r.inflationRate - currentInflation) <= 0.5);
        
        if (currentInflationResult && currentInflationResult.advantage.better !== params.taxType) {
            recommendations.push(`באינפלציה הנוכחית (${currentInflation}%) מס ${currentInflationResult.advantage.better === 'real' ? 'ריאלי' : 'נומינלי'} עדיף`);
        }
        
        return recommendations;
    }

    generateOptimizationSummary(recommendations, currentScore) {
        const validRecommendations = recommendations.filter(r => r.improvement > 1);
        
        if (validRecommendations.length === 0) {
            return `הציון הנוכחי הוא ${currentScore}/100 - התכנון אופטימלי`;
        }
        
        const totalImprovement = validRecommendations.reduce((sum, r) => sum + r.improvement, 0) / validRecommendations.length;
        return `נמצאו ${validRecommendations.length} הזדמנויות שיפור עם פוטנציאל לשיפור ממוצע של ${totalImprovement.toFixed(1)}%`;
    }
}

// יצירת מופע גלובלי
window.advancedTools = new AdvancedTools(window.annuityCalculator);