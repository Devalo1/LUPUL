// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract LupulSiCorbulEmblems is ERC721Enumerable, Ownable, ReentrancyGuard, ERC2981 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Emblem Types
    enum EmblemType { LupulIntelepta, CorbulMistic, GardianulWellness, Cautatorul }
    
    struct EmblemMetadata {
        EmblemType emblemType;
        uint256 tier;
        uint256 mintTimestamp;
        uint256 engagement;
        string rarity; // "common", "rare", "epic", "legendary"
        uint256 strength;
        uint256 wisdom;
        uint256 mysticism;
        uint256 wellness;
    }
    
    struct EmblemCollection {
        string name;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 price;
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => EmblemMetadata) public emblemMetadata;
    mapping(EmblemType => EmblemCollection) public collections;
    mapping(address => bool) public hasEmblem;
    mapping(uint256 => uint256) public emblemEngagement;
    
    // Events
    event EmblemMinted(address indexed to, uint256 indexed tokenId, EmblemType emblemType, string rarity);
    event EngagementUpdated(uint256 indexed tokenId, uint256 newEngagement);
    event RoyaltyPaid(address indexed recipient, uint256 amount);
    
    // Constants
    uint256 public constant ROYALTY_PERCENTAGE = 750; // 7.5%
    uint256 private constant MAX_ENGAGEMENT = 10000;
    
    constructor() ERC721("Lupul si Corbul Emblems", "LSCEM") {
        // Initialize collections with Romanian pricing (in wei equivalent to RON)
        collections[EmblemType.LupulIntelepta] = EmblemCollection({
            name: "Lupul Intelepta",
            maxSupply: 10,
            currentSupply: 0,
            price: 0.03 ether, // ~150 RON equivalent
            isActive: true
        });
        
        collections[EmblemType.CorbulMistic] = EmblemCollection({
            name: "Corbul Mistic", 
            maxSupply: 15,
            currentSupply: 0,
            price: 0.024 ether, // ~120 RON equivalent
            isActive: true
        });
        
        collections[EmblemType.GardianulWellness] = EmblemCollection({
            name: "Gardianul Wellness",
            maxSupply: 25, 
            currentSupply: 0,
            price: 0.016 ether, // ~80 RON equivalent
            isActive: true
        });
        
        collections[EmblemType.Cautatorul] = EmblemCollection({
            name: "Cautatorul de Lumina",
            maxSupply: 50,
            currentSupply: 0, 
            price: 0.01 ether, // ~50 RON equivalent
            isActive: true
        });
        
        // Set default royalty
        _setDefaultRoyalty(owner(), ROYALTY_PERCENTAGE);
    }
    
    function mintEmblem(EmblemType _emblemType) external payable nonReentrant {
        require(collections[_emblemType].isActive, "Collection not active");
        require(!hasEmblem[msg.sender], "User already has an emblem");
        require(collections[_emblemType].currentSupply < collections[_emblemType].maxSupply, "Collection sold out");
        require(msg.value >= collections[_emblemType].price, "Insufficient payment");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Generate unique metadata
        EmblemMetadata memory metadata = _generateMetadata(_emblemType, msg.sender);
        emblemMetadata[newTokenId] = metadata;
        
        // Update collection supply
        collections[_emblemType].currentSupply++;
        
        // Mark user as having emblem
        hasEmblem[msg.sender] = true;
        
        // Mint NFT
        _safeMint(msg.sender, newTokenId);
        
        emit EmblemMinted(msg.sender, newTokenId, _emblemType, metadata.rarity);
        
        // Refund excess payment
        if (msg.value > collections[_emblemType].price) {
            payable(msg.sender).transfer(msg.value - collections[_emblemType].price);
        }
    }
    
    function _generateMetadata(EmblemType _emblemType, address _user) private view returns (EmblemMetadata memory) {
        // Generate pseudo-random attributes based on user address and timestamp
        uint256 userSeed = uint256(keccak256(abi.encodePacked(_user, block.timestamp, block.difficulty)));
        
        // Determine rarity (probabilities: 70% common, 20% rare, 8% epic, 2% legendary)
        uint256 rarityRoll = userSeed % 100;
        string memory rarity;
        if (rarityRoll >= 98) rarity = "legendary";
        else if (rarityRoll >= 90) rarity = "epic"; 
        else if (rarityRoll >= 70) rarity = "rare";
        else rarity = "common";
        
        // Generate attributes (50-100 range)
        uint256 strength = 50 + (userSeed % 51);
        uint256 wisdom = 50 + ((userSeed >> 8) % 51);
        uint256 mysticism = 50 + ((userSeed >> 16) % 51);
        uint256 wellness = 50 + ((userSeed >> 24) % 51);
        
        return EmblemMetadata({
            emblemType: _emblemType,
            tier: uint256(_emblemType) + 1,
            mintTimestamp: block.timestamp,
            engagement: 0,
            rarity: rarity,
            strength: strength,
            wisdom: wisdom,
            mysticism: mysticism,
            wellness: wellness
        });
    }
    
    function updateEngagement(uint256 _tokenId, uint256 _newEngagement) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        require(_newEngagement <= MAX_ENGAGEMENT, "Engagement too high");
        
        emblemEngagement[_tokenId] = _newEngagement;
        emblemMetadata[_tokenId].engagement = _newEngagement;
        
        emit EngagementUpdated(_tokenId, _newEngagement);
    }
    
    function getEmblemsByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(_owner, i);
        }
        
        return tokens;
    }
    
    function getAvailableSupply(EmblemType _emblemType) external view returns (uint256) {
        return collections[_emblemType].maxSupply - collections[_emblemType].currentSupply;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    function setCollectionPrice(EmblemType _emblemType, uint256 _newPrice) external onlyOwner {
        collections[_emblemType].price = _newPrice;
    }
    
    function toggleCollection(EmblemType _emblemType) external onlyOwner {
        collections[_emblemType].isActive = !collections[_emblemType].isActive;
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update hasEmblem mapping when transferring
        if (from != address(0)) {
            hasEmblem[from] = balanceOf(from) > 1;
        }
        if (to != address(0)) {
            hasEmblem[to] = true;
        }
    }
    
    // Metadata URI (will point to IPFS)
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        EmblemMetadata memory metadata = emblemMetadata[tokenId];
        
        // In production, this should return IPFS hash with metadata JSON
        return string(abi.encodePacked(
            "https://lupulsicorbul.com/api/metadata/",
            Strings.toString(tokenId)
        ));
    }
}
