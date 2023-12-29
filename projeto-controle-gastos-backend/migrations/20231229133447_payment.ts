import { Knex } from "knex";

exports.up = function (knex: any) {
    return knex.schema.createTable('payment', (table: any) => {
        table.increments('id').primary()
        table.string("title").notNull()
        table.datetime("date").notNull()  
        table.string("category").notNull()
        table.string("description").default("-")
        table.string("paymentMethod").notNull()
        table.double("value").notNull()
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('payment')
};

