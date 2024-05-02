import React from "react";

const Input = (props: any) => {
    const type = props.type;
    const name = props.name;
    const placeholder = props.placeholder;
    const className = props.className;
    const value = props.value;
    const required = props.required;
    const inputMode = props.inputMode;
    const mask = props.mask;
    const disabled = props.disabled || false;
    const max = props.max;

    function checkField(name: string, value: string, checked: boolean) {
        var newFieldValue = "";

        if (type === "checkbox") {
            props.returnInput(name, checked);
        }
        else {
            if (mask === "money") {
                let money = value.replace(/\D/g, '');
                newFieldValue = `R$ ${(Number(money) / 100).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.')}`;
            }
            else if (mask === "percentage") {
                // Remove qualquer caractere que não seja um número, ponto ou vírgula
                value = value.replace(/[^\d.,]/g, '');

                // Remove todos os pontos exceto o último
                value = value.replace(/\.(?=.*\.)/g, '');

                // Substitui a vírgula por um ponto para garantir a formatação correta
                value = value.replace(/,/g, '.');

                // Remove casas decimais após o ponto decimal
                value = value.replace(/(\.\d+)?/, '');

                // Adiciona o símbolo de porcentagem no final
                newFieldValue = value.replace(/^(\d+)?$/, '$1%');
            }
            else {
                newFieldValue = value;
            }

            props.returnInput(name, newFieldValue);
        }
    }

    return <input
        type={type}
        name={name}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`border border-gray-500 rounded ${type !== "checkbox" ? "w-full" : "w-auto"} ${className}`}
        onInput={(e: any) => {
            checkField(e.target.name, e.target.value, e.target.checked)
        }}
        required={required}
        value={value}
        disabled={disabled}
        max={max}
    />
}

export default Input