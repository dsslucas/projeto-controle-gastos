module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();

    function calcularIOF(valorResgate: number, dataAplicacao: Date, dataResgate: Date): number {
        const umDia: number = 24 * 60 * 60 * 1000; // milissegundos em um dia
        const maximoDiasIOF: number = 30; // Máximo de 30 dias com IOF
        const valorBruto: number = 523.13; // Valor bruto do investimento

        // Calcula o número de dias corridos desde a aplicação até o resgate
        const diasDecorridos: number = Math.round(Math.abs((dataResgate.getTime() - dataAplicacao.getTime()) / umDia));

        // Se o resgate ocorrer após 30 dias da aplicação, não há IOF
        if (diasDecorridos > maximoDiasIOF) {
            return 0;
        }

        // Calcula o valor do IOF de acordo com o tempo decorrido
        const percentualIOF: number = 1 - (diasDecorridos / maximoDiasIOF);
        const valorIOF: number = (valorBruto - valorResgate) * percentualIOF;

        return valorIOF;
    }

    async function registerInvestment(id: any, idPayment: any, title: string, category: string, initialValue: string, initialDate: string, finalDate: string, rentability: any, observation: string, trx: any) {
        var idInvestment = 0;

        try {
            if (id === null) {
                idInvestment = (await app.database("investments")
                    .insert({
                        name: title,
                        category: parseInt(category),
                        idPayment: parseInt(idPayment)
                    })
                    .returning("id")
                    .transacting(trx))[0].id;
            }
            else {
                idInvestment = id;
            }

            const investmentIdCreated = (await app.database("investment")
                .insert({
                    idInvestment: idInvestment,
                    idPayment: idPayment,
                    initialValue: globalFunctions.formatMoney(initialValue),
                    initialDate: new Date(initialDate),
                    finalDate: new Date(finalDate),
                    observation: observation
                })
                .transacting(trx))[0].id;

            await rentability.forEach(async (element: any) => {
                await app.database("investment_rentability")
                    .insert({
                        idInvestment: investmentIdCreated,
                        name: element.name,
                        checked: element.checked,
                        type: element.type,
                        percentage: element.percentage == "" ? 0 : globalFunctions.formatPercentage(element.percentage)
                    })
                    .transacting(trx)
            })
        }
        catch (e: any) {
            console.error(e);
        }
    }

    const createInvestment = async (req: any, res: any) => {
        const { title, category, initialValue, initialDate, finalDate, rentability, observation } = req.body;

        if (title === null || title === undefined || title === "") {
            return res.status(404).send("Informe o título do investimento.");
        }

        if (category === null || category === undefined || category === "") {
            return res.status(404).send("Informe a categoria do investimento.");
        }

        if (!Array.isArray(rentability) || rentability == null || rentability == undefined || rentability.length == 0) {
            return res.status(404).send("Rentabilidade não informada.");
        }

        if (Array.isArray(rentability) && rentability.length > 0) {
            if (!rentability.some((element: any) => element.checked)) {
                return res.status(404).send("Selecione ao menos um modo de rentabilidade.");
            }

            else if (rentability.some(item => { return item.checked && (item.percentage === '' || item.percentage === '%') && item.name !== 'IPCA' })) {
                return res.status(404).send("É necessário informar o percentual para a rentabilidade.");
            }
        }

        if (initialDate === null || initialDate === undefined || initialDate === "") {
            return res.status(404).send("Informe a data inicial do investimento.");
        }

        if (finalDate === null || finalDate === undefined || finalDate === "") {
            return res.status(404).send("Informe a data final do investimento.");
        }

        if (new Date(initialDate) > new Date(finalDate)) {
            return res.status(404).send("A data inicial deste investimento não pode ser maior que a data final.");
        }

        const rentabilityWithFilter = rentability.filter((element: any) => element.checked)

        try {
            await app.database.transaction(async (trx: any) => {
                return registerInvestment(null, null, title, category, initialValue, initialDate, finalDate, rentabilityWithFilter, observation, trx)
            })
                .then((response: any) => res.status(200).send("Deu bom!"))
                .catch((error: any) => {
                    console.error(error)
                    res.status(400).send("Não cadastrou.")
                })
        }
        catch (e: any) {
            res.status(400).send("Deu ruim")
        }
    }

    // Rentability investments
    const rentabilityInvestments = async (idInvestment: number, trx: any) => {
        return await app.database("investment_rentability")
            .where({ idInvestment })
            .transacting(trx)
    }

    // Investments list
    const listInvestments = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("investments")
                    .transacting(trx)
                    .then((response: any) => {
                        const returnData = [];
                        response.forEach(async (element: any) => {
                            returnData.push({
                                value: element.id.toString(),
                                text: element.name,
                                category: element.category.toString()
                                //...element,
                                //rentability: await rentabilityInvestments(element.id, trx)
                            })
                        });

                        returnData.push({
                            value: (-1).toString(),
                            text: "Não possuo",
                            category: (-1).toString()
                        });

                        return returnData
                    })
            })
                .then((response: any) => res.status(200).send(response))
                .catch((error: any) => {
                    console.error(error)
                    res.status(400).send("Erro ao buscar a lista de investimentos.")
                })
        }
        catch (e: any) {
            res.status(400).send("Erro ao buscar a lista de investimentos.")
        }
    }

    const allInfoInvestmentByIdPayment = async (idPayment: number, trx: any) => {
        try {
            return await app.database("investments as i")
                .join("investment as i_simple", "i_simple.idInvestment", "i.id")
                .select("i.id", "i_simple.id as idInvestment", "i_simple.idPayment", "i.name", "i.category", "i_simple.initialValue", "i_simple.initialDate", "i_simple.finalDate")
                .where("i_simple.idPayment", idPayment)
                .first()
                .transacting(trx)
                .then(async (response: any) => {
                    return {
                        ...response,
                        initialDate: globalFunctions.formatDate(response.initialDate),
                        finalDate: globalFunctions.formatDate(response.finalDate),
                        rentability: await getRentability(response.idInvestment, trx)
                    };
                })

        }
        catch (e: any) {
            console.error(e);
        }
    }

    const getRentability = async (idInvestment: number, trx: any) => {
        try {
            return await app.database("investment_rentability")
                .where({ idInvestment })
                .transacting(trx)
                .then((response: any) => {
                    response.forEach((element: any) => {
                        percentage: `${element.percentage}%`
                    })
                    return response;
                })

        }
        catch (e: any) {
            console.error(e);
        }
    }

    const getUniqueInvestment = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("investments")
                    .transacting(trx)
                    .then((response: any) => {
                        const returnData = [];
                        response.forEach(async (element: any) => {
                            returnData.push({
                                value: element.id.toString(),
                                text: element.name
                                //...element,
                                //rentability: await rentabilityInvestments(element.id, trx)
                            })
                        });

                        returnData.push({
                            value: (-1).toString(),
                            text: "Não possuo"
                        });

                        return returnData
                    })
            })
                .then((response: any) => res.status(200).send(response))
                .catch((error: any) => {
                    console.error(error)
                    res.status(400).send("Erro ao buscar a lista de investimentos.")
                })
        }
        catch (e: any) {
            res.status(400).send("Erro ao buscar a lista de investimentos.")
        }
    }

    // Table within investments registrated
    const getAllInvestments = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("investment as i")
                    .join("investments as is", "i.idInvestment", "is.id")
                    .select("is.id", "is.name", "i.initialValue", "i.initialDate", "i.finalDate", "i.observation", "is.category")
                    .orderBy("i.initialDate", "asc")
                    .transacting(trx)
                    .then((response: any) => {
                        response.forEach(async (element: any) => {
                            if(element.category === 1) element.category = "CDB"
                            else if(element.category === 2) element.category = "LCI/LCA"
                            else if(element.category === 3) element.category = "Poupança"
                            else element.category = "Outro"

                            element.initialValue = await globalFunctions.formatMoneyNumberToString(element.initialValue);
                            element.currentValue = await globalFunctions.formatMoneyNumberToString(12345);

                            element.initialDate = await globalFunctions.convertDateToLocation(element.initialDate);
                            element.finalDate = await globalFunctions.convertDateToLocation(element.finalDate);

                            if(element.observation === "" || element.observation === null) element.observation = "-";
                            else element.observation;
                        })

                        return {
                            data: response,
                            columns: ["Nome", "Categoria", "Data inicial", "Data final", "Valor inicial", "Valor atual", "Observação"]
                        }
                    })
            })
                .then((response: any) => res.status(200).send(response))
                .catch((error: any) => {
                    console.error(error)
                    res.status(400).send("Erro ao buscar a lista de investimentos.")
                })
        }
        catch (e: any) {
            res.status(400).send("Erro ao buscar a lista de investimentos.")
        }
    }

    const testeInvestimento = async (req: any, res: any) => {
        var valorInicialInvestimento = 520.41;
        var valorTotalInvestimento = 520.41;
        const dataInicial = new Date("2024-04-10");
        const dataFinal = new Date("2026-04-01");
        const percentualCdi = 1;
        const serie = 11;

        const diferencaDias = globalFunctions.calcDateDiff(dataInicial, dataFinal);

        // 11 - SELIC
        // 12 - CDI
        // 433 - IPCA

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json&dataInicial=${dataInicial.toLocaleDateString("pt-br")}&dataFinal=${dataFinal.toLocaleDateString("pt-br")}`;

        await fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    data.forEach((element: any, index: number) => {
                        if (index != 0 && data.length - 1 != index) {
                            valorTotalInvestimento *= 1 + (element.valor / 100) * percentualCdi;
                        }
                    })
                }
            })
            .catch(error => {
                console.error('Erro:', error);
            });

        const IOF: number = calcularIOF(valorInicialInvestimento, dataInicial, new Date("2024-04-29"));

        console.log("Valor do IOF a pagar:", IOF.toFixed(2)); // Exibe o valor do IOF com duas casas decimais

        res.status(200).send(`Valor total do investimento: ${valorTotalInvestimento}`)
    }

    /* CDB */
    /*
    const testeInvestimento = async (req: any, res: any) => {
        var valorTotalInvestimento = 7000;
        const dataInicial = new Date("2022-04-29");
        const dataFinal = new Date("2025-05-15");
        const percentualCdi = 0.84;
        const serie = 433;
        const percentAoAno = 0.0645;
        const percentAoDia = (1+percentAoAno)^(1/365);
    
        // 11 - SELIC
        // 12 - CDI
        // 433 - IPCA
    
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json&dataInicial=${dataInicial.toLocaleDateString("pt-br")}&dataFinal=${dataFinal.toLocaleDateString("pt-br")}`;       
    
        await fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API');
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Aqui você pode processar os dados conforme necessário
                if(Array.isArray(data)){
                    data.forEach((element: any, index: number) => {
                        if(index != 0 && data.length - 1 != index){
                            const jurosPrefixado = valorTotalInvestimento * percentAoDia;
                            console.log(percentAoDia);
                            const jurosPosfixado = valorTotalInvestimento * (element.valor / 100) * percentualCdi;
                            valorTotalInvestimento += jurosPosfixado + jurosPrefixado;
                        }
                    })
                }
            })
            .catch(error => {
                console.error('Erro:', error);
            });
    
        console.log(valorTotalInvestimento)
    
        res.status(200).send(`Valor total do investimento: ${valorTotalInvestimento}`)
    }   
     */

    const teste = async (req: any, res: any) => {
        const { idInvestment, initialValue, initialDate, finalDate } = req.body;

        try {
            const id = (await app.database("investment")
                .insert({
                    idInvestment: Number(idInvestment),
                    initialValue: Number(initialValue),
                    initialDate: new Date(initialDate),
                    finalDate: new Date(finalDate)
                })
                .returning("id")
            )[0].id;

            await app.database("investment_rentability")
                .insert({
                    idInvestment: Number(id),
                    name: "CDI",
                    checked: true,
                    percentage: 100
                })

            res.status(200).send("opa joia")
        }
        catch (e: any) {
            console.error(e)
            res.status(400).send("deu ruim")
        }




    }

    return { testeInvestimento, registerInvestment, allInfoInvestmentByIdPayment, createInvestment, getAllInvestments, listInvestments, teste }
})