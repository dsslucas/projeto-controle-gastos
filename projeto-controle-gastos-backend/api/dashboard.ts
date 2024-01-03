module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();

    const getDashboard = async (req: any, res: any) => {
        const { date } = req.query;

        const {initialDate, finalDate} = globalFunctions.getBetweenDates(date);

        try {
            await app.database.transaction(async (trx: any) => {
                const totalEntries = await app.database("config as c")
                    .join("config_entries as ce", "c.id", "ce.idConfig")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .transacting(trx)
                    .then((response: any) => {
                        var value = 0;

                        response.forEach((element: any) => {
                            value += element.value;
                        })

                        return value;
                    })

                return await app.database("payment")
                    .where("date", ">=", initialDate)
                    .where("date", "<", finalDate)
                    .transacting(trx)
                    .then((response: any) => {
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

                            if(element.parcel) value = element.parcel_value;
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

                        const valueAvaliable = totalEntries - expenses;

                        return {
                            total: totalEntries.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' }),
                            available: {
                                value: valueAvaliable.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' }),
                                percentage: `${globalFunctions.checkNumber(((valueAvaliable / totalEntries)*100).toFixed(0))}%`
                            },
                            expenses: {
                                value: expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                percentage: `${globalFunctions.checkNumber(((expenses / totalEntries)*100).toFixed(0))}%`
                            },
                            indicators: {
                                billing: {
                                    value: totalContas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalContas / totalEntries)*100).toFixed(0))}%`                           
                                },
                                investments: {
                                    value: totalInvestimentos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalInvestimentos / totalEntries)*100).toFixed(0))}%`
                                },
                                leisure: {
                                    value: totalLazer.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalLazer / totalEntries)*100).toFixed(0))}%`
                                },
                                food: {
                                    value: totalAlimentacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalAlimentacao / totalEntries)*100).toFixed(0))}%`
                                },
                                purcharse: {
                                    value: totalCompras.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalCompras / totalEntries)*100).toFixed(0))}%`
                                },
                                health: {
                                    value: totalSaude.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalSaude / totalEntries)*100).toFixed(0))}%`
                                },
                                travel: {
                                    value: totalViagens.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalViagens / totalEntries)*100).toFixed(0))}%`
                                },
                                other: {
                                    value: totalOutros.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((totalOutros / totalEntries)*100).toFixed(0))}%`
                                }
                            },
                            paymentMethod: {
                                debit: {
                                    value: valorDebito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((valorDebito / totalEntries)*100).toFixed(0))}%`
                                },
                                credit: {
                                    value: valorCredito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((valorCredito / totalEntries)*100).toFixed(0))}%`
                                },
                                pix: {
                                    value: valorPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((valorPix / totalEntries)*100).toFixed(0))}%`
                                },
                                cash: {
                                    value: valorEspecie.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: `${globalFunctions.checkNumber(((valorEspecie / totalEntries)*100).toFixed(0))}%`
                                }
                            }
                        }
                    })
            })
                .then((response: any) => {
                    res.status(200).send(response)
                })
        }
        catch (error: any) {
            res.status(500).send("Não foi possível consultar os dados do dashboard. Contate o administrador do sistema.")
        }
    }

    return { getDashboard }
})