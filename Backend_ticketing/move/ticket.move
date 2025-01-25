module ticket_nft::ticket {
    use std::string;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_token::token;

    struct TicketNFT has key {
        collection: string::String,
        token_data_id: token::TokenDataId,
        signer_cap: account::SignerCapability,
    }

    struct TicketMintEvent has drop, store {
        token_id: token::TokenId,
        receiver: address,
        event_name: string::String,
    }

    const COLLECTION_NAME: vector<u8> = b"DTIX_TICKETS";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Digital tickets for events";
    const COLLECTION_URI: vector<u8> = b"https://dtix.com/tickets";

    public entry fun initialize(account: &signer) {
        let collection = string::utf8(COLLECTION_NAME);
        
        token::create_collection(
            account,
            collection,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_URI),
            true,  // mutable
            true,  // allow_public_mint
            true,  // allow_public_burn
        );

        move_to(account, TicketNFT {
            collection,
            token_data_id: token::create_tokendata(
                account,
                collection,
                string::utf8(b"Ticket"),
                string::utf8(b"DTIX Event Ticket"),
                1,  // max supply per token
                string::utf8(COLLECTION_URI),
                signer::address_of(account),
                1,  // royalty_points_denominator
                0,  // royalty_points_numerator
                token::create_token_mutability_config(&vector<bool>[true, true, true, true, true]),
                vector<String>[],  // property_keys
                vector<vector<u8>>[],  // property_values
                vector<String>[],  // property_types
            ),
            signer_cap: account::create_signer_capability(account),
        });
    }

    public entry fun mint_ticket(
        admin: &signer,
        receiver: address,
        event_name: vector<u8>,
        event_date: vector<u8>,
        seat_number: vector<u8>
    ) acquires TicketNFT {
        let ticket_nft = borrow_global_mut<TicketNFT>(signer::address_of(admin));
        
        let token_id = token::mint_token(
            admin,
            ticket_nft.collection,
            string::utf8(event_name),
            string::utf8(b""),
            1,  // amount
            vector<String>[string::utf8(b"event_date"), string::utf8(b"seat")],
            vector<vector<u8>>[event_date, seat_number],
            vector<String>[string::utf8(b"string"), string::utf8(b"string")],
        );

        token::direct_transfer(admin, receiver, token_id, 1);

        event::emit(TicketMintEvent {
            token_id,
            receiver,
            event_name: string::utf8(event_name),
        });
    }
}