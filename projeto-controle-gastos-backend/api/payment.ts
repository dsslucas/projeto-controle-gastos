module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();

    function checkConditions(requestBody: object) {
        if (!("category" in requestBody) || !("date" in requestBody) || !("paymentMethod" in requestBody) || !("title" in requestBody) || !("value" in requestBody)) {
            throw "NO_CATEGORY";
        }

        for (const [key, value] of Object.entries(requestBody)) {
            if (key !== "description" && (value === "" || value === null || value === undefined)) {
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

                const { category, date, description, paymentMethod, title, value } = req.body;

                await app.database("payment")
                    .insert({
                        category,
                        date: new Date(date),
                        description,
                        paymentMethod,
                        title,
                        value: globalFunctions.formatMoney(value)
                    })
                    .transacting(trx)

            })
                .then(() => {
                    app.io.emit("NEW_PAYMENT_REGISTED");
                    res.status(200).send("Registro salvo!");
                })
        }
        catch (error: any) {
            if (error === "NO_CATEGORY") return res.status(404).send("Erro: está faltando um parâmetro para envio deste registro.");
            else if (error === "EMPTY_FIELD") return res.status(404).send("Erro: é necessário preencher os campos obrigatórios para salvar este registro.");
            else if (error === "INVALID_CATEGORY") return res.status(404).send("Erro: categoria inválida.");
            else if (error === "INVALID_PAYMENT") return res.status(404).send("Erro: forma de pagamento inválida.");
            else return res.status(500).send("Erro interno: contate o administrador do sistema.");
        }
    }

    const getPayments = async (req: any, res: any) => {
        const {category, paymentMethod} = req.query;
        try {
            await app.database.transaction(async (trx: any) => {
                const data = await app.database("payment")
                    .where((builder: any) => {
                        if(category) builder.where("category", category);
                        else if(paymentMethod) builder.where("paymentMethod", paymentMethod);
                        else builder.whereNotNull('category')
                    })
                    .orderBy("date", "asc")
                    .transacting(trx)
                    .then((response: any) => {
                        response.forEach((element: any) => {
                            let year = element.date.getFullYear();
                            let month = String(element.date.getMonth() + 1).padStart(2, '0');
                            let day = String(element.date.getDate()).padStart(2, '0');
                            let hour = String(element.date.getHours()).padStart(2, '0');
                            let minute = String(element.date.getMinutes()).padStart(2, '0');

                            element.date = `${day}/${month}/${year} ${hour}:${minute}`;
                            element.value = element.value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' });
                        })
                        return response;
                    });
                return data;
            })
                .then((response: any) => res.status(200).send(response));
        }
        catch (error: any) {
            res.status(500).send("Erro interno. Contate o administrador do sistema.");
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
                    .then((response: any) => {
                        let year = response.date.getFullYear();
                        let month = String(response.date.getMonth() + 1).padStart(2, '0');
                        let day = String(response.date.getDate()).padStart(2, '0');
                        let hour = String(response.date.getHours()).padStart(2, '0');
                        let minute = String(response.date.getMinutes()).padStart(2, '0');

                        if (response.description === "") response.description = "-";
                        response.date = `${year}-${month}-${day}T${hour}:${minute}`;
                        response.value = response.value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' });
                        return response;
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

        try {
            await app.database.transaction(async (trx: any) => {
                checkConditions(req.body);

                const { category, date, description, paymentMethod, title, value } = req.body;

                await app.database("payment")
                    .where({ id: idPayment })
                    .first()
                    .update({
                        category,
                        date: new Date(date),
                        description,
                        paymentMethod,
                        title,
                        value: globalFunctions.formatMoney(value)
                    })
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
            else return res.status(500).send("Erro interno: contate o administrador do sistema.");
        }
    }

    return { registerPayment, getPayments, getPayment, editPayment }
})