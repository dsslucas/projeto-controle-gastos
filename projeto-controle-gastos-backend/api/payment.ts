module.exports = ((app: any) => {
    function formatMoney(value: string){
        // Remove "R$" and format decimal
        const formattedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');

        // Remove only pointers, except the last
        const removePointers = formattedValue.replace(/\.(?=[^.]*\.)/g, '');

        const numberFormatted = parseFloat(removePointers).toFixed(2);

        return parseFloat(numberFormatted);
    }

    const registerPayment = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                if (!("category" in req.body) || !("date" in req.body) || !("paymentMethod" in req.body) || !("title" in req.body) || !("value" in req.body)) {
                    throw "NO_CATEGORY";
                }

                for (const [key, value] of Object.entries(req.body)) {
                    if (key !== "description" && (value === "" || value === null || value === undefined)) {
                        console.log("campo vazio ", key, value)
                        throw "EMPTY_FIELD";
                    }

                    if (key === "category" && (value != "Contas" && value != "Investimentos" && value != "Lazer" && value != "Alimentação" && value != "Compras" && value != "Saúde" && value != "Viagens" && value != "Outros")) {
                        console.log("categoria invalida ", key, value)
                        throw "INVALID_CATEGORY";
                    }

                    if (key === "paymentMethod" && (value != "Débito" && value != "Crédito" && value != "Espécie")) {
                        console.log("forma de pagamento invalida ", key, value)
                        throw "INVALID_PAYMENT";
                    }
                }

                const { category, date, description, paymentMethod, title, value } = req.body;

                await app.database("payment")
                    .insert({
                        category,
                        date: new Date(date),
                        description,
                        paymentMethod,
                        title,
                        value: formatMoney(value)
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
        try {
            await app.database.transaction(async (trx: any) => {
                const data = await app.database("payment")
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
                if (!("category" in req.body) || !("date" in req.body) || !("paymentMethod" in req.body) || !("title" in req.body) || !("value" in req.body)) {
                    throw "NO_CATEGORY";
                }

                for (const [key, value] of Object.entries(req.body)) {
                    if (key !== "description" && (value === "" || value === null || value === undefined)) {
                        console.log("campo vazio ", key, value)
                        throw "EMPTY_FIELD";
                    }

                    if (key === "category" && (value != "Contas" && value != "Investimentos" && value != "Lazer" && value != "Alimentação" && value != "Compras" && value != "Saúde" && value != "Viagens" && value != "Outros")) {
                        console.log("categoria invalida ", key, value)
                        throw "INVALID_CATEGORY";
                    }

                    if (key === "paymentMethod" && (value != "Débito" && value != "Crédito" && value != "Espécie")) {
                        console.log("forma de pagamento invalida ", key, value)
                        throw "INVALID_PAYMENT";
                    }
                }

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
                        value: formatMoney(value)
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