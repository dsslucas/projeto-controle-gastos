module.exports = (app: any) => {
    const globalFunctions = app.globalFunctions();

    const registerConfig = async (req: any, res: any) => {
        const { date, values } = req.body;
        try {
            await app.database.transaction(async (trx: any) => {
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
            })
            .then((response: any) => res.status(200).send("Enviado!"))
        }
        catch (error: any) {
            console.error(error)
            res.status(500).send("Não foi possível realizar o registro desta configuração. Contate um administrador.");
        }
    }

    const getConfig = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("config as c")
                    .join("config_entries as ce", "c.id", "ce.idConfig")
                    .transacting(trx)
            })
                .then((response: any) => res.status(200).send(response));
        }
        catch (error: any) {
            res.status(500).send("Não foi possível realizar a consulta. Tente novamente mais tarde.");
        }
    }

    const editConfig = (req: any, res: any) => {

    }

    return { registerConfig, getConfig, editConfig }
}