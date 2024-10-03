import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('investment_rescue', (table: any) => {
        table.increments('id').primary()
        table.integer("idInvestment").notNull()
        table.double("value").notNull()
        table.datetime("date").notNull()
        table.integer("id_user").notNull()
        table.string("reason").notNull()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('investment_rescue')
}

