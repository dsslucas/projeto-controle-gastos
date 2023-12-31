import React from "react";
import Button from "../button/Button";
import Subtitle from "../text/Subtitle";
import Text from "../text/Text";

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from "@fortawesome/free-solid-svg-icons";

const CardDash = (props: any) => {
    const title = props.title;
    const value = props.value;
    const color = props.color;
    const percentage = props.percentage;

    const fullCard = props.fullCard;
    //.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    return (
        <div
            className={`flex justify-between bg-white border-gray-500 rounded-lg shadow  
                ${fullCard ? 'w-full' : 'xs:w-[48.6%] lg:w-[100%] xl:w-[48.9%]'} 
                ${color}
                xl:max-h-13
            `}
        >
            <div className="xs:w-[80%] xl:pl-2">
                <Subtitle card subtitle={title} />

                <Text card text={value} />
                {percentage && (
                    <Text card text={`(${(percentage * 100).toFixed(2)}%)`} />
                )}                
            </div>
            <div className="xs:w-[40px] xl:w-10">
                <Button 
                    type="button" 
                    content={<FontAwesomeIcon icon={faInfo} className="p-1" />} 
                    color="bg-green-500" iconCard 
                    returnClick={() => props.returnCardSelected(title)}
                />
                    
            </div>
        </div>
    );
}

export default CardDash