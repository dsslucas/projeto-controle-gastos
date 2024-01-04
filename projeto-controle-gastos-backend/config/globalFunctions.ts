module.exports = ((app: any) => {
    function formatMoney(value: string) {
        // Remove "R$" and format decimal
        const formattedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');

        // Remove only pointers, except the last
        const removePointers = formattedValue.replace(/\.(?=[^.]*\.)/g, '');

        const numberFormatted = parseFloat(removePointers).toFixed(2);

        return parseFloat(numberFormatted);
    }

    // Date between first and last day of month
    function getBetweenDates(date: string) {
        const month = Number(date.substring(5, 7));
        const year = Number(date.substring(0, 4));

        const initialDate = new Date(Date.UTC(year, month - 1, 1));
        const nextMonth = new Date(Date.UTC(year, month, 0));
        const finalDate = new Date(nextMonth);
        finalDate.setUTCHours(23);
        finalDate.setUTCMinutes(59);
        finalDate.setUTCSeconds(59);

        return {
            initialDate,
            finalDate
        }
    }

    // Check if number is infinite or NaN
    function checkNumber(number: number){
        if(!isFinite(number)) return 0.0;
        else return number;
    }
    
    return { formatMoney, getBetweenDates, checkNumber }
})