module.exports = class Data1727883118982 {
    name = 'Data1727883118982'

    async up(db) {
        await db.query(`CREATE TABLE "erc20_payment_received" ("id" character varying NOT NULL, "token" text NOT NULL, "from" text NOT NULL, "amount" numeric NOT NULL, "payment_id" text NOT NULL, "merchant" text NOT NULL, "royalty_amount" numeric NOT NULL, CONSTRAINT "PK_a95e4781fe431badc59f01a17e1" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "erc20_payment_received"`)
    }
}
