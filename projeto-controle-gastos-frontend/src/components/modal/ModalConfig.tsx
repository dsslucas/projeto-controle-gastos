import React, { useState } from "react"
import Button from "../button/Button";
import Subtitle from "../text/Subtitle";
import Input from "../input/Input";
import Text from "../text/Text";
import Title from "../text/Title";

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Label from "../text/Label";

const ModalConfig = (props: any) => {
    var currentDate = `${props.currentYear}-${props.currentMonth}`;

    const [inputFields, setInputFields] = useState<any>([
        //{ description: '', value: 0.0 }
    ])

    const handleFormChange = (index: number, event: any) => {
        let data = [...inputFields];
        data[index][event.target.name] = event.target.value;
        setInputFields(data);
    }

    const addFields = () => {
        let newfield = { description: '', value: '' }
        setInputFields([...inputFields, newfield])
    }

    const removeField = (index: number) => {
        let data = [...inputFields];
        data.splice(index, 1);
        setInputFields(data);
    }

    return (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >
                <div className="relative w-auto my-6 mx-auto max-w-3xl xs:flex xs:justify-center">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col xs:w-[90%] xl:w-[500px] bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <Subtitle {...props} modal subtitle="Configurações" />
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                            <div>
                                <Title title="Exibição da página" />

                                <div className="flex">
                                    <Label label="Mês de exibição" />
                                    <Input 
                                        type="month" 
                                        name="monthExibition" 
                                        value={currentDate} 
                                        returnInput={(name: string, value: string) => props.returnNewDate(value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Title title="Receitas" />
                                <Text text="Receita informada neste mês: R$ 3.200,00" />

                                {inputFields.map((input: any, index: number) => {
                                    return (
                                        <div key={index} className={`flex mt-1 mb-1 gap-1`}>
                                            <Input name="description" placeholder='Descrição' value={input.description} returnInput={(name: string, value: string) => handleFormChange(index, {
                                                target: {
                                                    name,
                                                    value
                                                }
                                            })} />
                                            <Input name="value" placeholder='Valor' value={input.value} returnInput={(name: string, value: string) => handleFormChange(index, {
                                                target: {
                                                    name,
                                                    value
                                                }
                                            })} />
                                            <Button 
                                                iconConfig 
                                                content={<FontAwesomeIcon icon={faTrash} />} 
                                                returnClick={() => removeField(index)} 
                                                color="bg-red-500" 
                                            />
                                        </div>
                                    )
                                })}

                                <Button content="Adicionar receita" returnClick={addFields} color="bg-blue-500" />
                            </div>

                        </div>
                        {/*footer*/}
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <Button type="button" content="Sair" color="bg-red-500" returnClick={() => props.returnClick()} />
                            <Button type="button" content="Salvar" color="bg-green-500" returnClick={() => props.returnClick()} />

                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )
}

export default ModalConfig;