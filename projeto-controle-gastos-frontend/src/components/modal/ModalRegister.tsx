import React, { useEffect, useState } from "react"
import Subtitle from "../text/Subtitle";
import Button from "../button/Button";
import Input from "../input/Input";
import Label from "../text/Label";
import Select from "../select/Select";
import api from "../../api/api";
import Alert from "../alert/Alert";

const ModalRegister = (props: any) => {
    const { currentDay, currentMonth, currentYear, currentHour, currentMinutes } = props;

    useEffect(() => {
        if (props.id !== undefined) {
            getData(props.id);
        }

        setDadosForm({
            ...dadosForm,
            date: `${currentYear}-${currentMonth}-${currentDay}T${currentHour}:${currentMinutes}`
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getData = async (id: number) => {
        await api.get(`/payment/${id}`)
            .then((response: any) => {
                setDadosForm(response.data);
            })
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });;
            })
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (props.id) {
            await api.patch(`/payment/${props.id}`, dadosForm)
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
                        icon: "error"
                    });
                })
        }
        else {
            await api.post("/payment", dadosForm)
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
                        icon: "error"
                    });
                })
        }
    }

    const selectOptions = ["Contas", "Investimentos", "Lazer", "Alimentação", "Compras", "Saúde", "Viagens", "Outros"];
    const optionsPayment = ["Débito", "Crédito", "Espécie", "PIX"];

    const [dadosForm, setDadosForm] = useState({
        title: "",
        date: "",
        category: selectOptions[0],
        description: "",
        paymentMethod: optionsPayment[0],
        value: ""
    })

    const changeData = (name: string, value: string) => {
        setDadosForm({ ...dadosForm, [name]: value })
    }

    return (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col xl:w-[500px] bg-white outline-none focus:outline-none">
                        <form onSubmit={handleSubmit}>
                            {/*header*/}
                            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                <Subtitle {...props} modal subtitle="Registro de gasto" />
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
                                    <Label label="Data" />
                                    <Input
                                        type="datetime-local"
                                        name="date"
                                        placeholder="Insira a data"
                                        value={dadosForm.date}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        required
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Categoria" />
                                    <Select
                                        name="category"
                                        options={selectOptions}
                                        returnSelect={(name: string, value: string) => changeData(name, value)}
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Descrição" />
                                    <Input
                                        type="text"
                                        name="description"
                                        placeholder="Descreva este gasto"
                                        value={dadosForm.description}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Forma de pagamento" />
                                    <Select
                                        name="paymentMethod"
                                        options={optionsPayment}
                                        returnSelect={(name: string, value: string) => changeData(name, value)}
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Valor" />
                                    <Input
                                        type="text"
                                        name="value"
                                        placeholder="Insira o valor"
                                        inputMode="numeric"
                                        mask="money"
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        value={dadosForm.value}
                                        required
                                    />
                                </div>
                            </div>
                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
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

export default ModalRegister;