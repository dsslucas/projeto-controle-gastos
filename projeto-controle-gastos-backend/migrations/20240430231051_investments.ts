import { Knex } from "knex";

exports.up = function (knex: any) {
    return knex.schema.createTable('investments', (table: any) => {
        table.increments('id').primary()        
        table.string("name").notNull()
        table.integer("category").default(1).notNull()
        table.double("initialValue").default(0).notNull()
        table.datetime("initialDate").notNull()
        table.datetime("finalDate").notNull()
        table.string("observation")
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('investments')
};

