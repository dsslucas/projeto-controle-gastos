import React from "react";

const Select = (props: any) => {
    const name = props.name;
    const value = props.value;
    const disabled = props.disabled;
    const options = props.options;

    console.log(props)
    
    return (
        <select 
            name={name} 
            className="border border-gray-500 rounded w-full" 
            value={value}
            onChange={(event: any) => props.returnSelect(event.target.name, event.target.value)}
            disabled={disabled}
            defaultValue={Array.isArray(options) && options.length > 0 && props.options[0].value}
        >
            {Array.isArray(options) && options.length > 0 && options.map((element:any, index: number) => {
                return <option key={index} value={element.value}>{element.text}</option>
            })}
        </select>
    )
}

export default Select;