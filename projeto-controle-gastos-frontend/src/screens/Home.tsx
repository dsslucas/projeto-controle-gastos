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
import Alert from "../components/alert/Alert";
//import { io } from "socket.io-client";

const Home = (props: any) => {
    const [showModalConfig, setShowModalConfig] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [showModalView, setShowModalView] = useState(false);
    const [showModalDashboard, setShowModalDashboard] = useState(false);

    const [currentDay, setCurrentDay] = useState<String>();
    const [currentMonth, setCurrentMonth] = useState<String>();
    const [currentYear, setCurrentYear] = useState<String>();
    const [currentHour, setCurrentHour] = useState<String>();
    const [currentMinutes, setCurrentMinutes] = useState<String>();
    const [currentSeconds, setCurrentSeconds] = useState<String>();

    const [idSelected, setIdSelected] = useState<number>();
    const [searchString, setSearchString] = useState("");

    const [dataApiPayment, setDataApiPayment] = useState<any>();
    const [dataApiDashboard, setDataApiDashboard] = useState<any>();

    useEffect(() => {
        const date = new Date().toISOString();

        const year = date.substring(0, 4);
        const month = date.substring(5, 7);
        const day = date.substring(8, 10);

        const time = new Date().toLocaleTimeString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });

        setCurrentHour(time.substring(0, 2));
        setCurrentMinutes(time.substring(3, 5));
        setCurrentSeconds(time.substring(6, 8));

        setCurrentYear(year);
        setCurrentMonth(month);
        setCurrentDay(day);

        // Renderize API info
        getData("", "", `${year}-${month}`);
        getDashboardData(`${year}-${month}`);

        // const socket = io(`ws://${window.location.hostname}:3003`, {
        //     reconnectionDelayMax: 10000
        // });

        // socket.on("NEW_PAYMENT_REGISTED", () => {
        //     console.log("executed")
        //     getData();
        // });
    }, [])

    // NEW_PAYMENT_REGISTED

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

    const getDashboardData = async (date: string) => {
        await api.get("/dashboard", {
            params: {
                date: date
            }
        })
            .then((response: any) => setDataApiDashboard(response.data))
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    const changeDate = (value: string) => {
        console.log("VALOR RECEBIDO: ", value);

        const month = value.substring(5, 7);
        const year = value.substring(0, 4);

        const date = new Date(value).toISOString();
        setCurrentYear(date.substring(0, 4));
        setCurrentMonth(date.substring(5, 7));
        setCurrentDay(date.substring(8, 10));

        const time = new Date().toLocaleTimeString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });

        setCurrentHour(time.substring(0, 2));
        setCurrentMinutes(time.substring(3, 5));
        setCurrentSeconds(time.substring(6, 8));

        getData("", "", `${year}-${month}`);
        getDashboardData(`${year}-${month}`);
    }

    const selectDashboardElement = (category: string, paymentMethod: string) => {
        const date = `${currentYear}-${currentMonth}`;
        getData(category, paymentMethod, date);
        getDashboardData(date);
    }

    const checkRegisterPossible = async () => {
        await api.get("/payment/check", {
            params: {
                date: `${currentYear}-${currentMonth}`
            }
        })
            .then(() => setShowModalRegister(true))
            .catch((error: any) => {
                Alert({
                    text: error.response.data,
                    icon: "error"
                });
            })
    }

    const dashboardData = () => {
        return (
            <>
                <div className="flex flex-wrap xs:justify-between xl:justify-between gap-2">
                    <Title title="Indicadores" />

                    <CardDash
                        title="Valor bruto"
                        value={dataApiDashboard && dataApiDashboard.total}
                        fullCard
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", "")}
                    />
                    <CardDash
                        title="Contas"
                        value={dataApiDashboard && dataApiDashboard.indicators.billing.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.billing.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />
                    <CardDash
                        title="Investimentos"
                        value={dataApiDashboard && dataApiDashboard.indicators.investments.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.investments.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />

                    <CardDash
                        title="Lazer"
                        value={dataApiDashboard && dataApiDashboard.indicators.leisure.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.leisure.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />
                    <CardDash
                        title="Alimentação"
                        value={dataApiDashboard && dataApiDashboard.indicators.food.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.food.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />
                    <CardDash
                        title="Compras"
                        value={dataApiDashboard && dataApiDashboard.indicators.purcharse.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.purcharse.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />
                    <CardDash
                        title="Saúde"
                        value={dataApiDashboard && dataApiDashboard.indicators.health.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.health.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />
                    <CardDash
                        title="Viagens"
                        value={dataApiDashboard && dataApiDashboard.indicators.travel.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.travel.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />
                    <CardDash
                        title="Outros"
                        value={dataApiDashboard && dataApiDashboard.indicators.other.value}
                        percentage={dataApiDashboard && dataApiDashboard.indicators.other.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement(value, "")}
                    />

                    <CardDash
                        title="TOTAL DE DESPESAS"
                        value={dataApiDashboard && dataApiDashboard.expenses.value}
                        percentage={dataApiDashboard && dataApiDashboard.expenses.percentage}
                        disableButton
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", "")}
                    />
                    <CardDash
                        title="VALOR DISPONÍVEL"
                        value={dataApiDashboard && dataApiDashboard.available.value}
                        percentage={dataApiDashboard && dataApiDashboard.available.percentage}
                        disableButton
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", "")}
                    />
                </div>
                <div className="flex flex-wrap xl:justify-between gap-2">
                    <Title title="Total gasto" />
                    <CardDash
                        title="Crédito"
                        value={dataApiDashboard && dataApiDashboard.paymentMethod.credit.value}
                        percentage={dataApiDashboard && dataApiDashboard.paymentMethod.credit.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", value)}
                    />
                    <CardDash
                        title="Débito"
                        value={dataApiDashboard && dataApiDashboard.paymentMethod.debit.value}
                        percentage={dataApiDashboard && dataApiDashboard.paymentMethod.debit.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", value)}
                    />
                    <CardDash
                        title="Espécie"
                        value={dataApiDashboard && dataApiDashboard.paymentMethod.cash.value}
                        percentage={dataApiDashboard && dataApiDashboard.paymentMethod.cash.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", value)}
                    />
                    <CardDash
                        title="PIX"
                        value={dataApiDashboard && dataApiDashboard.paymentMethod.pix.value}
                        percentage={dataApiDashboard && dataApiDashboard.paymentMethod.pix.percentage}
                        color="bg-gray-300"
                        returnCardSelected={(value: string) => selectDashboardElement("", value)}
                    />
                </div>
            </>
        )
    }

    return (
        <main className="flex flex-col xs:overflow-x-hidden xl:h-screen xl:overflow-hidden bg-gray-300">

            {showModalConfig && (
                <ModalConfig
                    returnClick={() => {
                        setShowModalConfig(false);
                        getData("", "", `${currentYear}-${currentMonth}`);
                        getDashboardData(`${currentYear}-${currentMonth}`);
                    }}
                    currentDay={currentDay}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    currentHour={currentHour}
                    currentMinutes={currentMinutes}
                    currentSeconds={currentSeconds}
                    returnNewDate={changeDate}
                />
            )}

            {showModalRegister && (
                <ModalRegister
                    id={idSelected}
                    currentDay={currentDay}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    currentHour={currentHour}
                    currentMinutes={currentMinutes}
                    returnClick={() => {                        
                        setShowModalRegister(false);
                        setIdSelected(undefined);
                        getData("", "", `${currentYear}-${currentMonth}`);
                        getDashboardData(`${currentYear}-${currentMonth}`);
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
            
            <header className="flex xs:items-center xs:justify-start xs:h-12 xl:flex-row xl:justify-between xl:items-center bg-gray-800 text-white p-1">
                <Navbar
                    clickButtonConfig={() => setShowModalConfig(true)}
                    clickButtonRegister={checkRegisterPossible}
                    clickButtonDashboard={() => setShowModalDashboard(true)}
                />
            </header>

            <section className="flex xl:flex-row gap-2 px-1 p-1">
                <Subtitle subtitle={`Mês de atuação: ${currentMonth}/${currentYear}`} />
            </section>

            <section className="flex xl:flex-row gap-2 xl:h-[90%] px-1 p-1">
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