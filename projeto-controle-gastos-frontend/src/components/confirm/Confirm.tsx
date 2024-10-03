import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Confirm = (props: any) => {
    const { text, icon, confirmCallback, textYesButton, textNotButton } = props;
    var title = "";

    if (icon === "error") title = "Erro";

    withReactContent(Swal).fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: textNotButton,
        confirmButtonText: textYesButton,
        reverseButtons: true
    })
    .then((result: any) => {
        if (result.isConfirmed) {
            confirmCallback();
        }
        else {
            
        }
    })
}

export default Confirm;