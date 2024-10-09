module.exports = class Data1728513023733 {
    name = 'Data1728513023733'

    async up(db) {
        await db.query(`CREATE TABLE "erc20_payment_received" ("id" character varying NOT NULL, "token" text NOT NULL, "from" text NOT NULL, "amount" numeric NOT NULL, "payment_id" text NOT NULL, "merchant" text NOT NULL, "royalty_amount" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a95e4781fe431badc59f01a17e1" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_1f04d439c10e331e8cd4afdedc" ON "erc20_payment_received" ("timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "erc20_payment_received"`)
        await db.query(`DROP INDEX "public"."IDX_1f04d439c10e331e8cd4afdedc"`)
    }
}
