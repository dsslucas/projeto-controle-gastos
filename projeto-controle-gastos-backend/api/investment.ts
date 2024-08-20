module.exports = ((app: any) => {
    const globalFunctions = app.globalFunctions();
    const configApi = app.api.config;

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
                        idPayment: parseInt(idPayment),
                        active: true
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
                    brutevalue: globalFunctions.formatMoney(initialValue),
                    finalDate: new Date(finalDate),
                    observation: observation,
                    active: true
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
                    .where({
                        active: true
                    })
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
                .where("i.active", true)
                .where("i_simple.active", true)
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
        //var value = 0;
        const dataAtual = new Date();
        dataAtual.setHours(0, 0, 0, 0);
        var iof = 0;

        for (const investment of investments) {
            let formattedInvestment = investment;
            //value = 0;

            // Converter a data recuperada em um objeto Date
            const dataBanco = new Date(investment.lastupdate);

            // Adicionar 1 dia à data do banco
            const dataBancoMaisUmDia = new Date(dataBanco);
            dataBancoMaisUmDia.setDate(dataBancoMaisUmDia.getDate() + 1);
            dataBancoMaisUmDia.setHours(0, 0, 0, 0);

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
            //formattedInvestment.finalDate = "07/07/2024";

            //const initialValueWithoutMoneyFormat = await globalFunctions.formatMoney(investment.initialValue);
            const bruteValue = await globalFunctions.arredondateNumber(investment.brutevalue);
            formattedInvestment.brutevalue = bruteValue;

            var rendimento = 0;
            var rentabilityInfo = "";
            if (Array.isArray(formattedInvestment.rentability) && formattedInvestment.rentability.length > 0) {
                if(dataAtual > dataBancoMaisUmDia){
                    //console.log("Entrei no if")
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
    
                                rendimento += await calculateInvestmentValue(bruteValue, formattedInvestment.initialDate, element.name, formattedInvestment.finalDate, countPercentage, formattedInvestment.name);
                            }
                            else {
                                rendimento += await calculateInvestmentValue(bruteValue, formattedInvestment.initialDate, element.name, formattedInvestment.finalDate, element.percentage, formattedInvestment.name);                           
                            }
                        } catch (error) {
                            console.error(`Erro ao calcular rentabilidade para o investimento ${investment.name}: ${error}`);
                            formattedInvestment.currentValue = 0; // Ou qualquer outro valor padrão que você deseje
                        }
                    }

                    iof = calcularIOF(formattedInvestment.initialDateUS, bruteValue, rendimento);
                }
                else {
                    //console.log("Entrei no else")
                    rendimento = bruteValue;
                    iof = await globalFunctions.arredondateNumber(investment.iof);
                    //value = bruteValue;
                    //iof = investment.iof;
                }
                
                //console.log("VALOR BRUTO: ", Number(investment.brutevalue));
                //console.log("VALOR QUE RENDEU: ", await globalFunctions.arredondateNumber(rendimento));

                formattedInvestment.currentValue = await globalFunctions.formatMoneyNumberToString(rendimento);
                formattedInvestment.currentValueNumber = await globalFunctions.arredondateNumber(rendimento);
                formattedInvestment.rentabilityInfo = rentabilityInfo;                
                formattedInvestment.iof = iof;
                formattedInvestment.iofWithMask = await globalFunctions.formatMoneyNumberToString(iof * -1);
                
                if(dataAtual > dataBancoMaisUmDia){
                    console.log("ATUALIZEI NO BANCO")
                    await app.database("investment")
                        .where({
                            id: formattedInvestment.id
                        })
                        .update({
                            brutevalue: await globalFunctions.arredondateNumber(rendimento),
                            iof: await globalFunctions.arredondateNumber(iof),
                            lastupdate: new Date()
                        })
                }       
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
                    .select("i.id", "is.name", "i.initialValue", "i.initialDate", "i.finalDate", "i.observation", "is.category", "i.brutevalue", "i.lastupdate", "i.iof")                    
                    .where("i.active", true)
                    .where("is.active", true)
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
                columns: ["Nome", "Categoria", "Data inicial", "Data final", "Valor inicial", "Valor atual", "Rentabilidade", "IOF/IR", "Observação"]
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
                .where("i.active", true)
                .orderBy("i.id", "ASC")
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
                    .where("is.active", true)
                    .first()
                    .transacting(trx)
                    .then(async (response: any) => {
                        // Investments
                        const investments = await calcInvestmentRentabilityByIdInvestment(response.id, trx);

                        const auxBruteValue = investments.reduce(function (acc, obj) { return acc + obj.brutevalue; }, 0);
                        const bruteValue = await globalFunctions.arredondateNumber(auxBruteValue);
                        const iof = investments.reduce(function (acc, obj) { return acc + obj.iof; }, 0);
                        var rentabilityString: string = investments[0].rentabilityInfo;

                        console.log(investments)
                        investments.forEach((element: any) =>{
                            if(element.rentabilityInfo != rentabilityString) rentabilityString += element.rentabilityInfo;
                        })

                        return {
                            id: Number(id),
                            name: response.name,
                            bruteValue,
                            bruteValueWithMask: await globalFunctions.formatMoneyNumberToString(auxBruteValue),
                            valueAvaliableRescue: await globalFunctions.arredondateNumber(bruteValue - iof),
                            valueAvaliableRescueWithMask: await globalFunctions.formatMoneyNumberToString(bruteValue - iof),
                            iof: iof * -1,
                            iofWithMask: await globalFunctions.formatMoneyNumberToString(iof * -1),   
                            rentability: rentabilityString,
                        }
                    })
            })
                .then((response: any) => res.status(200).send(response))
                .catch((error: any) => res.status(500).send({
                    message: "Não há registro de investimento com base nos dados fornecidos."
                }))
        }
        catch (e: any) {
            res.status(500).send({
                message: "Erro interno de servidor. Consulte o administrador do sistema."
            })
        }
    }

    const registerRescueInvestment = async (id: number, idInvestment: number, rescuedValue: number, remainingValue: number, nameInvestment: string, reason: string, trx: any) => {
        const actualDate = new Date();
        const active = remainingValue > 0 ? "t" : "f";

        try {   
            await app.database("investment")                
                .update({
                    brutevalue: remainingValue,
                    active
                })
                .where({
                    id
                })
                .transacting(trx)
                .catch((err: any) => console.error(err))

            console.log("PASSEI DO PRIMEIRO")
            await app.database("investment_rescue")
                .insert({
                    idinvestment: id,
                    value: rescuedValue,
                    date: actualDate,
                    id_user: 1, // until create user interface,
                    reason
                })
                .transacting(trx)
            console.log("PASSEI DO SEGUNDO")
            // Register on config

            await app.database("investments")                
                .update({
                    active
                })
                .where({
                    id: idInvestment
                })
                .transacting(trx)
                .catch((err: any) => console.error(err))

            const date = globalFunctions.formatDate(actualDate);
            const {initialDate, finalDate} = globalFunctions.getBetweenDates(date);

            // Register the rescued value into config database
            if(await configApi.checkIfExistsMonthConfig(actualDate, trx)){
                // Get ID of config
                const idConfig = await app.database("config")
                    .where((builder: any) => {
                        builder.where("date", ">=", initialDate).where("date", "<", finalDate);
                    })
                    .first()
                    .transacting(trx)
                    .then((response: any) => {
                        return response.id
                    })
                
                await app.database("config_entries")
                    .insert({
                        idConfig: idConfig,
                        description: `Resgate de investimento: ${nameInvestment} (${globalFunctions.convertDateToLocation(actualDate)})`,
                        value: rescuedValue
                    })
                    .transacting(trx)
            }
            else {
                // Create new one
                const idConfig = await app.database("config")
                    .insert({
                        date: actualDate
                    })
                    .returning("id")
                    .transacting(trx)

                    await app.database("config_entries")
                        .insert({
                            idConfig: idConfig[0].id,
                            description: `Resgate de investimento: ${nameInvestment} (${globalFunctions.convertDateToLocation(actualDate)})`,
                            value: rescuedValue
                        })
                        .transacting(trx)
            }            
        }
        catch (e: any){
            console.error(e);
        }
    }

    const rescueInvestment = async (req: any, res: any) => {
        const {id} = req.params;
        const {value, reason} = req.body;

        if(value === null || value === undefined || value === ""){
            return res.status(404).send({
                message: "Informe o valor para resgate."
            });
        }
        else if(reason === null || reason === undefined || reason === ""){
            return res.status(404).send({
                message: "Informe a justificativa."
            });
        }
        else if(id === null || id === undefined || id === ""){
            return res.status(400).send({
                message: "Erro ao buscar o investimento. Consulte o administrador do sistema."
            });
        }

        const valueWithoutMoneyMask: number = globalFunctions.formatMoney(value);
        var valueRescued: number = 0;

        try {
            await app.database.transaction(async (trx: any) => {
                // Search all investments

                const investmentsListsById = await app.database("investments as is")
                    .select("is.id", "is.name", "is.category")
                    .where({ id })
                    .where("is.active", true)
                    .first()
                    .transacting(trx)
                    .then(async (response: any) => {
                        if(response === undefined) throw "NO_INVESTMENT";

                        // Investments
                        const investments = await calcInvestmentRentabilityByIdInvestment(response.id, trx);

                        const auxBruteValue = investments.reduce(function (acc, obj) { return acc + obj.currentValueNumber; }, 0);
                        const bruteValue = await globalFunctions.arredondateNumber(auxBruteValue);
                        const calculoIof = calcularIOF(investments[0].initialDateUS, investments[0].initialValueWithoutMask, investments[0].currentValueNumber);

                        var rentabilityString: string = investments[0].rentabilityInfo;

                        investments.forEach((element: any) =>{
                            if(element.rentabilityInfo != rentabilityString) rentabilityString += element.rentabilityInfo;
                        })

                        return {
                            name: response.name,
                            bruteValue,
                            valueAvaliableRescue: bruteValue - calculoIof,
                            iof: calculoIof * -1,
                            investments
                        }
                    })
                
                if(valueWithoutMoneyMask > investmentsListsById.valueAvaliableRescue) throw "MAX_RESCUE_VALUE";

                if(Array.isArray(investmentsListsById.investments) && investmentsListsById.investments.length > 0){
                    
                    for (let i = 0; i < investmentsListsById.investments.length; i++) {
                        var investment = investmentsListsById.investments[i];
                        let remainingValue = valueWithoutMoneyMask - valueRescued;

                        if (remainingValue <= 0) {
                            break;
                        }

                        if (investment.currentValueNumber <= remainingValue) {
                            const valorResgatado = globalFunctions.arredondateNumber(investment.currentValueNumber);
                            valueRescued += investment.currentValueNumber; 
                            investment.currentValueNumber = 0;                     

                            await registerRescueInvestment(investment.id, id, valorResgatado, investment.currentValueNumber, investmentsListsById.name, reason, trx);
                            
                        } else {
                            const valorResgatado = globalFunctions.arredondateNumber(remainingValue);
                            valueRescued += remainingValue;
                            investment.currentValueNumber -= remainingValue;

                            await registerRescueInvestment(investment.id, id, valorResgatado, globalFunctions.arredondateNumber(investment.currentValueNumber), investmentsListsById.name, reason, trx);
                            break;
                        }                        
                    }

                    return true;
                }
                else {
                    throw "NO_INVESTMENT_LIST";
                }

            })
            .then((response: any) => res.status(200).send({
                message: "Resgate efetuado com sucesso!"
            }))
            .catch((error: any) => {
                console.error(error)
                if(error === "NO_INVESTMENT") res.status(404).send({
                    message: "Este investimento não está registrado."
                });
                else if(error === "NO_INVESTMENT_LIST") res.status(404).send({
                    message: "Não há registros de investimentos."
                });
                else if(error === "MAX_RESCUE_VALUE") res.status(404).send({
                    message: "O valor de resgate é maior que o limite disponível."
                });
                else res.status(404).send({
                    message: "Erro ao consultar os investimentos."
                });
            })
        }
        catch (e: any){
            console.log(e)
            if(e === "NO_INVESTMENT") res.status(404).send({
                message: "Este investimento não está registrado."
            })
            else res.status(500).send({
                message: "Erro ao consultar os investimentos."
            })
        }      
    }
    
    const investmentDashboard = async (req: any, res: any) => {
        try {
            await app.database.transaction(async (trx: any) => {
                return await app.database("investments as is")
                    .join("investment as i", "i.idInvestment", "is.id")
                    .select("is.id", "is.name")
                    .where("i.active", true)
                    .where("is.active", true)
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

    return { registerInvestment, allInfoInvestmentByIdPayment, createInvestment, getAllInvestments, listInvestments, detailInvestments, investmentDashboard, rescueInvestment }
})