import React from "react";

const Title = (props: any) => {
    const title = props.title;

    // var string = "";
    // if(window.innerWidth < 640) string = "text-center"

    return <h1 className="w-full ml-0 uppercase text-left font-bold xs:text-center lg:text-left">{title}</h1>
}

export default Title;