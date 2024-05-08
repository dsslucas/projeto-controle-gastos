import { Knex } from "knex";


exports.up = function (knex: any) {
    return knex.schema.createTable('investment', (table: any) => {
        table.increments('id').primary()
        table.integer("idInvestment").references("id").inTable("investments").notNull()
        table.double("initialValue").default(0).notNull()
        table.datetime("initialDate").notNull()
        table.datetime("finalDate").notNull()
        table.string("observation")
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('investment')
};

