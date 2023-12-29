module.exports = ((app: any) => {
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

                const {category, date, description, paymentMethod, title, value} = req.body;

                const currentTime = new Date();
                //.setHours(currentTime.getHours()).setMinutes(currentTime.getMinutes()).setSeconds(currentTime.getSeconds())

                await app.database("payment")
                    .insert({
                        category,
                        date: new Date(date),
                        description,
                        paymentMethod,
                        title,
                        value: parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'))
                    })
                    .transacting(trx)

            })
                .then(() => res.status(200).send("Registro salvo!"))
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
                    .transacting(trx)
                    .then((response: any) => {
                        response.forEach((element: any) => {
                            element.date = element.date.toLocaleString("pt-BR");
                            element.value = element.value.toLocaleString("pt-BR", {style: 'currency', currency: 'BRL'});
                        })
                        return response;
                    });
                return data;
            })
            .then((response: any) => res.status(200).send(response));
        }
        catch(error: any){
            res.status(500).send("Erro interno. Contate o administrador do sistema.");
        }
    }

    const getPayment = async (req: any, res: any) => {
        const id = req.params.id;

        try {
            await app.database.transaction(async (trx: any) => {
                const data = await app.database("payment")
                    .where({id})
                    .first()                    
                    .transacting(trx)
                    .then((response: any) => {
                        if(response.description === "") response.description = "-";
                        response.date = new Date(response.date).toISOString().split('T')[0];
                        return response;
                    });

                return data;
            })
            .then((response: any) => res.status(200).send(response))
        }
        catch(error: any){
            res.status(500).send("Erro interno. Contate o administrador do sistema.");
        }
    }

    const editPayment = (req: any, res: any) => {
        res.status(200).send("Opa joia")
    }

    return { registerPayment, getPayments, getPayment, editPayment }
})