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
    const disableButton = props.disableButton;

    const fullCard = props.fullCard;
    //.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    return (
        <div
            className={`flex justify-between bg-white border-gray-500 rounded-lg shadow  
                ${fullCard ? 'w-full' : 'xs:w-[48.6%] lg:w-[100%] xl:w-[48.9%]'} 
                ${color}
                xl:max-h-13
                pl-1
            `}
        >
            <div className={`${disableButton ? "xs:w-full pr-0" : "xs:w-[80%] xl:pr-1"}`}>
                <Subtitle card subtitle={title} />

                <div className="flex flex-wrap justify-between w-full pr-1 text-left">
                    <Text card text={value} />
                    {percentage && (
                        <Text card text={percentage} />
                    )}
                </div>

            </div>
            {!disableButton && (
                <div className="xs:w-[40px] xl:w-10">
                    <Button
                        type="button"
                        content={<FontAwesomeIcon icon={faInfo} className="p-1" />}
                        color="bg-green-500" iconCard
                        returnClick={() => props.returnCardSelected(title)}
                    />

                </div>
            )}

        </div>
    );
}

export default CardDash