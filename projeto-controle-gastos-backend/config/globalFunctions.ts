module.exports = ((app: any) => {
    // MONEY
    function formatMoney(value: string) {
        const formattedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
        const removePointers = formattedValue.replace(/\.(?=[^.]*\.)/g, '');
        const numberFormatted = parseFloat(removePointers).toFixed(2);

        return parseFloat(numberFormatted);
    }

    function formatMoneyNumberToString(value: number){
        const convertedValue = (value).toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' });
        return convertedValue;
    }

    // PERCENTAGE
    function formatPercentage(value: string) {
        const numericString = value.replace('%', '');
        const numericValue = parseFloat(numericString);

        if (!isNaN(numericValue)) {
            return numericValue;
        } else {            
            return 0;
        }
    }

    // DATE
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

    function formatDate(data: Date){
        let year = data.getFullYear();
        let month = String(data.getMonth() + 1).padStart(2, '0');
        let day = String(data.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function formatDateTFormat(data: Date){
        let year = data.getFullYear();
        let month = String(data.getMonth() + 1).padStart(2, '0');
        let day = String(data.getDate()).padStart(2, '0');
        let hour = String(data.getHours()).padStart(2, '0');
        let minute = String(data.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hour}:${minute}`;
    }

    function formatDateHourTimeFormat(data: Date){
        let year = data.getFullYear();
        let month = String(data.getMonth() + 1).padStart(2, '0');
        let day = String(data.getDate()).padStart(2, '0');
        let hour = String(data.getHours()).padStart(2, '0');
        let minute = String(data.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    // Convert String to Local Date String
    function convertDateToLocation(data: Date){
        return (new Date(data)).toLocaleDateString("pt-br");
    }

    // Calc date month difference
    function monthDifference(date1: string, date2: string) {
        const initialDate = date1.split("/");
        const finalDate = date2.split("/");

        // Convert the date strings to Date objects
        let d1 = new Date(`${initialDate[2]}-${initialDate[1]}-${initialDate[0]}`);
        let d2 = new Date(`${finalDate[2]}-${finalDate[1]}-${finalDate[0]}`);

        var months = 0;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months += d2.getMonth() - d1.getMonth();
        if (d2.getDate() < d1.getDate()) {
            months--;
        }
        return months <= 0 ? 0 : months;
    }

    // Convert date DD/MM/YYYY to YYYY-MM-DD
    function convertDateBrToUs(date: string){
        const partes = date.split("/");

        const dia = partes[0];
        const mes = partes[1];
        const ano = partes[2];

        return `${ano}-${mes}-${dia}`;
    }

    // Calc date length
    function calculateYearDifference(date1: string, date2: string) {
        const initialDate = date1.split("/");
        const finalDate = date2.split("/");

        // Convert the date strings to Date objects
        let d1 = new Date(`${initialDate[2]}-${initialDate[1]}-${initialDate[0]}`);
        let d2 = new Date(`${finalDate[2]}-${finalDate[1]}-${finalDate[0]}`);
    
        // Calculate the raw difference in years
        let yearDifference = d2.getFullYear() - d1.getFullYear();
    
        // Adjust the year difference if necessary
        // If d1's date has not passed in the current year of d2
        if (d2.getMonth() < d1.getMonth() || 
           (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())) {
            yearDifference--;
        }
    
        return yearDifference;
    }
    

    // Check if number is infinite or NaN
    function checkNumber(number: number) {
        if (!isFinite(number)) return 0.0;
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

    function arredondateNumber(number: number){
        var numberArredondated = Number(number).toFixed(2);
        return Number(numberArredondated);
    }

    return { formatMoney, formatMoneyNumberToString, formatPercentage, getBetweenDates, formatDate, formatDateTFormat, formatDateHourTimeFormat, convertDateToLocation, monthDifference, calculateYearDifference, convertDateBrToUs, checkNumber, calcDateDiff, arredondateNumber }
})