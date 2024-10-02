module.exports = (app: any) => {
    const dashboard = app.api.dashboard;
    const config = app.api.config;
    const payment = app.api.payment;
    const investment = app.api.investment;

    app.route("/dashboard")
        .get(dashboard.getDashboard)

    app.route("/config")
        .post(config.registerConfig)
        .get(config.getConfig)

    app.route("/config/:id")
        .patch(config.editConfig)

    app.route("/entries/check")
        .get(config.checkMonthEntries)

    app.route("/payment")
        .post(payment.registerPayment)
        .get(payment.getPayments)

    app.route("/payment/check")
        .get(payment.checkPaymentPossible)

    app.route("/payment/:id")
        .get(payment.getPayment)
        .patch(payment.editPayment)

    app.route("/investment")
        .post(investment.createInvestment)
        .get(investment.getAllInvestments)

    app.route("/investment/dashboard")
        .get(investment.investmentDashboard)

    app.route("/investment/list")
        .get(investment.listInvestments)

    app.route("/investments/detail/:id")
        .get(investment.detailInvestments)
        .patch(investment.rescueInvestment)
}