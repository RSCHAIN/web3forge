// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleRegistry {
    struct Profile {
        string handle;
        uint64 createdAt;
    }

    mapping(address => Profile) public profiles;

    event Registered(address indexed user, string handle);

    function register(string calldata handle) external {
        require(bytes(handle).length > 0, "empty handle");
        profiles[msg.sender] = Profile(handle, uint64(block.timestamp));
        emit Registered(msg.sender, handle);
    }
}
