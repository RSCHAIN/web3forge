// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrossAppAuth {
    struct Challenge {
        address app;      // AppA (émetteur)
        uint64 expiresAt;
        bool exists;
    }

    mapping(bytes32 => Challenge) public challenges;
    mapping(bytes32 => mapping(address => bool)) public completed;

    event ChallengeCreated(bytes32 indexed challengeId, address indexed app, uint64 expiresAt);
    event ChallengeCompleted(bytes32 indexed challengeId, address indexed user);

    function createChallenge(bytes32 challengeId, uint64 ttlSeconds) external {
        require(!challenges[challengeId].exists, "exists");
        uint64 expiresAt = uint64(block.timestamp) + ttlSeconds;
        challenges[challengeId] = Challenge(msg.sender, expiresAt, true);
        emit ChallengeCreated(challengeId, msg.sender, expiresAt);
    }

    function complete(
        bytes32 challengeId,
        bytes32 digest,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        Challenge memory c = challenges[challengeId];
        require(c.exists, "unknown");
        require(block.timestamp <= c.expiresAt, "expired");
        require(!completed[challengeId][msg.sender], "already");

        // digest OFF-CHAIN : keccak256(abi.encodePacked("XAPP:", challengeId, msg.sender))
        address recovered = ecrecover(toEthSignedMessageHash(digest), v, r, s);
        require(recovered == msg.sender, "not owner");

        completed[challengeId][msg.sender] = true;
        emit ChallengeCompleted(challengeId, msg.sender);
    }

    function toEthSignedMessageHash(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
