import { Knex } from "knex";

exports.up = function (knex: any) {
    return knex.schema.createTable('investments', (table: any) => {
        table.increments('id').primary()
        table.integer("idPayment")        
        table.string("name").notNull()
        table.integer("category").default(1).notNull()
        table.boolean("active").default(true).notNull()
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('investments')
};

