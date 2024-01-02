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
                            const value = parseFloat(element.value);

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

                        const expenses = totalContas + totalInvestimentos + totalLazer + totalAlimentacao + totalCompras + totalSaude + totalViagens + totalOutros

                        return {
                            total: totalEntries.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' }),
                            expenses: {
                                value: expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                percentage: expenses / totalEntries
                            },
                            indicators: {
                                billing: {
                                    value: totalContas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalContas / totalEntries
                                },
                                investments: {
                                    value: totalInvestimentos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalInvestimentos / totalEntries
                                },
                                leisure: {
                                    value: totalLazer.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalLazer / totalEntries
                                },
                                food: {
                                    value: totalAlimentacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalAlimentacao / totalEntries
                                },
                                purcharse: {
                                    value: totalCompras.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalCompras / totalEntries
                                },
                                health: {
                                    value: totalSaude.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalSaude / totalEntries
                                },
                                travel: {
                                    value: totalViagens.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalViagens / totalEntries
                                },
                                other: {
                                    value: totalOutros.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: totalOutros/ totalEntries
                                }
                            },
                            paymentMethod: {
                                debit: {
                                    value: valorDebito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: valorDebito / totalEntries
                                },
                                credit: {
                                    value: valorCredito.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: valorCredito / totalEntries 
                                },
                                pix: {
                                    value: valorPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: valorPix / totalEntries
                                },
                                cash: {
                                    value: valorEspecie.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                                    percentage: valorEspecie / totalEntries
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