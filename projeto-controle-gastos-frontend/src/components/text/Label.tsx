import React from "react"

const Label = (props: any) => {
    const label = props.label;

    return <label className="w-full uppercase ml-0 text-left">{label}</label>
}

export default Label;