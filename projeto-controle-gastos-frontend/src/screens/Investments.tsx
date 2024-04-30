import React, { useEffect, useState } from "react"
import CardDash from "../components/card/Card";
import Table from "../components/table/Table";
import Title from "../components/text/Title";
import api from "../api/api";
import Alert from "../components/alert/Alert";
import Button from "../components/button/Button";
import ModalRegisterInvestment from "../components/modal/ModalRegisterInvestment";

const Investments = (props: any) => {
    const [dataApiPayment, setDataApiPayment] = useState<any>();
    const [showModalRegisterInvestment, setShowModalRegisterInvestment] = useState(false);

    useEffect(() => {
        getData("Investimentos", "", "");
    }, []);

    const getData = async (category: string, paymentMethod: string, date: string) => {
        console.log("O QUE ESTOU RECEBENDO: ", date)
        await api.get("/payment", {
            params: {
                category: category,
                paymentMethod: paymentMethod,
                date: date
            }
        })
            .then((response: any) => setDataApiPayment(response.data))
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
                    returnClick={() => setShowModalRegisterInvestment(false)}
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
                <Table
                    returnClick={(id: number) => {
                        // setIdSelected(id);
                        // setShowModalRegister(true);
                    }}
                    data={dataApiPayment}
                />
            </section>
        </>
    )
}

export default Investments;