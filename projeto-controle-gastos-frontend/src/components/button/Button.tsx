import React from "react"

const Button = (props: any) => {
    const type = props.type;
    const content = props.content;
    const iconCard = props.iconCard;
    const iconTable = props.iconTable;
    const color = props.color;
    const iconConfig = props.iconConfig;
    const disabled = props.disabled || false;

    return (
        <button
            type={type}
            className={`
                ${iconCard && 'h-full w-full rounded-r'} 
                ${iconTable && 'w-8 h-8 rounded'}
                ${iconConfig && 'xs:w-[60px] xs:h-auto'}
                ${!iconCard && !iconTable && 'p-2 rounded'}
                ${color}
                uppercase
                hover:brightness-[0.90]
                hover:transition-all
                active:brightness-[0.50] focus:outline-none
            `}
            onClick={() => props.returnClick()}
            disabled={disabled}
        >
            {content}
        </button>
        )
}

export default Button;