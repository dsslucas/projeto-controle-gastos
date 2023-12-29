import { Knex } from "knex";

exports.up = function (knex: any) {
    return knex.schema.createTable('config_entries', (table: any) => {
        table.increments('id').primary()
        table.integer("idConfig").references("id").inTable("config").notNull()
        table.string("description").notNull()
        table.double("value").default(0.0).notNull()        
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('config_entries')
};

