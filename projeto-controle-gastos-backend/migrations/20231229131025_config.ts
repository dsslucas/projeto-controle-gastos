import { Knex } from "knex";

exports.up = function (knex: any) {
    return knex.schema.createTable('config', (table: any) => {
        table.increments('id').primary()
        table.datetime("date").notNull()  
    })
};

exports.down = function (knex: any) {
    return knex.schema.dropTable('config')
};

