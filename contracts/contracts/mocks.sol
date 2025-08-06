
// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract MockSelfHub {
    function verify(bytes calldata) external pure returns (bool) {
        return true;
    }
}

contract DemoToken {
    mapping(address => uint256) public balanceOf;
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
