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

                await app.database("payment")
                    .insert({
                        category,
                        date: new Date(date),
                        description,
                        paymentMethod,
                        title,
                        value
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

    const getPayment = (req: any, res: any) => {
        res.status(200).send("Opa bao")
    }

    const editPayment = (req: any, res: any) => {
        res.status(200).send("Opa joia")
    }

    return { registerPayment, getPayment, editPayment }
})