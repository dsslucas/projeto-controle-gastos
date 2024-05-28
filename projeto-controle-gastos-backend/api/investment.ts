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
                    // response.forEach((element: any) => {
                    //     element.percentage = `${element.percentage}%`
                    // })
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
            const investments = await app.database.transaction(async (trx) => {
                return await app.database("investment as i")
                    .join("investments as is", "i.idInvestment", "is.id")
                    .select("i.id", "is.name", "i.initialValue", "i.initialDate", "i.finalDate", "i.observation", "is.category")
                    .where("i.id", "=", 43)
                    .orderBy("i.initialDate", "asc")
                    .transacting(trx)
                    .then(async (response: any) => {
                        await response.forEach(async (element: any) => {
                            element.rentability = await getRentability(element.id, trx);
                        })

                        return response;
                    });
            });

            const formattedInvestments = [];
            var value = 0;
            for (const investment of investments) {
                let formattedInvestment = investment;
                value = 0;

                if (investment.category === 1) {
                    formattedInvestment.category = "CDB";
                } else if (investment.category === 2) {
                    formattedInvestment.category = "LCI/LCA";
                } else if (investment.category === 3) {
                    formattedInvestment.category = "Poupança";
                } else {
                    formattedInvestment.category = "Outro";
                }

                formattedInvestment.initialValue = await globalFunctions.formatMoneyNumberToString(investment.initialValue);
                formattedInvestment.initialDate = await globalFunctions.convertDateToLocation(investment.initialDate);
                formattedInvestment.finalDate = await globalFunctions.convertDateToLocation(investment.finalDate);

                const initialValueWithoutMoneyFormat = await globalFunctions.formatMoney(investment.initialValue);

                var value = 0;
                var rentabilityInfo = "";
                if (Array.isArray(formattedInvestment.rentability) && formattedInvestment.rentability.length > 0) {
                    for (const element of formattedInvestment.rentability) {

                        if (rentabilityInfo != "") rentabilityInfo += ` + `;

                        if (element.name.includes("CDI")) rentabilityInfo += `${element.percentage.toLocaleString("pt-br")}% do CDI`;
                        else if (element.name.includes("IPCA")) rentabilityInfo += element.name;
                        else if (element.name.includes("tax")) rentabilityInfo += `${element.percentage.toLocaleString("pt-br")}% ${element.type}`;

                        try {
                            if(formattedInvestment.rentability.some((item: any) => item.name === "tax")){
                                var countPercentage = 0;
                                formattedInvestment.rentability.filter((item: any) => item.name === "tax").forEach((element: any) => {
                                    countPercentage += Number(element.percentage / 100);
                                })

                                value += await calculateInvestmentValue(initialValueWithoutMoneyFormat, formattedInvestment.initialDate, element.name, formattedInvestment.finalDate, countPercentage, formattedInvestment.name);
                            }
                            else {
                                value += await calculateInvestmentValue(initialValueWithoutMoneyFormat, formattedInvestment.initialDate, element.name, formattedInvestment.finalDate, element.percentage, formattedInvestment.name);
                            }                            
                        } catch (error) {
                            console.error(`Erro ao calcular rentabilidade para o investimento ${investment.name}: ${error}`);
                            formattedInvestment.currentValue = 0; // Ou qualquer outro valor padrão que você deseje
                        }
                    }

                    formattedInvestment.currentValue = await globalFunctions.formatMoneyNumberToString(value);
                    formattedInvestment.rentabilityInfo = rentabilityInfo;
                }
                else {
                    formattedInvestment.currentValue = 0;
                }

                if (investment.observation === "" || investment.observation === null) {
                    formattedInvestment.observation = "-";
                } else {
                    formattedInvestment.observation = investment.observation;
                }

                formattedInvestments.push(formattedInvestment);
            }

            res.status(200).send({
                data: formattedInvestments,
                columns: ["Nome", "Categoria", "Data inicial", "Data final", "Valor inicial", "Valor atual", "Rentabilidade", "Observação"]
            });
        } catch (error) {
            console.error(error);
            res.status(400).send("Erro ao buscar a lista de investimentos.");
        }
    };

    const calculateInvestmentValue = async (initialValue, initialDate, category, finalDate, percentage, name) => {
        let valorTotalInvestimento = initialValue;
        let serie = 0;
        /*
        var valorInicialInvestimento = 520.41;
        var valorTotalInvestimento = 520.41;
        const dataInicial = new Date("2024-04-10");
        const dataFinal = new Date();
        const percentualCdi = 1;
        const serie = 11;
        */

        // 11 - SELIC
        // 12 - CDI
        // 433 - IPCA

        if (category == "CDB") {
            serie = 11;
        } else if (category == "CDI") {
            serie = 12;
        } else if (category == "IPCA") {
            serie = 433;
        } else if (category == "tax") {
            //return 0;
        }

        var url = "";

        try {
            if (serie === 11 || serie === 12) {
                /*
                url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json&dataInicial=${initialDate}&dataFinal=${finalDate}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Erro ao obter os dados da API');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    data.forEach((element, index) => {
                        if (index != 0 && data.length - 1 != index) {
                            valorTotalInvestimento *= 1 + (Number(element.valor) / 100) * Number(percentage / 100);
                        }
                    });
                }
                */
            }
            else if (serie === 433) {
                const yearDifference = await globalFunctions.calculateYearDifference(initialDate, finalDate);

                if (yearDifference >= 1) {

                    const initialDateInvestment = new Date(await globalFunctions.convertDateBrToUs(initialDate));
                    const finalDateInvestment = new Date();

                    const result = [];

                    // Função auxiliar para adicionar um período ao resultado
                    async function addPeriod(year, startMonth, startDay, endMonth, endDay) {
                        const startDate = new Date(year, startMonth, startDay);
                        const endDate = new Date(year, endMonth, endDay);

                        // Calcular o número de meses entre as datas
                        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
                        months += endDate.getMonth() - startDate.getMonth();

                        // Se a data final é após o dia de início do mês
                        if (endDate.getDate() >= startDate.getDate()) {
                            months++;
                        }

                        // result.push({
                        //     year: year,
                        //     startDate,
                        //     endDate,
                        //     months: months
                        // });

                        const initialDateYearInvestment = await globalFunctions.convertDateToLocation(startDate);
                        const finalDateYearInvestment = await globalFunctions.convertDateToLocation(endDate);

                        url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json&dataInicial=${initialDateYearInvestment}&dataFinal=${finalDateYearInvestment}`;

                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error('Erro ao obter os dados da API');
                        }
                        const data = await response.json();

                        var percentIpca= 0;
                        var totalTax = 0;
                        var totalYearRentability = 0;
                        if (Array.isArray(data)) {
                            console.log("COMPRIMENTO: ", data.length)
                            data.forEach(async (element, index) => {
                                var valor = parseFloat(element.valor).toFixed(2);
                                percentIpca += Number(valor);
                            });
                            
                            var percentIpcaArredondated = Number(percentIpca.toFixed(2));

                            console.log(`DATA: ${initialDateYearInvestment} - ${finalDateYearInvestment}`)
                            console.log("PERCENTUAL IPCA: ", percentIpcaArredondated);
                            console.log("TAXA: ", percentage)
                            if(data.length === 12){
                                totalTax = percentIpcaArredondated + percentage;
                                totalYearRentability = (1 + (totalTax/100));
                                var valueInvestment = valorTotalInvestimento * totalYearRentability;
                                console.log(`TOTAL INVESTIMENTO: ${valueInvestment}`);
                            }
                            else {
                                var proportionalIpca = (((percentIpcaArredondated / 100) * data.length)/12);
                                totalTax = proportionalIpca + percentage;
                                totalYearRentability = (1 + totalTax)^(data.length/12);

                                var valueInvestment = valorTotalInvestimento * totalYearRentability;

                                console.log("IPCA PROPORCIONAL: ", proportionalIpca)
                                
                                console.log("TAXA TOTAL: ", totalTax)
                                console.log("rentabilidade total: ", totalYearRentability)

                                console.log(`TOTAL INVESTIMENTO: ${valueInvestment}`);

                                //console.log("TAXA PROPORCIONAL DO IPCA: ", proportionalIpca)
                            }
                        }

                        console.log("\n")
                    }

                    // Calcular períodos
                    if (initialDateInvestment.getFullYear() === finalDateInvestment.getFullYear()) {
                        // Se as datas estão no mesmo ano
                        addPeriod(
                            initialDateInvestment.getFullYear(),
                            initialDateInvestment.getMonth(),
                            initialDateInvestment.getDate(),
                            finalDateInvestment.getMonth(),
                            finalDateInvestment.getDate()
                        );
                    } else {
                        // Período do primeiro ano
                        addPeriod(
                            initialDateInvestment.getFullYear(),
                            initialDateInvestment.getMonth(),
                            initialDateInvestment.getDate(),
                            11,
                            31
                        );

                        // Períodos dos anos completos entre as duas datas
                        for (let year = initialDateInvestment.getFullYear() + 1; year < finalDateInvestment.getFullYear(); year++) {
                            addPeriod(
                                year,
                                0,
                                1,
                                11,
                                31
                            );
                        }

                        // Período do último ano
                        addPeriod(
                            finalDateInvestment.getFullYear(),
                            0,
                            1,
                            finalDateInvestment.getMonth(),
                            finalDateInvestment.getDate()
                        );
                    }
                }
                else {
                    valorTotalInvestimento = 0;
                }
            }
            else {
                valorTotalInvestimento = 0;
            }

            console.log("VALOR TOTAL DO INVESTIMENTO: ", valorTotalInvestimento)
            return valorTotalInvestimento;
        } catch (error) {
            console.error('Erro:', error);
            return 0;
        }

        /* 
        
        const IOF: number = calcularIOF(valorInicialInvestimento, dataInicial, new Date("2024-04-29"));

        console.log("Valor do IOF a pagar:", IOF.toFixed(2)); // Exibe o valor do IOF com duas casas decimais

        res.status(200).send(`Valor total do investimento: ${valorTotalInvestimento}`)
        
        */
    };


    // CDB
    /*
    const calculoRentabilidade = async (req: any, res: any) => {
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

    return { registerInvestment, allInfoInvestmentByIdPayment, createInvestment, getAllInvestments, listInvestments, teste }
})