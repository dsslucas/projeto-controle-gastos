module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();

    function anoMesAnterior(date) {
        const [year, month] = date.split('-').map(Number);

        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;

        const lastYearMonth = `${lastYear}-${lastMonth.toString().padStart(2, '0')}`;

        return lastYearMonth;
    }

    const getDashData = async (entries: number, initialDate: Date, finalDate: Date) => {
        var data = {};
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("payment")
                    .where("date", ">=", initialDate)
                    .where("date", "<", finalDate)
                    .transacting(trx)
                    .then(async (response: any) => {
                        var valorPix: number = 0.0;
                        var valorDebito: number = 0.0;
                        var valorCredito: number = 0.0;
                        var valorEspecie: number = 0.0;

                        var totalContas: number = 0.0;
                        var totalInvestimentos: number = 0.0;
                        var totalLazer: number = 0.0;
                        var totalAlimentacao: number = 0.0;
                        var totalCompras: number = 0.0;
                        var totalSaude: number = 0.0;
                        var totalViagens: number = 0.0;
                        var totalOutros: number = 0.0;

                        response.forEach((element: any) => {
                            var value = 0;

                            if (element.parcel) value = element.parcel_value;
                            else value = element.value

                            if (element.category === "Contas") totalContas += value
                            else if (element.category === "Investimentos") totalInvestimentos += value
                            else if (element.category === "Lazer") totalLazer += value
                            else if (element.category === "Alimentação") totalAlimentacao += value
                            else if (element.category === "Compras") totalCompras += value
                            else if (element.category === "Saúde") totalSaude += value
                            else if (element.category === "Viagens") totalViagens += value
                            else if (element.category === "Outros") totalOutros += value

                            if (element.paymentMethod === "Débito") valorDebito += value
                            else if (element.paymentMethod === "Crédito") valorCredito += value
                            else if (element.paymentMethod === "PIX") valorPix += value
                            else if (element.paymentMethod === "Espécie") valorEspecie += value
                        })

                        const expenses = totalContas + totalInvestimentos + totalLazer + totalAlimentacao + totalCompras + totalSaude + totalViagens + totalOutros;

                        const valueAvaliable = entries - expenses;
                        //await globalFunctions.formatMoneyNumberToString(element.value)
                        const teste = {
                            total: await globalFunctions.formatMoneyNumberToString(entries),
                            available: {
                                value: await globalFunctions.formatMoneyNumberToString(valueAvaliable),
                                percentage: `${globalFunctions.checkNumber(((valueAvaliable / entries) * 100).toFixed(0))}%`
                            },
                            expenses: {
                                value: await globalFunctions.formatMoneyNumberToString(expenses),
                                percentage: `${globalFunctions.checkNumber(((expenses / entries) * 100).toFixed(0))}%`
                            },
                            indicators: {
                                billing: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalContas),
                                    percentage: `${globalFunctions.checkNumber(((totalContas / entries) * 100).toFixed(0))}%`
                                },
                                investments: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalInvestimentos),
                                    percentage: `${globalFunctions.checkNumber(((totalInvestimentos / entries) * 100).toFixed(0))}%`
                                },
                                leisure: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalLazer),
                                    percentage: `${globalFunctions.checkNumber(((totalLazer / entries) * 100).toFixed(0))}%`
                                },
                                food: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalAlimentacao),
                                    percentage: `${globalFunctions.checkNumber(((totalAlimentacao / entries) * 100).toFixed(0))}%`
                                },
                                purcharse: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalCompras),
                                    percentage: `${globalFunctions.checkNumber(((totalCompras / entries) * 100).toFixed(0))}%`
                                },
                                health: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalSaude),
                                    percentage: `${globalFunctions.checkNumber(((totalSaude / entries) * 100).toFixed(0))}%`
                                },
                                travel: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalViagens),
                                    percentage: `${globalFunctions.checkNumber(((totalViagens / entries) * 100).toFixed(0))}%`
                                },
                                other: {
                                    value: await globalFunctions.formatMoneyNumberToString(totalOutros),
                                    percentage: `${globalFunctions.checkNumber(((totalOutros / entries) * 100).toFixed(0))}%`
                                }
                            },
                            paymentMethod: {
                                debit: {
                                    value: await globalFunctions.formatMoneyNumberToString(valorDebito),
                                    percentage: `${globalFunctions.checkNumber(((valorDebito / entries) * 100).toFixed(0))}%`
                                },
                                credit: {
                                    value: await globalFunctions.formatMoneyNumberToString(valorCredito),
                                    percentage: `${globalFunctions.checkNumber(((valorCredito / entries) * 100).toFixed(0))}%`
                                },
                                pix: {
                                    value: await globalFunctions.formatMoneyNumberToString(valorPix),
                                    percentage: `${globalFunctions.checkNumber(((valorPix / entries) * 100).toFixed(0))}%`
                                },
                                cash: {
                                    value: await globalFunctions.formatMoneyNumberToString(valorEspecie),
                                    percentage: `${globalFunctions.checkNumber(((valorEspecie / entries) * 100).toFixed(0))}%`
                                }
                            }
                        }

                        return teste;
                    })
            })
                .then((response: any) => {
                    data = response;
                })
        }
        catch (error: any) {
            console.error(error)
            return error
        }

        return data;
    }

    const getDashboard = async (req: any, res: any) => {
        const { date } = req.query;

        if (date === "" || date === undefined || date === null) return res.status(404).send("A data para consulta não foi informada.")

        const { initialDate, finalDate } = globalFunctions.getBetweenDates(date);

        try {
            await app.database.transaction(async (trx: any) => {
                const currentDate = new Date();
                if (currentDate < initialDate) throw "NOT_CURRENT_DATE";

                const totalEntries = await app.database("config as c")
                    .join("config_entries as ce", "c.id", "ce.idConfig")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .transacting(trx)
                    .then(async (response: any) => {
                        var value = 0;

                        response.forEach((element: any) => {
                            value += element.value;
                        })
                        
                        return value;                       
                    })

                var data = await getDashData(totalEntries, initialDate, finalDate)

                return data;
            })
                .then((response: any) => {
                    res.status(200).send(response)
                })
        }
        catch (error: any) {
            if (error === "NOT_CURRENT_DATE") return res.status(404).send("Não é possível consultar os dados de meses seguintes.")
            else return res.status(500).send("Não foi possível consultar os dados do dashboard. Contate o administrador do sistema.")
        }
    }

    return { getDashboard }
})