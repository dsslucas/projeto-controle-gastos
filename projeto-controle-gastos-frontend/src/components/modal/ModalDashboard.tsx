import React, { useState } from "react"
import Subtitle from "../text/Subtitle";
import Button from "../button/Button";

const ModalDashboard = (props: any) => {
    return (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl xs:flex xs:justify-center">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col xs:w-[90%] xl:w-[500px] bg-white outline-none focus:outline-none h-[90vh]">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <Subtitle {...props} modal subtitle="Dashboard" />
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto gap-2 max-h-[78%] block overflow-y-auto">
                            {props.content}
                        </div>
                        {/*footer*/}
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <Button type="button" content="Sair" color="bg-red-500" returnClick={() => props.returnClick()} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )
}

export default ModalDashboard;