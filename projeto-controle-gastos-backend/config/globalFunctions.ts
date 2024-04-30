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

    function calcDateDiff(data1: string, data2: string): number {
        const umDia: number = 24 * 60 * 60 * 1000; // milissegundos em um dia
    
        // Convertendo as datas para objetos Date
        const date1: Date = new Date(data1);
        const date2: Date = new Date(data2);
    
        // Calculando a diferença em milissegundos entre as datas
        const diferencaMilissegundos: number = Math.abs(date1.getTime() - date2.getTime());
    
        // Convertendo a diferença de milissegundos para dias e arredondando para baixo
        const diferencaDias: number = Math.floor(diferencaMilissegundos / umDia);
    
        return diferencaDias;
    }
    
    
    return { formatMoney, getBetweenDates, checkNumber, calcDateDiff }
})