import React from "react";

const Select = (props: any) => {
    const name = props.name;
    const value = props.value
    
    return (
        <select 
            name={name} 
            className="border border-gray-500 rounded w-full" 
            value={value}
            onChange={(event: any) => props.returnSelect(event.target.name, event.target.value)}
        >
            {props.options.map((element:any, index: number) => {
                return <option key={index} value={element.value}>{element.text}</option>
            })}
        </select>
    )
}

export default Select;