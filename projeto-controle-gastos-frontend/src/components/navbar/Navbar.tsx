import React, { useState } from "react";
import Title from "../text/Title";
import Button from "../button/Button";
import { useNavigate } from "react-router-dom";

const Navbar = (props: any) => {
    const [isNavOpen, setIsNavOpen] = useState(false); // initiate isNavOpen state with false
    const navigate = useNavigate();

    return (
        <>
            <nav className="w-full flex xs:justify-between lg:items-center">
                <section className="MOBILE-MENU flex lg:hidden">
                    <div
                        className="HAMBURGER-ICON space-y-2"
                        onClick={() => setIsNavOpen((prev) => !prev)}
                    >
                        <span className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
                        <span className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
                        <span className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
                    </div>

                    <div className={isNavOpen ? "showMenuNav" : "hideMenuNav"}>
                        <div
                            className="CROSS-ICON absolute top-0 right-0 px-8 py-8"
                            onClick={() => setIsNavOpen(false)} // change isNavOpen state to false to close the menu
                        >
                            <svg
                                className="h-8 w-8 text-gray-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <ul className="MENU-LINK-MOBILE-OPEN flex flex-col items-center justify-between min-h-[250px]">    
                            <li className="border-b border-gray-400 my-8 uppercase">
                                <Button type="button" content="Investimentos" color="" returnClick={() => {
                                    setIsNavOpen(false);
                                    navigate("/investments");
                                }} />
                            </li>
                            <li className="border-b border-gray-400 my-8 uppercase">
                                <Button type="button" content="Relatório anual" color="" returnClick={() => {
                                    setIsNavOpen(false);
                                    navigate("/report");
                                }} />
                            </li>
                        </ul>
                    </div>
                </section>

                <Button type="button" title content="Controle de gastos" color="" returnClick={() => {
                            setIsNavOpen(false);
                            navigate("/home");
                        }} />
                <ul className="DESKTOP-MENU xs:hidden xl:flex space-x-8 lg:flex">                    
                    <li className="">
                        <Button type="button" navbar content="Investimentos" color="" returnClick={() => {
                            setIsNavOpen(false);
                            navigate("/investments");
                        }} />
                    </li>
                    <li className="">
                        <Button type="button" navbar content="Relatório" color="" returnClick={() => {
                            setIsNavOpen(false);
                            navigate("/report");
                        }} />
                    </li>
                </ul>
            </nav>
            <style>{`
                .hideMenuNav {
                    display: none;
                }
                .showMenuNav {
                    display: block;
                    position: absolute;
                    width: 100%;
                    height: 100vh;
                    top: 0;
                    left: 0;
                    background: #6B6B6A;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    align-items: center;
                    overflow: hidden;
                }
                `}
            </style>
        </>
    )
}

export default Navbar;