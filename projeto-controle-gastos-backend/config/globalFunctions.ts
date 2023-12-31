module.exports = ((app: any) => {
    function formatMoney(value: string){
        // Remove "R$" and format decimal
        const formattedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');

        // Remove only pointers, except the last
        const removePointers = formattedValue.replace(/\.(?=[^.]*\.)/g, '');

        const numberFormatted = parseFloat(removePointers).toFixed(2);

        return parseFloat(numberFormatted);
    }

    return {formatMoney}
})