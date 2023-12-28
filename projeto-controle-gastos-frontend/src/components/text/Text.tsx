import React from "react";

const Text = (props: any) => {
    const text = props.text;

    return <p className="w-full text-left font-normal text-gray-700 dark:text-gray-400">{text}</p>
}

export default Text;