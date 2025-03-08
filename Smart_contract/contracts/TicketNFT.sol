// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TicketNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    // Simple counter for token IDs
    uint256 private _tokenIds;
    
    // Event ID to next token sequence map (for ensuring uniqueness per event)
    mapping(string => uint256) private _eventTokenSeq;
    
    // Basic ticket information stored on-chain
    struct Ticket {
        string eventId;
        string seat;
        address originalOwner;
    }
    
    // Mapping from tokenId to Ticket details
    mapping(uint256 => Ticket) public tickets;
    
    // Mapping from eventId to seat to tokenId (to prevent duplicate tickets for the same seat)
    mapping(string => mapping(string => uint256)) public eventSeatToToken;
    
    // Events
    event TicketMinted(uint256 tokenId, address owner, string eventId, string seat);
    
    constructor() ERC721("DTIXTicket", "DTIX") Ownable(msg.sender) {}
    
    // Function to mint a new ticket NFT with unique token ID per event
    function mintTicket(
        address recipient,
        string memory eventId,
        string memory seat,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        // Check if seat is already taken for this event
        require(eventSeatToToken[eventId][seat] == 0, "Seat already taken");
        
        // Increment the global token ID counter
        _tokenIds += 1;
        
        // Get the next sequence for this event
        _eventTokenSeq[eventId] += 1;
        
        // Create a unique token ID by combining global counter with event-specific sequence
        // Format: eventID prefix + event sequence (padded)
        string memory eventPrefix = substring(bytes(eventId), 0, 4);
        uint256 eventSeq = _eventTokenSeq[eventId];
        
        // Create a unique integer hash from the eventPrefix and sequence
        uint256 newTokenId = uint256(keccak256(abi.encodePacked(eventPrefix, eventSeq.toString(), _tokenIds.toString()))) % 1_000_000_000;
        
        // Make sure token ID is always positive and above 1
        newTokenId = newTokenId > 0 ? newTokenId : _tokenIds + 100_000;
        
        // Store ticket information
        tickets[newTokenId] = Ticket({
            eventId: eventId,
            seat: seat,
            originalOwner: recipient
        });
        
        // Mint the NFT
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Store mapping from event and seat to tokenId
        eventSeatToToken[eventId][seat] = newTokenId;
        
        emit TicketMinted(newTokenId, recipient, eventId, seat);
        
        return newTokenId;
    }
    
    // Function to verify a ticket's validity
    function verifyTicket(uint256 tokenId) external view returns (bool, string memory, string memory, address) {
        require(_exists(tokenId), "Ticket does not exist");
        Ticket memory ticket = tickets[tokenId];
        return (true, ticket.eventId, ticket.seat, ownerOf(tokenId));
    }
    
    // Check if a token exists (helper function)
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Helper function to get a substring from a bytes array
    function substring(bytes memory str, uint start, uint len) internal pure returns (string memory) {
        bytes memory result = new bytes(len);
        for(uint i = 0; i < len; i++) {
            if (start + i < str.length) {
                result[i] = str[start + i];
            } else {
                result[i] = 0x00;  // Pad with null if needed
            }
        }
        return string(result);
    }
}