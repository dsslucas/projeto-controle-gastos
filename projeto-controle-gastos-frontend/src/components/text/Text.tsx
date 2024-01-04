import React from "react";

const Text = (props: any) => {
    const text = props.text;
    const card = props.card;

    return <p className={`${!card && "w-full"} ${card && "xs:w-full sm:w-auto"} text-left font-normal text-gray-700 dark:text-gray-400`}>{text}</p>
}

export default Text;