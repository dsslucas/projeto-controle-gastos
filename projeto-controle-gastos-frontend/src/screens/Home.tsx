import React, { useEffect, useState } from "react";
import Title from "../components/text/Title";
import CardDash from "../components/card/Card";
import Table from "../components/table/Table";
import Subtitle from "../components/text/Subtitle";

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

// Modals
import ModalConfig from "../components/modal/ModalConfig";
import ModalRegister from "../components/modal/ModalRegister";
import ModalView from "../components/modal/ModalView";
import Input from "../components/input/Input";
import Navbar from "../components/navbar/Navbar";
import ModalDashboard from "../components/modal/ModalDashboard";
import api from "../api/api";
import { io } from "socket.io-client";

const Home = (props: any) => {
    const [showModalConfig, setShowModalConfig] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [showModalView, setShowModalView] = useState(false);
    const [showModalDashboard, setShowModalDashboard] = useState(false);

    const [currentDay, setCurrentDay] = useState<String>();
    const [currentMonth, setCurrentMonth] = useState<String>();
    const [currentYear, setCurrentYear] = useState<String>();

    const [idSelected, setIdSelected] = useState<number>();
    const [searchString, setSearchString] = useState("");

    const [dataApiPayment, setDataApiPayment] = useState<any>();

    useEffect(() => {
        const date = new Date().toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });
        setCurrentDay(date.substring(0, 2));
        setCurrentMonth(date.substring(3, 5));
        setCurrentYear(date.substring(6));

        // Renderize API info
        getData("");


        // const socket = io(`ws://${window.location.hostname}:3003`, {
        //     reconnectionDelayMax: 10000
        // });

        // socket.on("NEW_PAYMENT_REGISTED", () => {
        //     console.log("executed")
        //     getData();
        // });
    }, [])

    // NEW_PAYMENT_REGISTED

    const getData = async (category:string) => {
        await api.get("/payment", {
            params: {
                category: category
            }
        })
            .then((response: any) => setDataApiPayment(response.data))
            .catch((error: any) => console.error(error))
    }

    const changeDate = (value: string) => {
        console.log("VALOR RECEBIDO: ", value);
        const year = value.substring(0, 4);
        const month = value.substring(5);

        const date = new Date(`${year}-${month}-${currentDay}`).toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });
        setCurrentDay(date.substring(0, 2));
        setCurrentMonth(date.substring(3, 5));
        setCurrentYear(date.substring(6));
    }

    const dashboardData = () => {
        return (
            <>
                <div className="flex flex-wrap xs:justify-between xl:justify-between gap-2">
                    <Title title="Indicadores" />

                    <CardDash title="Valor bruto" value={3200} fullCard color="bg-gray-300" returnCardSelected={(value: string) => getData("")}/>
                    <CardDash title="Contas" value={140} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                    <CardDash title="Investimentos" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>

                    <CardDash title="Lazer" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                    <CardDash title="Alimentação" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                    <CardDash title="Compras" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                    <CardDash title="Saúde" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                    <CardDash title="Viagens" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                    <CardDash title="Outros" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => getData(value)}/>
                </div>
                <div className="flex flex-wrap xl:justify-between gap-2">
                    <Title title="Total gasto" />
                    <CardDash title="Crédito" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => console.log("Valor selecionado: ", value)}/>
                    <CardDash title="Débito" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => console.log("Valor selecionado: ", value)}/>
                    <CardDash title="Espécie" value={3200} color="bg-gray-300" returnCardSelected={(value: string) => console.log("Valor selecionado: ", value)}/>
                </div>
            </>
        )
    }

    return (
        <main className="flex flex-col xs:overflow-x-hidden xl:h-screen xl:overflow-hidden p-1">
            {showModalConfig && (
                <ModalConfig
                    returnClick={() => {
                        setShowModalConfig(false);
                        
                    }}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    returnNewDate={changeDate}
                />
            )}

            {showModalRegister && (
                <ModalRegister
                    id={idSelected}
                    returnClick={() => {
                        setShowModalRegister(false);
                        setIdSelected(undefined);
                    }}
                />
            )}

            {showModalView && (
                <ModalView
                    returnClick={() => setShowModalView(false)}
                />
            )}

            {showModalDashboard && (
                <ModalDashboard
                    content={dashboardData()}
                    returnClick={() => setShowModalDashboard(false)}
                />
            )}

            <header className="flex xs:items-center xs:justify-start xs:h-12 xl:flex-row xl:justify-between xl:items-center">
                <Navbar
                    clickButtonConfig={() => setShowModalConfig(true)}
                    clickButtonRegister={() => setShowModalRegister(true)}
                    clickButtonDashboard={() => setShowModalDashboard(true)}
                />
            </header>

            <section className="flex xl:flex-row gap-2">
                <Subtitle subtitle={`Mês de atuação: ${currentMonth}/${currentYear}`} />
            </section>

            <section className="flex xl:flex-row gap-2 xl:h-[90%]">
                <div className="lg:w-[20%] xl:w-[30%] flex flex-col gap-2 xs:hidden sm:hidden md:hidden lg:flex lg:h-[100%]">
                    {dashboardData()}
                </div>
                <div className="xs:w-[100%] xl:w-[70%] lg:h-[100%]">
                    <div className="flex justify-between mb-1 items-center">
                        <Title title="Listagem" />
                        <div className="flex border rounded bg-blue-300 bg-opacity-10">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="p-1" />
                            <Input
                                type="text"
                                name="search"
                                placeholder="Pesquisar"
                                className="pl-2 pr-2"
                                returnInput={(name: string, text: string) => setSearchString(text)} />
                        </div>
                    </div>
                    <div className="xs:max-h-[85vh] lg:max-h-[90vh] xl:max-h-[80vh] overflow-y-auto block">
                        <Table
                            returnClick={(id: number) => {
                                setIdSelected(id);
                                setShowModalRegister(true);
                            }}
                            data={dataApiPayment}
                        />
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;