import React from "react"

const Button = (props: any) => {
    const type = props.type;
    const content = props.content;
    const iconCard = props.iconCard;
    const iconTable = props.iconTable;
    const color = props.color;
    const iconConfig = props.iconConfig;
    const disabled = props.disabled || false;
    const buttonRegisterConfig = props.registerConfig;
    const navbar = props.navbar;
    const title = props.title;
    const modalFooter = props.modalFooter

    return (
        <button
            type={type}
            className={`
                ${iconCard && 'h-full w-full rounded-r'} 
                ${iconTable && 'w-8 h-8 rounded'}
                ${iconConfig && 'xs:w-[60px] xs:h-auto'}
                ${!iconCard && !iconTable && !buttonRegisterConfig && !navbar && !title && 'p-2 rounded'}
                ${color}
                ${buttonRegisterConfig ? "h-8 text-white rounded px-2" : ""}
                ${title ? "w-full ml-0 uppercase text-left font-bold xs:text-center lg:text-left" : ""}
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