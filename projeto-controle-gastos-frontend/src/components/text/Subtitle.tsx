import React from "react";

const Subtitle = (props: any) => {
    const subtitle = props.subtitle;
    const card = props.card;
    const modal = props.modal;

    return <h2
        className={`
            ${card && "uppercase"}
            ${modal && "uppercase text-center xl:text-2xl"}
            w-full font-bold tracking-tight text-gray-900 text-left
        `}
    >
        {subtitle}
    </h2>
}

export default Subtitle;