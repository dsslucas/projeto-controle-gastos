module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();

    function calcularIOF(initialDate: string, initialValue: number, currentValue: number): number {
        const differenceDates = Math.abs(new Date().getTime() - new Date(initialDate).getTime());    
        const applicationDays = Math.ceil(differenceDates / (1000 * 60 * 60 * 24)); 
    
        // Função para calcular a alíquota de IOF com base no número de dias aplicados
        function calcAliquota(days: number): number {
            if (days >= 30) return 0;
            return (30 - days) / 30 * 0.96;  // 96% no primeiro dia, decrescendo até 0% no 30º dia
        }
    
        const aliquotaIOF = calcAliquota(applicationDays);
    
        const rendimentoBruto: number = Number(parseFloat((currentValue - initialValue).toFixed(2)));
        
        const valorIOF: number = aliquotaIOF * rendimentoBruto;
    
        let valorIR: number = 0;
    
        // Cálculo de IR com base no tempo total de aplicação
        if (applicationDays >= 0 && applicationDays <= 180) {
            valorIR = 0.225 * rendimentoBruto;
        } else if (applicationDays >= 181 && applicationDays <= 360) {
            valorIR = 0.20 * rendimentoBruto;
        } else if (applicationDays >= 361 && applicationDays <= 720) {
            valorIR = 0.175 * rendimentoBruto;
        } else if (applicationDays > 720) {
            valorIR = 0.15 * rendimentoBruto;
        }
    
        return Number(parseFloat((valorIOF + valorIR).toFixed(2)));
    }
    
    // Teste
    //const resultado = calcularIOF(new Date('2024-04-10'), 520.41, 539.22);

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

    // Investments list, FOR SELECT
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

    const getInvestmentInfo = async (investments: Array<any>) => {
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

            formattedInvestment.initialDateUS = investment.initialDate;
            formattedInvestment.initialValueWithoutMask = investment.initialValue;

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
                        if (formattedInvestment.rentability.some((item: any) => item.name === "tax")) {
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
                formattedInvestment.currentValueNumber = await globalFunctions.arredondateNumber(value);
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

        return formattedInvestments;
    }

    // Table within investments registrated
    const getAllInvestments = async (req: any, res: any) => {
        try {
            const investments = await app.database.transaction(async (trx) => {
                return await app.database("investment as i")
                    .join("investments as is", "i.idInvestment", "is.id")
                    .select("i.id", "is.name", "i.initialValue", "i.initialDate", "i.finalDate", "i.observation", "is.category")
                    .orderBy("i.initialDate", "asc")
                    .transacting(trx)
                    .then(async (response: any) => {
                        await response.forEach(async (element: any) => {
                            element.rentability = await getRentability(element.id, trx);
                        })

                        return response;
                    });
            });

            const formattedInvestments = await getInvestmentInfo(investments);

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
            }
            else if (serie === 433) {
                const yearDifference = await globalFunctions.calculateYearDifference(initialDate, finalDate);

                console.log(yearDifference);

                if (yearDifference >= 1) {

                    const initialDateInvestment = new Date(await globalFunctions.convertDateBrToUs(initialDate));
                    const finalDateInvestment = new Date();

                    async function addPeriod(year, startMonth, startDay, endMonth, endDay) {
                        const startDate = new Date(year, startMonth, startDay);
                        const endDate = new Date(year, endMonth, endDay);

                        // Calc months between the dates
                        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
                        months += endDate.getMonth() - startDate.getMonth();

                        // Check if final date is after the begin month day
                        if (endDate.getDate() >= startDate.getDate()) {
                            months++;
                        }

                        const initialDateYearInvestment = await globalFunctions.convertDateToLocation(startDate);
                        const finalDateYearInvestment = await globalFunctions.convertDateToLocation(endDate);

                        url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?formato=json&dataInicial=${initialDateYearInvestment}&dataFinal=${finalDateYearInvestment}`;

                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error('Erro ao obter os dados da API');
                        }
                        const data = await response.json();

                        var percentIpca = 0;
                        var totalTax = 0;
                        var totalYearRentability = 0;
                        if (Array.isArray(data)) {
                            data.forEach(async (element, index) => {
                                var valor = parseFloat(element.valor).toFixed(2);
                                percentIpca += Number(valor);
                            });

                            var percentIpcaArredondated = Number(percentIpca.toFixed(2)) / 100;

                            if (data.length === 12) {
                                totalTax = percentIpcaArredondated + percentage;
                                totalYearRentability = (1 + totalTax);
                                valorTotalInvestimento = valorTotalInvestimento * totalYearRentability;
                            }
                            else {
                                totalTax = percentIpcaArredondated + percentage;
                                totalYearRentability = Math.pow((1 + totalTax), (data.length / 12));
                                valorTotalInvestimento = valorTotalInvestimento * totalYearRentability;
                            }
                        }
                    }

                    if (initialDateInvestment.getFullYear() === finalDateInvestment.getFullYear()) {
                        // Same year
                        await addPeriod(initialDateInvestment.getFullYear(), initialDateInvestment.getMonth(), initialDateInvestment.getDate(), finalDateInvestment.getMonth(), finalDateInvestment.getDate());
                    } else {
                        // First year
                        await addPeriod(initialDateInvestment.getFullYear(), initialDateInvestment.getMonth(), initialDateInvestment.getDate(), 11, 31);

                        // Completed years
                        for (let year = initialDateInvestment.getFullYear() + 1; year < finalDateInvestment.getFullYear(); year++) {
                            await addPeriod(year, 0, 1, 11, 31);
                        }

                        // Last year
                        await addPeriod(finalDateInvestment.getFullYear(), 0, 1, finalDateInvestment.getMonth(), finalDateInvestment.getDate());
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
    };

    const calcInvestmentRentabilityByIdInvestment = async (id: number, trx: any) => {
        try {
            return await app.database("investment as i")
                .where("i.idInvestment", "=", id)
                .transacting(trx)
                .then(async (response: any) => {
                    for (let i = 0; i < response.length; i++) {
                        const element = response[i];
                        const rentabilidade = await getRentability(element.id, trx);
                        element.rentability = rentabilidade;
                    }

                    const updatedInvestmentList = await getInvestmentInfo(response);

                    return updatedInvestmentList;
                })
        }
        catch (e: any) {
            console.error(e)
            return null;
        }
    }

    const detailInvestments = async (req: any, res: any) => {
        const { id } = req.params;
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("investments as is")
                    .select("is.id", "is.name", "is.category")
                    .where({ id })
                    .first()
                    .transacting(trx)
                    .then(async (response: any) => {
                        // Investments
                        const investments = await calcInvestmentRentabilityByIdInvestment(response.id, trx);

                        const auxBruteValue = investments.reduce(function (acc, obj) { return acc + obj.currentValueNumber; }, 0);
                        const bruteValue = await globalFunctions.arredondateNumber(auxBruteValue);
                        const calculoIof = calcularIOF(investments[0].initialDateUS, investments[0].initialValueWithoutMask, investments[0].currentValueNumber)
                        console.log("IOF: ", calculoIof);

                        var rentabilityString: string = investments[0].rentabilityInfo;

                        investments.forEach((element: any) =>{
                            if(element.rentabilityInfo != rentabilityString) rentabilityString += element.rentabilityInfo;
                        })

                        return {
                            name: response.name,
                            bruteValue,
                            bruteValueWithMask: await globalFunctions.formatMoneyNumberToString(auxBruteValue),
                            valueAvaliableRescue: bruteValue - calculoIof,
                            valueAvaliableRescueWithMask: await globalFunctions.formatMoneyNumberToString(bruteValue - calculoIof),
                            iof: calculoIof * -1,
                            iofWithMask: await globalFunctions.formatMoneyNumberToString(calculoIof * -1),   
                            rentability: rentabilityString,
                        }
                    })
            })
                .then((response: any) => res.status(200).send(response))
                .catch((error: any) => res.status(500).send("deu ruim"))
        }
        catch (e: any) {
            res.status(500).send("deu ruim aqui ó")
        }
    }

    const investmentDashboard = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("investments as is")
                    .join("investment as i", "i.idInvestment", "is.id")
                    .select("is.id", "is.name")
                    .distinct()
                    .transacting(trx)
                    .then(async (response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            response.push({
                                id: null,
                                name: "Total",
                                value: "R$ 0,00"
                            });

                            response.forEach(async (element: any) => {
                                element.value = "teste";

                                await calcInvestmentRentabilityByIdInvestment(element.id, trx);
                            })
                        }

                        return response;
                    })
            })
                .then((response: any) => res.status(200).send(response))
                .catch((error: any) => res.status(500).send("deu ruim"))
        }
        catch (e: any) {
            res.status(500).send("deu ruim aqui ó")
        }
    }

    return { registerInvestment, allInfoInvestmentByIdPayment, createInvestment, getAllInvestments, listInvestments, detailInvestments, investmentDashboard }
})