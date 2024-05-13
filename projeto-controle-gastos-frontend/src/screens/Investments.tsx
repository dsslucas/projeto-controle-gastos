import React, { useEffect, useState } from "react"
import CardDash from "../components/card/Card";
import Table from "../components/table/Table";
import Title from "../components/text/Title";
import api from "../api/api";
import Alert from "../components/alert/Alert";
import Button from "../components/button/Button";
import ModalRegisterInvestment from "../components/modal/ModalRegisterInvestment";
import ModalRescueInvestment from "../components/modal/ModalRescueInvestment";
import globalFunctions from "../global/functions";

const Investments = (props: any) => {
    const [dataApiInvestment, setDataApiInvestment] = useState<any>();
    const [showModalRegisterInvestment, setShowModalRegisterInvestment] = useState(false);
    const [showModalRescueInvestment, setShowModalRescueInvestment] = useState(false);
    const { optionsInvestments } = globalFunctions();

    useEffect(() => {
        getData("Investimentos", "", "");
    }, []);

    // POST INVESTMENT
    const createInvestment = async (response: any) => {
        console.log(response)

        await api.post("/investment", response)
            .then((response: any) => {
                console.log(response.data)
                Alert({
                    text: response.data,
                    icon: "success",
                    //callback: setShowModalRegisterInvestment(false)
                    callback: null
                });
            })
            .catch((error: any) => {
                console.error(error)
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    const getData = async (category: string, paymentMethod: string, date: string) => {
        console.log("O QUE ESTOU RECEBENDO: ", date)
        await api.get("/investment")
            .then((response: any) => setDataApiInvestment(response.data))
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    return (
        <>
            {showModalRegisterInvestment && (
                <ModalRegisterInvestment
                    options={optionsInvestments}
                    sendData={(data: any) => createInvestment(data)}
                    returnClick={() => setShowModalRegisterInvestment(false)}
                    returnAlert={(alert: any) => Alert(alert)}
                />
            )}
            {showModalRescueInvestment && (
                <ModalRescueInvestment
                    returnClick={() => setShowModalRescueInvestment(false)}
                />
            )}
            <section className="flex justify-between my-1">
                <div className="flex">
                    <Title title="Investimentos" />
                </div>
                <div className="flex gap-2">
                    <Button type="button" content="Cadastrar" color="bg-green-500 text-white" returnClick={() => {
                        setShowModalRegisterInvestment(true);
                    }} />
                    <Button type="button" content="Resgatar" color="bg-red-500 text-white" returnClick={() => {
                        setShowModalRescueInvestment(true)
                    }} />
                </div>
            </section>


            <section className="flex gap-3 my-1">
                <CardDash
                    title="Total"
                    value={0}
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />
                <CardDash
                    title="LCI/LCA"
                    value={0}
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />
                <CardDash
                    title="CDB"
                    value={0}
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />
                <CardDash
                    title="Poupança"
                    value={0}
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />

            </section>

            <section>
                {dataApiInvestment && (
                    <Table
                        investment
                        returnClick={(id: number) => {
                            // setIdSelected(id);
                            // setShowModalRegister(true);
                        }}
                        data={dataApiInvestment}
                    />
                )}
            </section>
        </>
    )
}

export default Investments;