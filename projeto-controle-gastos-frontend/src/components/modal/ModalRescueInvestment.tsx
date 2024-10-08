import React, { useEffect, useState } from "react"
import Subtitle from "../text/Subtitle";
import Button from "../button/Button";
import Input from "../input/Input";
import Label from "../text/Label";
import Select from "../select/Select";
import api from "../../api/api";
import Alert from "../alert/Alert";
import globalFunctions from "../../global/functions";
import Text from "../text/Text";

const ModalRescueInvestment = (props: any) => {
    const [dadosForm, setDadosForm] = useState<any>({
        idInvestment: "-",
        valueToRescue: "",
        name: "",
        bruteValueWithMask: "R$ 0,00",
        valueAvaliableRescue: 0,
        valueAvaliableRescueWithMask: "R$ 0,00",
        iofWithMask: "R$ 0,00",
        rentability: "",
        reason: ""
    });

    const [apiInvestments, setApiInvestments] = useState<any>([]);

    const apiInvestmentList = async () => {
        await api.get("/investment/list")
            .then(async (response: any) => {
                setApiInvestments(response.data);

                if (response.data[0].value === "-1") {
                    // SELECT CDB
                    setDadosForm({
                        ...dadosForm,
                        investment: {
                            ...dadosForm.investment,
                            category: "1"
                        }
                    });                    
                }
                else {
                    const details = await apiInvestmentDetails(response.data[0].value);

                    setDadosForm({
                        ...dadosForm,
                        idInvestment: details.id,
                        name: details.name,
                        bruteValueWithMask: details.bruteValueWithMask,
                        valueAvaliableRescue: details.valueAvaliableRescue,
                        valueAvaliableRescueWithMask: details.valueAvaliableRescueWithMask,
                        iofWithMask: details.iofWithMask,
                        rentability: details.rentability
                    })
                }
            })
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    const apiInvestmentDetails = async (id: number) => {
        return await api.get(`/investments/detail/${id}`)
            .then((response: any) => {
                return response.data;
            })
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        await api.patch(`/investments/detail/${dadosForm.idInvestment}`, {
            value: dadosForm.valueToRescue,
            reason: dadosForm.reason
        })
            .then((response: any) => {
                Alert({
                    text: response.data.message,
                    icon: "success",
                    callback: props.returnClick()
                });
            })
            .catch((error: any) => {
                Alert({
                    text: error.response.data.message,
                    icon: "error"
                });
            })
    }

    const changeData = async (name: string, valueChanged: any) => {
        if(name === "valueToRescue" || name === "reason"){
            setDadosForm({
                ...dadosForm,
                [name]: valueChanged,
            });
        }
        else {
            const details = await apiInvestmentDetails(valueChanged);
    
            setDadosForm({
                ...dadosForm,
                [name]: valueChanged,
                name: details.name,
                bruteValueWithMask: details.bruteValueWithMask,
                valueAvaliableRescue: details.valueAvaliableRescue,
                valueAvaliableRescueWithMask: details.valueAvaliableRescueWithMask,
                iofWithMask: details.iofWithMask,
                rentability: details.rentability
            });
        }      
    }   

    useEffect(() => {
        apiInvestmentList();
    }, [])

    return (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col xl:w-[500px] bg-white outline-none focus:outline-none">
                        <form onSubmit={handleSubmit}>
                            {/*header*/}
                            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                <Subtitle {...props} modal subtitle="Resgate de investimento" />
                            </div>
                            {/*body*/}
                            <div className="relative p-6 flex-auto flex flex-col gap-2">
                                <div className="flex">
                                    <Label label="Investimento" />
                                    {apiInvestments && (
                                        <Select
                                            name="idInvestment"
                                            value={dadosForm.idInvestment}
                                            options={apiInvestments}
                                            returnSelect={(name: string, value: number) => changeData(name, value)}
                                        />
                                    )}
                                </div>

                                <div className="flex flex-col w-full">
                                    <div className="flex w-full justify-center">
                                        <Subtitle subtitle="Informações do investimento" textCenter />
                                    </div>
                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="Valor bruto" />
                                        <Text modalRescue text={dadosForm.bruteValueWithMask} />
                                    </div>

                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="Valor disponível para resgate" />
                                        <Text modalRescue text={dadosForm.valueAvaliableRescueWithMask} />
                                    </div>

                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="IOF/IR" />
                                        <Text modalRescue text={dadosForm.iofWithMask} />
                                    </div>

                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="Rentabilidade" />
                                        <Text modalRescue text={dadosForm.rentability} />
                                    </div>
                                </div>
                                <div className="flex">
                                    <Label label="Valor a resgatar" />
                                    <Input
                                        type="text"
                                        name="valueToRescue"
                                        placeholder="Insira o valor"
                                        inputMode="numeric"
                                        mask="money"
                                        value={dadosForm.valueToRescue}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        max={dadosForm.valueAvaliableRescue}
                                        required
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Justificativa" />
                                    <Input
                                        type="text"
                                        name="reason"
                                        placeholder="Insira a justificativa"
                                        value={dadosForm.reason}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        required
                                    />
                                </div>

                            </div>
                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b gap-2">
                                <Button type="button" content="Sair" color="bg-gray-200" returnClick={() => props.returnClick()} />
                                <Button type="submit" content="Salvar" color="bg-red-400" returnClick={() => null} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )
}

export default ModalRescueInvestment;