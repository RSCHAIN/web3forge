// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public value;

    event ValueChanged(address indexed by, uint256 newValue);

    function inc() external {
        value += 1;
        emit ValueChanged(msg.sender, value);
    }

    function add(uint256 x) external {
        value += x;
        emit ValueChanged(msg.sender, value);
    }
}
