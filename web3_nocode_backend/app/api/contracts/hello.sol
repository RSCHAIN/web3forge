// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloStorage {
    string public message;

    constructor(string memory initialMessage) {
        message = initialMessage;
    }

    function setMessage(string memory newMessage) external {
        message = newMessage;
    }
}
