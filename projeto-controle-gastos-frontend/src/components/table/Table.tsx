import React from 'react'
import Button from '../button/Button';

// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from "@fortawesome/free-solid-svg-icons";

const Table = (props: any) => {
    return (
        <table className="table-auto xs:p-2 xs:w-full xl:w-full">
            <thead className='bg-blue-800 text-white uppercase'>
                <tr>
                    <th>Título</th>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th className="xs:hidden sm:flex">Descrição</th>
                    <th>Valor</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr>
                    <td>Translado</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Viagem São Paulo x Campinas</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
                <tr className='bg-blue-300 bg-opacity-40'>
                    <td>Viagem</td>
                    <td>10/04/2023</td>
                    <td>Lazer</td>
                    <td className="xs:hidden sm:flex">Campo Grande/MS a Cuiabá/MT</td>
                    <td>R$ 350,00</td>
                    <td className='gap-2'>
                        <Button type="button" iconTable content={<FontAwesomeIcon icon={faEye} />} color="bg-blue-500" returnClick={() => props.returnClick(1)}/>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default Table;