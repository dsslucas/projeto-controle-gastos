module.exports((app: any) => {
    const registerPayment = (req: any, res: any) => {
        res.status(200).send("Opa joia")
    }

    const getPayment = (req: any, res: any) => {
        res.status(200).send("Opa bao")
    }

    const editPayment = (req: any, res: any) => {
        res.status(200).send("Opa joia")
    }

    return {registerPayment, getPayment, editPayment}
})