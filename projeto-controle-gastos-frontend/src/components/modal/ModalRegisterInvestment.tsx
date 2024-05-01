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

const ModalRegisterInvestment = (props: any) => {
    const { options } = props;
    const [dadosForm, setDadosForm] = useState<any>({
        title: "",
        category: options[0].value.toString(),
        initialValue: "",
        initialDate: undefined,
        finalDate: undefined,
        observation: undefined
    });

    const changeData = (name: string, valueChanged: any) => {
        setDadosForm({ ...dadosForm, [name]: valueChanged });
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        props.sendData(dadosForm);
    }

    return (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col xl:w-[500px] bg-white outline-none focus:outline-none">
                        <form onSubmit={handleSubmit}>
                            {/*header*/}
                            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                <Subtitle {...props} modal subtitle="Cadastro de investimento" />
                            </div>
                            {/*body*/}
                            <div className="relative p-6 flex-auto flex flex-col gap-2">
                                <div className="flex">
                                    <Label label="Título" />
                                    <Input
                                        type="text"
                                        name="title"
                                        placeholder="Insira o título"
                                        value={dadosForm.title}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        required
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Categoria" />
                                    <Select
                                        name="category"
                                        options={options}
                                        returnSelect={(name: string, value: number) => changeData(name, value)}
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Valor inicial" />
                                    <Input
                                        type="text"
                                        name="initialValue"
                                        placeholder="Insira o valor"
                                        inputMode="numeric"
                                        mask="money"
                                        value={dadosForm.initialValue}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        required
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Rentabilidade" />

                                    <div className="w-full">
                                        <label className="flex justify-center items-center gap-2">
                                            <Input
                                                type="checkbox"
                                                name="cdi"
                                                returnInput={(name: string, value: string) => console.log(name, value)}
                                            />

                                            <Text text="CDI" />

                                            <Input
                                                type="text"
                                                name="rentabilidade_cdi"
                                                placeholder="Insira o percentual"
                                                inputMode="numeric"
                                                mask="percentage"
                                                returnInput={(name: string, value: string) => console.log(name, value)}
                                                required
                                            />
                                        </label>

                                        <label className="flex justify-center items-center gap-2">
                                            <Input
                                                type="checkbox"
                                                name="IPCA"
                                                returnInput={(name: string, value: string) => console.log(name, value)}
                                            />

                                            <Text text="IPCA" />
                                        </label>
                                        <label className="flex justify-center items-center gap-2">
                                            <Input
                                                type="checkbox"
                                                name="taxa"
                                                returnInput={(name: string, value: string) => console.log(name, value)}
                                            />

                                            <Text text="Taxa" />

                                            <Input
                                                type="text"
                                                name="rentabilidade_taxa"
                                                placeholder=""
                                                required
                                                inputMode="numeric"
                                                mask="percentage"
                                                returnInput={(name: string, value: string) => console.log(name, value)}
                                            />

                                            <Select
                                                name="rentabilidade_taxa_seletor"
                                                options={[
                                                    {
                                                        text: "a.a",
                                                        value: "a.a"
                                                    },
                                                    {
                                                        text: "a.m",
                                                        value: "a.m"
                                                    },
                                                ]}
                                                returnSelect={(name: string, value: number) => console.log(`${name} - ${value}`)}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex">
                                    <Label label="Data inicial" />
                                    <Input
                                        type="date"
                                        name="initialDate"
                                        placeholder="Insira a data"
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        required
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Data final" />
                                    <Input
                                        type="date"
                                        name="finalDate"
                                        placeholder="Insira a data"
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        required
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Observação" />
                                    <Input
                                        type="text"
                                        name="observation"
                                        returnInput={(name: string, value: string) => changeData(name, value)}
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

export default ModalRegisterInvestment;