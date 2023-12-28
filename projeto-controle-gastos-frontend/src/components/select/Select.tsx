import React from "react";

const Select = (props: any) => {
    const name = props.name;
    
    return (
        <select 
            name={name} 
            className="border border-gray-500 rounded w-full" 
            defaultValue={props.options[0]}
            onChange={(event: any) => props.returnSelect(event.target.name, event.target.value)}
        >
            {props.options.map((option:string, index: number) => {
                return <option key={index} value={option}>{option}</option>
            })}
        </select>
    )
}

export default Select;