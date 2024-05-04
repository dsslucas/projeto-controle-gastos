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

    // TABELA PARA REGISTRAR
    // INVESTIMENTO
    // NOME
    // CATEGORIA (CDB, LCI/LCA)
    // PERCENTUAL CDI
    // DATA INICIAL
    // DATA FINAL
    // VALOR INICIAL
    // VALOR BRUTO
    // OBSERVACAO
    // INVESTIMENTO COM RESGATE (BOOLEANO)

    // RESGATE
    // ID INVESTIMENTO
    // VALOR
    // IOF
    // DATA RESGATE

    // RENDIMENTO
    // ID
    // ID INVESTIMENTO
    // NOME
    // PERCENTUAL (NÃO OBRIGATÓRIO)
    // 

    const createInvestment = async (req: any, res: any) => {
        console.log(req.body)
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
                const idInvestment = await app.database("investments")
                    .insert({
                        name: title,
                        category: parseInt(category),
                        initialValue: globalFunctions.formatMoney(initialValue),
                        initialDate: new Date(initialDate),
                        finalDate: new Date(finalDate),
                        observation: observation
                    })
                    .returning("id")
                    .transacting(trx)

                await rentabilityWithFilter.forEach(async (element: any) => {
                    await app.database("investment_rentability")
                        .insert({
                            idInvestment: idInvestment[0].id,
                            name: element.name,
                            checked: element.checked,
                            type: element.type,
                            percentage: element.percentage == "" ? 0 : globalFunctions.formatPercentage(element.percentage)
                        })
                        .transacting(trx)
                })
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
                console.log(data); // Aqui você pode processar os dados conforme necessário
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


        console.log(valorTotalInvestimento)

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

    return { testeInvestimento, createInvestment }
})