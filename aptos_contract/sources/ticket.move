module ticket_booking::ticket {
    use std::string::{String};
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};
    use std::signer;  // Add this import
    
    struct Ticket has key {
        tickets: Table<u64, TicketInfo>,
        ticket_counter: u64,
        ticket_events: event::EventHandle<TicketEvent>,
    }

    struct TicketInfo has store, drop, copy {
        id: u64,
        destination: String,
        price: u64,
        owner: address,
        is_valid: bool
    }

    struct TicketEvent has store, drop {
        ticket_id: u64,
        buyer: address,
        destination: String
    }

    public entry fun initialize(account: &signer) {
        let tickets = table::new();
        move_to(account, Ticket {
            tickets,
            ticket_counter: 0,
            ticket_events: account::new_event_handle<TicketEvent>(account)
        });
    }

    public entry fun book_ticket(
        account: &signer,
        destination: String,
        price: u64
    ) acquires Ticket {
        let buyer = signer::address_of(account);
        let ticket_store = borrow_global_mut<Ticket>(@ticket_booking);
        
        let ticket_id = ticket_store.ticket_counter + 1;
        let ticket = TicketInfo {
            id: ticket_id,
            destination,
            price,
            owner: buyer,
            is_valid: true
        };

        table::add(&mut ticket_store.tickets, ticket_id, ticket);
        ticket_store.ticket_counter = ticket_id;

        event::emit_event(&mut ticket_store.ticket_events, TicketEvent {
            ticket_id,
            buyer,
            destination
        });
    }
}