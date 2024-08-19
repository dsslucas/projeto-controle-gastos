module.exports = (app: any) => {
    const globalFunctions = app.globalFunctions();

    const checkIfExistsMonthConfig = async (date: Date, trx: any) => {
        await app.database("config")
            .where({ date })
            .transacting(trx)
            .then((response: any) => {
                if (response.length > 0) return true;
                else return false;
            })
    }

    const registerConfig = async (req: any, res: any) => {
        const { date, values } = req.body;

        if (date === undefined || date === null || date === "") return res.status(404).send("A data de registro não foi informada.")

        if (values === undefined || values === null) return res.status(404).send("As fontes de receita não foram informadas.")

        const { initialDate } = globalFunctions.getBetweenDates(date);

        try {
            await app.database.transaction(async (trx: any) => {
                const currentDate = new Date();
                if (currentDate < initialDate) throw "NOT_CURRENT_DATE";

                if(checkIfExistsMonthConfig(date, trx)) throw "EXISTS_CONFIG";
                else {
                    const idConfig = await app.database("config")
                        .insert({
                            date: new Date(date)
                        })
                        .returning("id")
                        .transacting(trx)

                    if (values.length === 0) throw "NO_VALUES"
                    else await values.forEach(async (element: any) => {
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
            if (error === "NOT_CURRENT_DATE") return res.status(404).send("Não é possível registrar dados de meses seguintes.")
            else if (error === "EXISTS_CONFIG") res.status(404).send("Já existe configuração registrada para este mês.");
            else if(error === "NO_VALUES") res.status(404).send("As fontes de receita não foram informadas.")
            else res.status(500).send("Não foi possível realizar o registro desta configuração. Contate um administrador.");
        }
    }

    const getConfig = async (req: any, res: any) => {
        const { date } = req.query;

        const { initialDate, finalDate } = globalFunctions.getBetweenDates(date.substring(0, 7));

        try {
            await app.database.transaction(async (trx: any) => {
                const currentDate = new Date();
                if(currentDate < initialDate) throw "NOT_CURRENT_DATE";

                return await app.database("config as c")
                    .join("config_entries as ce", "c.id", "ce.idConfig")
                    .where("c.date", ">=", initialDate)
                    .where("c.date", "<", finalDate)
                    .select("c.id", "ce.id as idConfigEntry", "ce.value", "ce.description")
                    .transacting(trx)
                    .then(async (response: any) => {
                        const inputValues = []
                        var value = 0;
                        var id = null;

                        response.forEach(async(element: any) => {
                            id = element.id;
                            value += element.value;

                            inputValues.push({
                                id: element.idConfigEntry,
                                idConfig: element.id,
                                description: element.description,
                                value: await globalFunctions.formatMoneyNumberToString(element.value)
                            })
                        })

                        return {
                            id,
                            value: await globalFunctions.formatMoneyNumberToString(value),
                            inputValues
                        }
                    })
            })
                .then((response: any) => res.status(200).send(response));
        }
        catch (error: any) {
            if(error === "NOT_CURRENT_DATE") return res.status(404).send("Não é possível consultar os dados de meses seguintes.")
            else return res.status(500).send("Não foi possível realizar a consulta. Tente novamente mais tarde.");
        }
    }

    const editConfig = async (req: any, res: any) => {
        const { id } = req.params;
        const { values } = req.body;

        if(values === undefined || values === null || values === "") return res.status(404).send("Os valores não foram informados.")

        try {
            await app.database.transaction(async (trx: any) => {
                if (values.length === 0) throw "NO_ENTRIES"
                else {
                    await values.forEach(async (element: any) => {
                        if (element.id === null) {
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
            if(error === "NOT_CURRENT_DATE") return res.status(404).send("Não é possível consultar os dados de meses seguintes.")
            else if (error === "NO_ENTRIES") return res.status(404).send("Deve-se existir, ao menos, uma fonte de receita.");
            else return res.status(500).send("Não foi possível realizar a alteração. Tente novamente mais tarde.");
        }
    }

    return { checkIfExistsMonthConfig, registerConfig, getConfig, editConfig }
}