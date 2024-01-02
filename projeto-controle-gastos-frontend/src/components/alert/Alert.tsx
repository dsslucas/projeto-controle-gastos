import React from "react";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Alert = (props: any) => {
    const MySwal = withReactContent(Swal)
    const { text, icon, callback } = props;
    var title = "";

    if (icon === "error") title = "Erro";

    withReactContent(Swal).fire({
        title,
        text,
        icon
    })
    .then(() => callback)
}

export default Alert;