module.exports = (app: any) => {
    const globalFunctions = app.globalFunctions();

    const registerConfig = async (req: any, res: any) => {
        const { date, values } = req.body;

        try {
            await app.database.transaction(async (trx: any) => {
                const existsMonthConfig = await app.database("config")
                    .where({ date })
                    .transacting(trx)
                    .then((response: any) => {
                        if (response.length > 0) return true;
                        else return false;
                    })

                if (existsMonthConfig) throw "EXISTS_CONFIG";
                else {
                    const idConfig = await app.database("config")
                        .insert({
                            date: new Date(date)
                        })
                        .returning("id")
                        .transacting(trx)

                    await values.forEach(async (element: any) => {
                        await app.database("config_entries")
                            .insert({
                                idConfig: idConfig[0].id,
                                description: element.description,
                                value: globalFunctions.formatMoney(element.value)
                            })
                            .transacting(trx)
                    })
                }
            })
                .then((response: any) => res.status(200).send("Enviado!"))
        }
        catch (error: any) {
            if (error === "EXISTS_CONFIG") res.status(404).send("Já existe configuração registrada para este mês.");
            else res.status(500).send("Não foi possível realizar o registro desta configuração. Contate um administrador.");
        }
    }

    const getConfig = async (req: any, res: any) => {
        const { date } = req.query;

        const { initialDate, finalDate } = globalFunctions.getBetweenDates(date.substring(0, 7));

        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("config as c")
                    .join("config_entries as ce", "c.id", "ce.idConfig")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .select("c.id", "ce.id as idConfigEntry", "ce.value", "ce.description")
                    .transacting(trx)
                    .then((response: any) => {
                        const inputValues = []
                        var value = 0;
                        var id = null;

                        console.log(response)

                        response.forEach((element: any) => {
                            id = element.id;
                            value += element.value;

                            inputValues.push({
                                id: element.idConfigEntry,
                                idConfig: element.id,
                                description: element.description,
                                value: element.value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })
                            })
                        })

                        return {
                            id,
                            value: value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' }),
                            inputValues
                        }
                    })
            })
                .then((response: any) => res.status(200).send(response));
        }
        catch (error: any) {
            console.error(error)

            res.status(500).send("Não foi possível realizar a consulta. Tente novamente mais tarde.");
        }
    }

    const editConfig = async (req: any, res: any) => {
        const { id } = req.params;
        const { values } = req.body;

        try {
            await app.database.transaction(async (trx: any) => {
                if (values.length === 0) throw "NO_ENTRIES"
                else {
                    await values.forEach(async (element: any) => {
                        if (element.id === null) {
                            console.log(element)
                            // Register new entry
                            await app.database("config_entries")
                                .insert({
                                    idConfig: id,
                                    description: element.description,
                                    value: globalFunctions.formatMoney(element.value)
                                })
                                .transacting(trx)
                        }
                    })
                }
            })
                .then(() => res.status(200).send("Inserção realizada!"))
        }
        catch (error: any) {
            if (error === "NO_ENTRIES") return res.status(404).send("Deve-se existir, ao menos, uma fonte de receita.");
            else return res.status(500).send("Não foi possível realizar a alteração. Tente novamente mais tarde.");
        }
    }

    return { registerConfig, getConfig, editConfig }
}