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

const ModalRegister = (props: any) => {
    const { currentDay, currentMonth, currentYear, currentHour, currentMinutes } = props;

    const [blockRegisterInfo, setBlockRegisterInfo] = useState<boolean>(false);

    const { selectOptions, optionsPayment, optionsInvestments } = globalFunctions();
    var [parcels, setParcels] = useState([
        { value: 1, text: "" },
        { value: 2, text: "" },
        { value: 3, text: "" },
        { value: 4, text: "" },
        { value: 5, text: "" },
        { value: 6, text: "" },
        { value: 7, text: "" },
        { value: 8, text: "" },
        { value: 9, text: "" },
        { value: 10, text: "" },
        { value: 11, text: "" },
        { value: 12, text: "" }
    ]);

    const [editMode, setEditMode] = useState(false);
    const [showParcel, setShowParcel] = useState(false);

    const [dadosForm, setDadosForm] = useState<any>({
        title: "",
        date: "",
        category: selectOptions[0].value,
        description: "",
        paymentMethod: optionsPayment[0].value,
        parcel: "",
        value: "",
        investment_category: optionsInvestments[0].value.toString(),
        investment: {
            id: 0,
            title: "",
            category: "",
            initialValue: "",
            initialDate: "",
            finalDate: "",
            rentability: [
                {
                    name: "CDI",
                    percentage: "",
                    type: null,
                    checked: false,
                },
                {
                    name: "IPCA",
                    percentage: "",
                    type: null,
                    checked: false,
                },
                {
                    name: "tax",
                    percentage: "",
                    type: "a.a",
                    checked: false,
                }
            ]
        }
    })

    const [apiInvestments, setApiInvestments] = useState<any>([]);

    useEffect(() => {
        if (props.id !== undefined) {
            getData(props.id);
        }

        apiInvestmentList();

        setDadosForm({
            ...dadosForm,
            date: `${currentYear}-${currentMonth}-${currentDay}T${currentHour}:${currentMinutes}`
        })

        // eslint-disable-next-line
    }, []);

    const getData = async (id: number) => {
        await api.get(`/payment/${id}`)
            .then((response: any) => {
                console.log(response.data)
                if(response.data.investment !== null) {
                    setBlockRegisterInfo(true);
                }
                setEditMode(true)
                setDadosForm(response.data);
            })
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });;
            })
    }

    const apiInvestmentList = async () => {
        await api.get("/investment")
            .then((response: any) => {
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
                        //allback: props.returnClick()
                        callback: null
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

    useEffect(() => {
        defineParcel();
        // eslint-disable-next-line
    }, [dadosForm.paymentMethod, dadosForm.value])

    const changeData = (name: string, valueChanged: any) => {
        if (name.startsWith("rentability")) {
            console.log(name, valueChanged)
            const rentabilityIndex = parseInt(name.split("-")[1]);
            const updatedRentability = [...dadosForm.investment.rentability]; // Mudança aqui
            updatedRentability[rentabilityIndex] = {
                ...updatedRentability[rentabilityIndex],
                [valueChanged.name]: valueChanged.value
            };

            setDadosForm({
                ...dadosForm,
                investment: {
                    ...dadosForm.investment,
                    rentability: updatedRentability // Mudança aqui
                }
            });
        }
        else if (name.startsWith("investment")) {
            console.log(name, valueChanged);
            const investmentName = name.substring(11);

            const updatedInvestment = {
                ...dadosForm.investment,
                [investmentName]: valueChanged
            };

            setDadosForm({
                ...dadosForm,
                investment: updatedInvestment
            });
        }
        else {
            setDadosForm({ ...dadosForm, [name]: valueChanged });

            console.log(name, valueChanged)
            if (name === "category" && valueChanged !== "Investimentos") {
                setDadosForm({
                    ...dadosForm,
                    [name]: valueChanged,
                    investment: {
                        ...dadosForm.investment,
                        id: 0,
                        title: "",
                        category: "",
                        initialValue: "",
                        initialDate: "",
                        finalDate: "",
                        rentability: [
                            {
                                name: "CDI",
                                percentage: "",
                                type: null,
                                checked: false,
                            },
                            {
                                name: "IPCA",
                                percentage: "",
                                type: null,
                                checked: false,
                            },
                            {
                                name: "tax",
                                percentage: "",
                                type: "a.a",
                                checked: false,
                            }
                        ]
                    }
                });
            }
        }
    }

    const defineParcel = () => {
        const value = dadosForm.value;

        if (dadosForm.paymentMethod === "Crédito") {
            const formattedValue = globalFunctions().formatMoney(value);

            for (let i: number = 1; i <= parcels.length; i++) {
                const parcela = parseFloat((formattedValue / i).toFixed(2));

                const array = [...parcels];

                parcels[i - 1].text = `${i}x de ${parcela.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}`;

                setParcels(array);
            }
            setShowParcel(true);
        }
        else {
            setShowParcel(false);
            for (let i: number = 1; i <= parcels.length; i++) {
                parcels[i - 1].text = ""
            }
        }
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
                                        disabled={blockRegisterInfo}
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
                                        disabled={(editMode && dadosForm.paymentMethod === "Crédito") || blockRegisterInfo}
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Categoria" />
                                    <Select
                                        name="category"
                                        options={selectOptions}
                                        value={dadosForm.category}
                                        returnSelect={(name: string, value: string) => changeData(name, value)}
                                        disabled={blockRegisterInfo}
                                    />
                                </div>
                                {dadosForm.category === "Investimentos" && apiInvestments !== null && (
                                    <>
                                        {apiInvestments[0].value !== "-1" && (
                                            <div className="flex">
                                                <Label label="Investimento" />
                                                <Select
                                                    name="investment_category"
                                                    options={apiInvestments}
                                                    value={dadosForm.investment.category}
                                                    returnSelect={(name: string, value: number) => changeData(name, value)}
                                                    disabled={blockRegisterInfo}
                                                />
                                            </div>
                                        )}

                                        {(apiInvestments[0].value === "-1" || dadosForm.investment.category === "-1") && (
                                            <div className="flex">
                                                <Label label="Nome" />
                                                <Input
                                                    type="text"
                                                    name="investment_title"
                                                    placeholder="Insira o nome do investimento"
                                                    value={dadosForm.investment.title}
                                                    returnInput={(name: string, value: string) => changeData(name, value)}
                                                    required
                                                    disabled={blockRegisterInfo}
                                                />
                                            </div>
                                        )}
                                        <div className="flex">
                                            <Label label="Tipo" />
                                            <Select
                                                name="investment_category"
                                                options={optionsInvestments}
                                                returnSelect={(name: string, value: number) => changeData(name, value)}
                                                disabled={blockRegisterInfo}
                                            />
                                        </div>

                                        <div className="flex">
                                            <Label label="Rentabilidade" />

                                            <div className="w-full">
                                                <label className="flex justify-center items-center gap-2">
                                                    <Input
                                                        type="checkbox"
                                                        name="cdi"
                                                        checked={dadosForm.investment.rentability[0] && dadosForm.investment.rentability[0].checked}
                                                        returnInput={(name: string, value: boolean) => changeData("rentability-0", { name: "checked", value })}
                                                        disabled={blockRegisterInfo}
                                                    />

                                                    <Text text="CDI" />

                                                    <Input
                                                        type="text"
                                                        name="cdi"
                                                        placeholder="Insira o percentual"
                                                        inputMode="numeric"
                                                        mask="percentage"
                                                        value={dadosForm.investment.rentability[0] && dadosForm.investment.rentability[0].percentage}
                                                        returnInput={(_name: string, value: string) => changeData("rentability-0", { name: "percentage", value })}
                                                        required={dadosForm.investment.rentability[0] && dadosForm.investment.rentability[0].checked}
                                                        disabled={blockRegisterInfo}
                                                    />
                                                </label>

                                                <label className="flex justify-center items-center gap-2">
                                                    <Input
                                                        type="checkbox"
                                                        name="IPCA"
                                                        checked={dadosForm.investment.rentability[2] && dadosForm.investment.rentability[2].checked}
                                                        returnInput={(name: string, value: boolean) => changeData("rentability-1", { name: "checked", value })}
                                                        disabled={blockRegisterInfo}
                                                    />

                                                    <Text text="IPCA" />
                                                </label>

                                                <label className="flex justify-center items-center gap-2">
                                                    <Input
                                                        type="checkbox"
                                                        name="taxa"
                                                        returnInput={(name: string, value: boolean) => changeData("rentability-2", { name: "checked", value })}
                                                        disabled={blockRegisterInfo}
                                                    />

                                                    <Text text="Taxa" />

                                                    <Input
                                                        type="text"
                                                        name="tax"
                                                        placeholder=""
                                                        inputMode="numeric"
                                                        mask="percentage"
                                                        value={dadosForm.investment.rentability[2] && dadosForm.investment.rentability[2].percentage}
                                                        returnInput={(name: string, value: string) => changeData("rentability-2", { name: "percentage", value })}
                                                        required={dadosForm.investment.rentability[2] && dadosForm.investment.rentability[2].checked}
                                                        disabled={blockRegisterInfo}
                                                    />

                                                    <Select
                                                        name="tax_type"
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
                                                        returnSelect={(name: string, value: number) => changeData("rentability-2", { name: "type", value })}
                                                        disabled={blockRegisterInfo}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <Label label="Data inicial" />
                                            <Input
                                                type="date"
                                                name="investment_initialDate"
                                                placeholder="Insira a data"
                                                returnInput={(name: string, value: string) => changeData(name, value)}
                                                required
                                                disabled={blockRegisterInfo}
                                            />
                                        </div>
                                        <div className="flex">
                                            <Label label="Data final" />
                                            <Input
                                                type="date"
                                                name="investment_finalDate"
                                                placeholder="Insira a data"
                                                returnInput={(name: string, value: string) => changeData(name, value)}
                                                required
                                                min={dadosForm.initialDate}
                                                disabled={blockRegisterInfo}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="flex">
                                    <Label label="Descrição" />
                                    <Input
                                        type="text"
                                        name="description"
                                        placeholder="Descreva este gasto"
                                        value={dadosForm.description}
                                        returnInput={(name: string, value: string) => changeData(name, value)}
                                        disabled={blockRegisterInfo}
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
                                        disabled={(editMode && dadosForm.paymentMethod === "Crédito") || blockRegisterInfo}
                                    />
                                </div>
                                <div className="flex">
                                    <Label label="Forma de pagamento" />
                                    <Select
                                        name="paymentMethod"
                                        options={optionsPayment}
                                        value={dadosForm.paymentMethod}
                                        returnSelect={(name: string, value: string) => changeData(name, value)}
                                        disabled={(editMode && dadosForm.paymentMethod === "Crédito") || blockRegisterInfo}
                                    />
                                </div>
                                {showParcel && (
                                    <div className="flex">
                                        <Label label="Parcelas" />
                                        <Select
                                            name="parcel"
                                            options={parcels}
                                            value={dadosForm.parcel}
                                            returnSelect={(name: string, value: string) => changeData(name, value)}
                                            disabled={(editMode && dadosForm.paymentMethod === "Crédito") || blockRegisterInfo}
                                        />
                                    </div>
                                )}
                            </div>

                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b gap-2">
                                <Button type="button" content="Sair" color="bg-red-500" returnClick={() => props.returnClick()} />
                                {!blockRegisterInfo && (
                                    <Button type="submit" content="Salvar" color="bg-green-500" returnClick={() => null} disabled={blockRegisterInfo}/>
                                )}                                
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