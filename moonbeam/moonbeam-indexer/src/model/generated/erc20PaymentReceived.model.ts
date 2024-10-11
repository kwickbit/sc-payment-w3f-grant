import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, Index as Index_} from "@subsquid/typeorm-store"

@Entity_()
export class ERC20PaymentReceived {
    constructor(props?: Partial<ERC20PaymentReceived>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    token!: string

    @StringColumn_({nullable: false})
    from!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @StringColumn_({nullable: false})
    paymentId!: string

    @StringColumn_({nullable: false})
    merchant!: string

    @BigIntColumn_({nullable: false})
    royaltyAmount!: bigint

    @Index_()
    @DateTimeColumn_({nullable: false})
    timestamp!: Date
}
