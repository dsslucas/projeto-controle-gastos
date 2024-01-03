const globalFunctions = () => {
    const selectOptions = [
        {
            value: "Contas",
            text: "Contas"
        },
        {
            value: "Investimentos",
            text: "Investimentos"
        },
        {
            value: "Lazer",
            text: "Lazer"
        },
        {
            value: "Alimentação",
            text: "Alimentação"
        },
        {
            value: "Compras",
            text: "Compras"
        },
        {
            value: "Saúde",
            text: "Saúde"
        },
        {
            value: "Viagens",
            text: "Viagens"
        },
        {
            value: "Outros",
            text: "Outros"
        }];

        const optionsPayment = [
            {value: "Débito", text: "Débito"}, 
            {value: "Crédito", text: "Crédito"},
            {value: "Espécie", text: "Espécie"},
            {value: "PIX", text: "PIX"}
        ];

    return {selectOptions, optionsPayment}
}

export default globalFunctions;