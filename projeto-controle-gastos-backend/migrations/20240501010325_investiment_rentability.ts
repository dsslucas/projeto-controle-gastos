import { Knex } from "knex";

exports.up = function (knex: any) {
    return knex.schema.createTable('investment_rentability', (table: any) => {
        table.increments('id').primary()        
        table.integer("idInvestment").references("id").inTable("investments").notNull()
        table.string("name").notNull()
        table.boolean("checked").default("false").notNull()
        table.string("type")
        table.double("percentage").default(0.0)
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('investment_rentability')
};
