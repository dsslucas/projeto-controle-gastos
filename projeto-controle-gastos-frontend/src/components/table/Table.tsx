import React from 'react'
import Button from '../button/Button';

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from "@fortawesome/free-solid-svg-icons";

const Table = (props: any) => {
    return (
        <table className="table-auto xs:p-2 xs:w-full xl:w-full">
            <thead className='bg-blue-800 text-white uppercase top-0 sticky'>
                <tr>
                    <th>Título</th>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th className="xs:hidden sm:table-cell">Descrição</th>
                    <th>Forma</th>
                    <th>Valor</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {props.data && props.data.map((element: any, index: number) => {
                    return (
                        <tr key={index} className={`${index % 2 !== 0 ? "bg-blue-300 bg-opacity-40" : "bg-white"}`}>
                            <td>{element.title}</td>
                            <td>{element.date}</td>
                            <td>{element.category}</td>
                            <td className="xs:hidden sm:table-cell">{element.description}</td>
                            <td>{element.paymentMethod}</td>
                            <td>{element.value}</td>
                            <td className='gap-2'>
                                <Button
                                    type="button"
                                    iconTable
                                    content={<FontAwesomeIcon icon={faEye} />}
                                    color="bg-blue-500"
                                    returnClick={() => props.returnClick(element.id)}
                                />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default Table;