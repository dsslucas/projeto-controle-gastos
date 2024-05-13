import React from 'react'
import Button from '../button/Button';

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from "@fortawesome/free-solid-svg-icons";

const Table = (props: any) => {
    const { payment, investment, data } = props;

    console.log(props)

    function renderHeader() {
        if (Array.isArray(data.columns) && data !== undefined && data.columns !== undefined) {
            const columns = data.columns;
            if (payment) {
                return (
                    <tr>
                        <th>{columns[0]}</th>
                        <th>{columns[1]}</th>
                        <th>{columns[2]}</th>
                        <th className="xs:hidden sm:table-cell">{columns[3]}</th>
                        <th>{columns[4]}</th>
                        <th>{columns[5]}</th>
                        <th>{columns[6]}</th>
                    </tr>
                );
            }
            else if(investment){
                return (
                    <tr>
                        <th>{columns[0]}</th>
                        <th>{columns[1]}</th>
                        <th>{columns[2]}</th>
                        <th>{columns[3]}</th>
                        <th>{columns[4]}</th>
                        <th>{columns[5]}</th>
                        <th>{columns[6]}</th>
                        <th>{columns[7]}</th>
                    </tr>
                );
            }
        }
    }

    function renderData() {
        if (Array.isArray(data.data) && data !== undefined && data.data !== undefined) {
            const rows = data.data;

            if (payment) {
                return rows.map((element: any, index: number) => {
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
                })
            }
            else if(investment){
                return rows.map((element: any, index: number) => {
                    return (
                        <tr key={index} className={`${index % 2 !== 0 ? "bg-blue-300 bg-opacity-40" : "bg-white"}`}>
                            <td>{element.name}</td>
                            <td>{element.category}</td>
                            <td>{element.initialDate}</td>
                            <td>{element.finalDate}</td>
                            <td>{element.initialValue}</td>
                            <td>{element.currentValue}</td>
                            <td>{element.observation}</td>
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
                })
            }
        }
    }

    return (
        <table className="table-auto xs:p-2 xs:w-full xl:w-full">
            <thead className='bg-blue-800 text-white uppercase top-0 sticky'>
                {renderHeader()}
            </thead>
            <tbody>
                {renderData()}
            </tbody>
        </table>
    )
}

export default Table;