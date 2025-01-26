module 0x0::ibt {
    use sui::coin;
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::object::UID;

    // Struct representing the IBT token
    struct IBT has drop {}

    // TreasuryCap to manage the IBT token
    struct TreasuryCap has key {
        id: UID,
    }

    // Initialize the IBT token
    fun init(witness: IBT, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(witness, 18, b"IBT", b"IBT", b"", option::none(), ctx);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::public_transfer(metadata, tx_context::sender(ctx));
    }

    // Mint new IBT tokens
    public entry fun mint(treasury_cap: &mut coin::TreasuryCap<IBT>, amount: u64, recipient: address, ctx: &mut TxContext) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    // Burn IBT tokens
    public entry fun burn(treasury_cap: &mut coin::TreasuryCap<IBT>, coin: coin::Coin<IBT>) {
        coin::burn(treasury_cap, coin);
    }
}