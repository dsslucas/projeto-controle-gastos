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

    function checkField(name: string, value: string){
        var newFieldValue = "";

        if(mask === "money"){
            let money = value.replace(/\D/g, '');
            newFieldValue = `R$ ${(Number(money) / 100).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.')}`;
        }
        else {
            newFieldValue = value;            
        }

        props.returnInput(name, newFieldValue);
    }

    return <input
        type={type}
        name={name}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`border border-gray-500 rounded w-full ${className}`}
        onInput={(e: any) => checkField(e.target.name, e.target.value)}
        required={required}
        value={value}
        disabled={disabled}
    />
}

export default Input