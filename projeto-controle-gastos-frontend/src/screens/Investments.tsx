import React, { useEffect, useState } from "react"
import CardDash from "../components/card/Card";
import Table from "../components/table/Table";
import Title from "../components/text/Title";
import api from "../api/api";
import Alert from "../components/alert/Alert";
import Button from "../components/button/Button";

const Investments = (props: any) => {
    const [dataApiPayment, setDataApiPayment] = useState<any>();

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
            <section className="flex justify-between my-1">
                <div className="flex">
                    <Title title="Investimentos" />
                </div>
                <div>
                    <Button type="button" content="Resgatar" color="bg-red-500 text-white" returnClick={() => {

                    }} />
                </div>
            </section>


            <section className="flex gap-3 my-1">
                <CardDash
                    title="Total"
                    value={0}
                    fullCard
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />
                <CardDash
                    title="Renda fixa"
                    value={0}
                    fullCard
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />
                <CardDash
                    title="Porquinho Inter"
                    value={0}
                    fullCard
                    color="bg-gray-300"
                    returnCardSelected={(value: string) => console.log(value)}
                />
                <CardDash
                    title="Poupança"
                    value={0}
                    fullCard
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