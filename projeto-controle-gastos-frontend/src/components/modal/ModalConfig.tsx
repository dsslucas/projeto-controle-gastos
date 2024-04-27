import React, { useEffect, useState } from "react"
import Button from "../button/Button";
import Subtitle from "../text/Subtitle";
import Input from "../input/Input";
import Text from "../text/Text";
import Title from "../text/Title";

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Label from "../text/Label";
import api from "../../api/api";
import Alert from "../alert/Alert";

const ModalConfig = (props: any) => {
    const [idConfig, setIdConfig] = useState<number>();
    const [totalMoney, setTotalMoney] = useState<String>();

    var currentDate = `${props.currentYear}-${props.currentMonth}`;
    const maxYearMonth = props.maxYearMonth

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (idConfig === null) {
            await api.post("/config", {
                date: new Date(currentDate),
                values: inputFields
            })
                .then((response: any) => {
                    Alert({
                        text: response.data,
                        icon: "success",
                        callback: props.returnClick()
                    });
                })
                .catch((error: any) => {
                    Alert({
                        text: error.response.data,
                        icon: "error",
                        callback: props.returnClick()
                    });
                })
        }
        else {
            await api.patch(`/config/${idConfig}`, {
                id: idConfig,
                date: new Date(currentDate),
                values: inputFields
            })
                .then((response: any) => {
                    Alert({
                        text: response.data,
                        icon: "success",
                        callback: props.returnClick()
                    });
                })
                .catch((error: any) => {
                    Alert({
                        text: error.response.data,
                        icon: "error",
                        callback: props.returnClick()
                    });
                })
        }
    }

    const [inputFields, setInputFields] = useState<any>([
        //{ description: '', value: 0.0 }
    ])

    const handleFormChange = (index: number, event: any) => {
        let data = [...inputFields];
        data[index][event.target.name] = event.target.value;
        setInputFields(data);
    }

    const addFields = () => {
        let newfield = { id: null, description: '', value: 'R$ 0,00' }
        setInputFields([...inputFields, newfield])
    }

    const removeField = (index: number) => {
        let data = [...inputFields];
        data.splice(index, 1);
        setInputFields(data);
    }

    const getData = async () => {
        await api.get("/config", {
            params: {
                date: `${props.currentYear}-${props.currentMonth}`
            }
        })
            .then((response: any) => {
                console.log(response)
                //setData({...data, value: })
                setIdConfig(response.data.id);
                setTotalMoney(response.data.value);
                setInputFields(response.data.inputValues);
            })
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    // useEffect(() => {
    //     getData();
    // }, []);

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // eslint-disable-next-line
    }, [props.currentMonth, props.currentYear]);

    return (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >
                <div className="relative w-auto my-6 mx-auto max-w-3xl xs:flex xs:justify-center">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col xs:w-[90%] xl:w-[500px] bg-white outline-none focus:outline-none max-h-[90vh]">
                        <form onSubmit={handleSubmit}>
                            {/*header*/}
                            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                <Subtitle {...props} modal subtitle="Configurações" />
                            </div>
                            {/*body*/}
                            <div className="relative p-6 max-h-[72%] block">
                                <div className="h-[15%]">
                                    <Title title="Exibição da página" />
                                    <div className="flex">
                                        <Label label="Mês de exibição" />

                                        <Input
                                            type="month"
                                            name="monthExibition"
                                            max={maxYearMonth}
                                            value={`${props.currentYear}-${props.currentMonth}`}
                                            returnInput={(name: string, value: string) => props.returnNewDate(value)}
                                        />
                                    </div>
                                </div>
                                <div className="h-[85%]">
                                    <div>
                                        <Title title="Receitas" />
                                        <Text text={`Receita informada neste mês: ${totalMoney}`} />
                                    </div>
                                    <div className="block max-h-[215px] overflow-y-auto">
                                        {inputFields && inputFields.map((input: any, index: number) => {
                                            return (
                                                <div key={index} className={`flex mt-1 mb-1 gap-1`}>
                                                    <Input
                                                        name="description"
                                                        placeholder='Descrição'
                                                        value={input.description}
                                                        returnInput={(name: string, value: string) => handleFormChange(index, {
                                                            target: {
                                                                name,
                                                                value
                                                            }
                                                        })}
                                                        required
                                                        disabled={input.id}
                                                    />
                                                    <Input
                                                        name="value"
                                                        placeholder='Valor'
                                                        value={input.value}
                                                        inputMode="numeric"
                                                        mask="money"
                                                        returnInput={(name: string, value: string) => handleFormChange(index, {
                                                            target: {
                                                                name,
                                                                value
                                                            }
                                                        })}
                                                        required
                                                        disabled={input.id}
                                                    />
                                                    <Button
                                                        iconConfig
                                                        content={<FontAwesomeIcon icon={faTrash} />}
                                                        returnClick={() => removeField(index)}
                                                        color="bg-red-500"
                                                        disabled={input.id}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div>
                                        <Button content="Adicionar receita" returnClick={addFields} color="bg-blue-500" />
                                    </div>
                                </div>

                            </div>
                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b gap-2">
                                <Button type="button" content="Sair" color="bg-red-500" modalFooter returnClick={() => props.returnClick()} />
                                <Button type="submit" content="Salvar" color="bg-green-500" modalFooter returnClick={() => null} />

                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )
}

export default ModalConfig;