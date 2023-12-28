import React from "react";

const Input = (props: any) => {
    const type = props.type;
    const name = props.name;
    const placeholder = props.placeholder;
    const className = props.className;
    const value = props.value;
    const required = props.required;

    return <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`border border-gray-500 rounded w-full ${className}`}
        onInput={(e: any) => props.returnInput(e.target.name, e.target.value)}
        required={required}
        value={value}
    />
}

export default Input