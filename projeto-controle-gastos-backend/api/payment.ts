module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();
    const investmentService = app.api.investment;

    function checkConditions(requestBody: object) {
        if (!("category" in requestBody) || !("date" in requestBody) || !("paymentMethod" in requestBody) || !("title" in requestBody) || !("value" in requestBody)) {
            throw "NO_CATEGORY";
        }

        for (const [key, value] of Object.entries(requestBody)) {
            if ((key !== "description" && key !== "parcel") && (value === "" || value === null || value === undefined)) {
                throw "EMPTY_FIELD";
            }

            if (key === "category" && (value != "Contas" && value != "Investimentos" && value != "Lazer" && value != "Alimentação" && value != "Compras" && value != "Saúde" && value != "Viagens" && value != "Outros")) {
                throw "INVALID_CATEGORY";
            }

            if (key === "paymentMethod" && (value != "Débito" && value != "Crédito" && value != "Espécie" && value != "PIX")) {
                throw "INVALID_PAYMENT";
            }
        }
    }

    const registerPayment = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                checkConditions(req.body);

                const { category, date, description, paymentMethod, title, value, parcel, investment } = req.body;

                const { initialDate, finalDate } = globalFunctions.getBetweenDates(date.substring(0, 7));

                const currentDate = new Date();
                if (currentDate < initialDate) throw "NOT_CURRENT_DATE";

                const entriesValue = await app.database("config as c")
                    .join("config_entries as ce", "ce.idConfig", "c.id")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .transacting(trx)
                    .then((response: any) => {
                        var entriesValue = 0.0;
                        // Empty condition
                        if (response.length === 0) throw "NO_CONFIG_SET"
                        else {
                            response.forEach((element: any) => {
                                entriesValue += element.value;
                            })
                        }

                        return entriesValue;
                    })

                const expenses = await app.database("payment")
                    .where("date", ">=", initialDate)
                    .where("date", "<", finalDate)
                    .transacting(trx)
                    .then((response: any) => {
                        var expensesValue = 0;

                        response.forEach((element: any) => {
                            if (element.parcel) expensesValue += element.parcel_value;
                            else expensesValue += element.value
                        })

                        return expensesValue;
                    })

                if (entriesValue < expenses) throw "NO_CASH";

                var idPayment = 0;

                if (paymentMethod === "Crédito") {
                    if (parcel) {
                        const valueParcel = parseFloat((globalFunctions.formatMoney(value) / parcel).toFixed(2));
                        const datePayment = new Date(date);

                        for (let i = 0; i < parcel; i++) {
                            const dateParcel = new Date(datePayment.getFullYear(), datePayment.getMonth() + i + 1, 1);
                            dateParcel.setHours(datePayment.getHours());
                            dateParcel.setMinutes(datePayment.getMinutes());

                            idPayment = (await app.database("payment")
                                .insert({
                                    category,
                                    date: dateParcel,
                                    description,
                                    paymentMethod,
                                    title,
                                    value: globalFunctions.formatMoney(value),
                                    parcel,
                                    parcel_value: valueParcel
                                })
                                .returning("id")
                                .transacting(trx))[0].id;
                        }
                    }
                    else {
                        throw "NO_PARCEL_DEFINED";
                    }
                }
                else {
                    if (globalFunctions.formatMoney(value) > (entriesValue - expenses)) throw "INSUFFICIENT_FUNDS";

                    idPayment = (await app.database("payment")
                        .insert({
                            category,
                            date: new Date(date),
                            description,
                            paymentMethod,
                            title,
                            value: globalFunctions.formatMoney(value)
                        })
                        .returning("id")
                        .transacting(trx))[0].id;
                }

                if (category === "Investimentos") {
                    var idInvestment = 0;

                    if (Number(investment.id) === 0 || Number(investment.id) === -1) idInvestment = null;
                    else idInvestment = Number(investment.id);

                    const valueInvestment = globalFunctions.formatMoney(value);

                    const rentability = investment.rentability.filter((element: any) => element.checked);

                    await investmentService.registerInvestment(idInvestment, idPayment, investment.title, investment.category, value, investment.initialDate, investment.finalDate, rentability, description, trx);
                }
            })

                .then(() => {
                    app.io.emit("NEW_PAYMENT_REGISTED");
                    res.status(200).send("Registro salvo!");
                })
        }
        catch (error: any) {
            console.error(error)
            if (error === "NOT_CURRENT_DATE") return res.status(404).send("Não é possível registrar gastos para o mês seguinte.")
            else if (error === "NO_CATEGORY") return res.status(404).send("Erro: está faltando um parâmetro para envio deste registro.");
            else if (error === "EMPTY_FIELD") return res.status(404).send("Erro: é necessário preencher os campos obrigatórios para salvar este registro.");
            else if (error === "INVALID_CATEGORY") return res.status(404).send("Erro: categoria inválida.");
            else if (error === "INVALID_PAYMENT") return res.status(404).send("Erro: forma de pagamento inválida.");
            else if (error === "NO_PARCEL_DEFINED") return res.status(404).send("Não foi definido uma parcela para o forma de pagamento por cartão de crédito.")
            else if (error === "NO_CONFIG_SET") return res.status(404).send("O registro não pôde ser realizado pois Não há configuração setada para este mês.");
            else if (error === "NO_CASH") return res.status(404).send("Não foi possível registrar este gasto, pois as despesas superam as entradas.");
            else if (error === "INSUFFICIENT_FUNDS") res.status(404).send("Saldo insuficiente.");
            else return res.status(500).send("Erro interno: contate o administrador do sistema.");
        }
    }

    const checkPaymentPossible = async (req: any, res: any) => {
        const { date } = req.query;

        const { initialDate, finalDate } = globalFunctions.getBetweenDates(date.substring(0, 7));

        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("config as c")
                    .join("config_entries as ce", "ce.idConfig", "c.id")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .transacting(trx)
            })
                .then((response: any) => {
                    if (response.length > 0) res.status(200).send(true)
                    else throw "NO_CONFIG";
                })
        }
        catch (error: any) {
            if (error === "NO_CONFIG") res.status(404).send("Não é possível registrar um gasto sem as receitas serem definidas.")
            else res.status(500).send("Erro interno. Contate o administrador do sistema.");
        }
    }

    const getPaymentsByMonth = async (category: String, paymentMethod: String, initialDate: Date, finalDate: Date, dateReported: boolean, trx: any) => {
        return await app.database("payment")
            .where((builder: any) => {
                if (category) builder.where("category", category);
                else if (paymentMethod) builder.where("paymentMethod", paymentMethod);
                else builder.whereNotNull('category')

                if (dateReported) {
                    builder.where("date", ">=", initialDate).where("date", "<", finalDate);
                }
            })
            .orderBy("date", "asc")
            .transacting(trx)
            .then((response: any) => {
                response.forEach(async (element: any) => {
                    element.valueWithoutMask = element.value;
                    element.date = await globalFunctions.formatDateHourTimeFormat(element.date);

                    if (element.paymentMethod === "Crédito") element.value = await globalFunctions.formatMoneyNumberToString(element.parcel_value);
                    else element.value = await globalFunctions.formatMoneyNumberToString(element.value);
                })

                return response;
            })
    }

    const getAllPaymentValuesByMonth = async (category: String, paymentMethod: String, initialDate: Date, finalDate: Date, dateReported: boolean, trx: any) => {
        const data = await getPaymentsByMonth(category, paymentMethod, initialDate, finalDate, dateReported, trx);

        var totalExpenses = data.reduce(function (acc: any, obj: any) { 
            return acc + obj.valueWithoutMask; 
        }, 0);

        return totalExpenses;
    }

    const getPayments = async (req: any, res: any) => {
        const { category, paymentMethod, date } = req.query;
        const dateReported = date !== "";

        //if(date === "" || date === undefined || date === null) return res.status(404).send("A data para consulta não foi informada.")
        var initialDate = null;
        var finalDate = null;

        if(date === undefined || date === null || date === ""){
           return res.status(404).send("As datas não foram informadas.")
        }

        if (dateReported) {
            const { initialDate: startDate, finalDate: endDate } = globalFunctions.getBetweenDates(date.substring(0, 7));
            initialDate = startDate;
            finalDate = endDate;
        }

        try {
            await app.database.transaction(async (trx: any) => {
                const currentDate = new Date();
                if (currentDate < initialDate) throw "NOT_CURRENT_DATE";

                const data = await getPaymentsByMonth(category, paymentMethod, initialDate, finalDate, dateReported, trx);

                return {
                    data,
                    columns: ["TÍTULO",	"DATA",	"CATEGORIA", "DESCRIÇÃO", "FORMA", "VALOR",	"AÇÕES"]
                };
            })
                .then((response: any) => res.status(200).send(response));
        }
        catch (error: any) {
            console.error(error)
            if (error === "NOT_CURRENT_DATE") return res.status(404).send("Não é possível registrar gastos para o mês seguinte.")
            else res.status(500).send("Erro interno. Contate o administrador do sistema.");
        }
    }

    const getPayment = async (req: any, res: any) => {
        const id = req.params.id;
        try {
            await app.database.transaction(async (trx: any) => {
                const data = await app.database("payment")
                    .where({ id })
                    .first()
                    .transacting(trx)
                    .then(async (response: any) => {
                        if (response.description === "") response.description = "-";
                        response.date = globalFunctions.formatDateTFormat(response.date);
                        response.value = await globalFunctions.formatMoneyNumberToString(response.value);

                        var investment = null;
                        if (response.category === "Investimentos") {
                            investment = await investmentService.allInfoInvestmentByIdPayment(response.id, trx);
                        }
                        return {
                            ...response,
                            investment
                        };
                    });

                return data;
            })
                .then((response: any) => res.status(200).send(response))
        }
        catch (error: any) {
            res.status(500).send("Erro interno. Contate o administrador do sistema.");
        }
    }

    const editPayment = async (req: any, res: any) => {
        const idPayment = req.params.id;
        delete req.body.parcel_value;

        try {
            await app.database.transaction(async (trx: any) => {
                checkConditions(req.body);

                const { category, date, description, paymentMethod, title, value } = req.body;

                const { initialDate, finalDate } = globalFunctions.getBetweenDates(date.substring(0, 7));

                const entriesValue = await app.database("config as c")
                    .join("config_entries as ce", "ce.idConfig", "c.id")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .transacting(trx)
                    .then((response: any) => {
                        var entriesValue = 0.0;
                        // Empty condition
                        if (response.length === 0) throw "NO_CONFIG_SET"
                        else {
                            response.forEach((element: any) => {
                                entriesValue += element.value;
                            })
                        }

                        return entriesValue;
                    })

                const expenses = await app.database("payment")
                    .where("date", ">=", initialDate)
                    .where("date", "<", finalDate)
                    .transacting(trx)
                    .then((response: any) => {
                        var expensesValue = 0;

                        response.forEach((element: any) => {
                            if (element.parcel) expensesValue += element.parcel_value;
                            else expensesValue += element.value
                        })

                        return expensesValue;
                    })

                if (entriesValue < expenses) throw "NO_CASH";

                var data = {};

                if (paymentMethod === "Crédito") {
                    data = {
                        category,
                        description,
                        title,
                    }
                }
                else {
                    data = {
                        category,
                        date: new Date(date),
                        description,
                        paymentMethod,
                        title,
                        value: globalFunctions.formatMoney(value)
                    }
                }

                await app.database("payment")
                    .where({ id: idPayment })
                    .first()
                    .update(data)
                    .transacting(trx)
            })
                .then(() => {
                    app.io.emit("NEW_PAYMENT_REGISTED");
                    res.status(200).send("Registro atualizado!");
                })
        }
        catch (error: any) {
            if (error === "NO_CATEGORY") return res.status(404).send("Erro: está faltando um parâmetro para atualização deste registro.");
            else if (error === "EMPTY_FIELD") return res.status(404).send("Erro: é necessário preencher os campos obrigatórios para atualizar este registro.");
            else if (error === "INVALID_CATEGORY") return res.status(404).send("Erro: categoria inválida.");
            else if (error === "INVALID_PAYMENT") return res.status(404).send("Erro: forma de pagamento inválida.");
            else if (error === "NO_CASH") return res.status(404).send("Não foi possível registrar este gasto, pois as despesas superam as entradas.");
            else return res.status(500).send("Erro interno: contate o administrador do sistema.");
        }
    }

    return { registerPayment, getPaymentsByMonth, getPayments, getPayment, getAllPaymentValuesByMonth, editPayment, checkPaymentPossible }
})