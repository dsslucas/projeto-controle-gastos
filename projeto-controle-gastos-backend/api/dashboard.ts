module.exports = ((app: any) => {
    const getDashboard = async (req: any, res: any) => {
        const { date } = req.query;

        const month = date.substring(5, 7);
        const year = date.substring(0, 4);
        const initialDate = new Date(Date.UTC(year, month - 1, 1));
        const nextMonth = new Date(Date.UTC(year, month, 0));
        const finalDate = new Date(nextMonth);
        finalDate.setUTCHours(23);
        finalDate.setUTCMinutes(59);
        finalDate.setUTCSeconds(59);

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

                        return {
                            total: totalEntries.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' }),
                            indicators: {
                                billing: {
                                    value: totalContas,
                                    percentage: totalContas / totalEntries
                                },
                                investments: {
                                    value: totalInvestimentos,
                                    percentage: totalInvestimentos / totalEntries
                                },
                                leisure: {
                                    value: totalLazer,
                                    percentage: totalLazer / totalEntries
                                },
                                food: {
                                    value: totalAlimentacao,
                                    percentage: totalAlimentacao / totalEntries
                                },
                                purcharse: {
                                    value: totalCompras,
                                    percentage: totalCompras / totalEntries
                                },
                                travel: {
                                    value: totalViagens,
                                    percentage: totalViagens / totalEntries
                                },
                                other: {
                                    value: totalOutros,
                                    percentage: totalOutros/ totalEntries
                                }
                            },
                            paymentMethod: {
                                debit: {
                                    value: valorDebito,
                                    percentage: valorDebito / totalEntries
                                },
                                credit: {
                                    value: valorCredito,
                                    percentage: valorCredito / totalEntries 
                                },
                                pix: {
                                    value: valorPix,
                                    percentage: valorPix / totalEntries
                                },
                                cash: {
                                    value: valorEspecie,
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