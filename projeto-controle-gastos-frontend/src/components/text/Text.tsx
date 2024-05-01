import React from "react";

const Text = (props: any) => {
    const text = props.text;
    const card = props.card;
    const modalRescue = props.modalRescue;

    return <p className={`${!card && "w-full"} ${card && "xs:w-full sm:w-auto"} ${modalRescue ? "text-right" : "text-left"} font-normal text-gray-700`}>{text}</p>
}

export default Text;