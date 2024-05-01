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
    const [dadosForm, setDadosForm] = useState<Object>({

    });

    const handleSubmit = async (event: any) => {
        event.preventDefault();
    }

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
                                    <Select
                                        name="Investimento"
                                        options={[
                                            {
                                                value: 1,
                                                text: "CDB 12 Meses"
                                            },
                                            {
                                                value: 2,
                                                text: "LCI/LCA LIQUIDEX 90 DIAS - PF"
                                            },
                                            {
                                                value: 3,
                                                text: "LCI/LCA LIQUIDEZ DIARIA: PJ"
                                            }
                                        ]}
                                        returnSelect={(name: string, value: number) => console.log(`${name} - ${value}`)}
                                    />
                                </div>

                                <div className="flex flex-col w-full">
                                    <div className="flex w-full justify-center">
                                        <Subtitle subtitle="Informações do investimento" textCenter />
                                    </div>
                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="Valor bruto" />
                                        <Text modalRescue text="R$ 125,05" />
                                    </div>

                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="Valor disponível para resgate" />
                                        <Text modalRescue text="R$ 125,05" />
                                    </div>

                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="IOF/IR" />
                                        <Text modalRescue text="-R$ 7,27" />
                                    </div>

                                    <div className="flex w-full justify-between">
                                        <Subtitle subtitle="Rentabilidade" />
                                        <Text modalRescue text="100% do CDI" />
                                    </div>
                                </div>
                                <div className="flex">
                                    <Label label="Valor a resgatar" />
                                    <Input
                                        type="text"
                                        name="value"
                                        placeholder="Insira o valor"
                                        inputMode="numeric"
                                        mask="money"
                                        returnInput={(name: string, value: string) => console.log(name, value)}
                                    />
                                </div>

                            </div>
                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b gap-2">
                                <Button type="button" content="Sair" color="bg-red-500" returnClick={() => props.returnClick()} />
                                <Button type="submit" content="Salvar" color="bg-green-500" returnClick={() => null} />
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