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

        function formatMoney(value: string){
            // Remove "R$" and format decimal
            const formattedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    
            // Remove only pointers, except the last
            const removePointers = formattedValue.replace(/\.(?=[^.]*\.)/g, '');
    
            const numberFormatted = parseFloat(removePointers).toFixed(2);
    
            return parseFloat(numberFormatted);
        }

    return {selectOptions, optionsPayment, formatMoney}
}

export default globalFunctions;