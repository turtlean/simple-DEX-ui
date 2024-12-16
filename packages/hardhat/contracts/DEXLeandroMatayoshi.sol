//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEXLeandroMatayoshi is Ownable {
    address TokenAAddress;
    address TokenBAddress;

    // Events
    event LiquidityAdded(uint256 amountA, uint256 amountB);
    event LiquidityRemoved(uint256 amountA, uint256 amountB);
    event TokensSwapped(address user, string token, uint256 amountIn, uint256 amountOut);

    constructor(address _owner, address _tokenA, address _tokenB) Ownable(_owner) {
        TokenAAddress = _tokenA;
        TokenBAddress = _tokenB;
    }

    function setTokenAAddress(address _tokenA) public onlyOwner {
        TokenAAddress = _tokenA;
    }

    function setTokenBAddress(address _tokenB) public onlyOwner {
        TokenBAddress = _tokenB;
    }

    // user can swap token A for token B
    // the pool keeps the constant product between the two tokens
    function swapAforB(uint256 amountAIn) public {
        // Ensure the contract has been approved to transfer token A
        require(IERC20(TokenAAddress).balanceOf(msg.sender) >= amountAIn, "Insufficient allowance for TokenA");

        // Transfer the tokens from the sender to this contract
        require(IERC20(TokenAAddress).transferFrom(msg.sender, address(this), amountAIn), "Transfer of TokenA failed");

        // Calculate the amount of token B to send back
        uint prevBalanceA = IERC20(TokenAAddress).balanceOf(address(this));
        uint prevBalanceB = IERC20(TokenBAddress).balanceOf(address(this));

        uint amountBOut = prevBalanceB - (prevBalanceA * prevBalanceB) / (prevBalanceA + amountAIn);
        require(IERC20(TokenBAddress).transfer(msg.sender, amountBOut), "Transfer of TokenB failed");

        emit TokensSwapped(msg.sender, "tokenA", amountAIn, amountBOut);
    }

    // user can swap token B for token A
    // the pool keeps the constant product between the two tokens
    function swapBforA(uint256 amountBIn) public {
        // Ensure the contract has been approved to transfer token B
        require(IERC20(TokenBAddress).balanceOf(msg.sender) >= amountBIn, "Insufficient allowance for TokenB");

        // Transfer the tokens from the sender to this contract
        require(IERC20(TokenBAddress).transferFrom(msg.sender, address(this), amountBIn), "Transfer of TokenB failed");

        // Calculate the amount of token A to send back
        uint prevBalanceA = IERC20(TokenAAddress).balanceOf(address(this));
        uint prevBalanceB = IERC20(TokenBAddress).balanceOf(address(this));

        uint amountAOut = prevBalanceA - (prevBalanceA * prevBalanceB) / (prevBalanceB + amountBIn);
        require(IERC20(TokenAAddress).transfer(msg.sender, amountAOut), "Transfer of TokenA failed");

        emit TokensSwapped(msg.sender, "tokenB", amountBIn, amountAOut);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) public onlyOwner {
        // Ensure the contract has been approved to transfer both tokens
        require(
            IERC20(TokenAAddress).allowance(msg.sender, address(this)) >= amountA,
            "Insufficient allowance for TokenA"
        );

        require(
            IERC20(TokenBAddress).allowance(msg.sender, address(this)) >= amountB,
            "Insufficient allowance for TokenB"
        );

        // added amounts from each token don't modify the proportion of tokens A and B
        uint prevBalanceA = IERC20(TokenAAddress).balanceOf(address(this));
        uint prevBalanceB = IERC20(TokenBAddress).balanceOf(address(this));

        if (!(prevBalanceA == 0 && prevBalanceB == 0)) {
            // We handle the special case where there is no balance
            // The owner is expected to provide a non-zero amount for both tokens initially
            require(amountA / amountB == prevBalanceA / prevBalanceB, "Invalid amounts");
        }

        // Transfer the tokens from the sender to this contract
        require(IERC20(TokenAAddress).transferFrom(msg.sender, address(this), amountA), "Transfer of TokenA failed");
        require(IERC20(TokenBAddress).transferFrom(msg.sender, address(this), amountB), "Transfer of TokenB failed");

        emit LiquidityAdded(amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) public onlyOwner {
        // Ensure the contract has enough liquidity to remove
        require(IERC20(TokenAAddress).balanceOf(address(this)) >= amountA, "Insufficient liquidity for TokenA");

        require(IERC20(TokenBAddress).balanceOf(address(this)) >= amountB, "Insufficient liquidity for TokenB");

        // withdrawn amounts from each token don't modify the proportion of tokens A and B
        uint prevBalanceA = IERC20(TokenAAddress).balanceOf(address(this));
        uint prevBalanceB = IERC20(TokenBAddress).balanceOf(address(this));

        require(amountA / amountB == prevBalanceA / prevBalanceB, "Invalid amounts");

        // Transfer the tokens from this contract to the sender
        require(IERC20(TokenAAddress).transfer(msg.sender, amountA), "Transfer of TokenA failed");
        require(IERC20(TokenBAddress).transfer(msg.sender, amountB), "Transfer of TokenB failed");

        emit LiquidityRemoved(amountA, amountB);
    }

    function getPrice(address _token) public view returns (uint256) {
        require(_token == TokenAAddress || _token == TokenBAddress, "Invalid token address");

        uint balanceA = IERC20(TokenAAddress).balanceOf(address(this));
        require(balanceA > 0, "Insufficient tokens A");
        uint balanceB = IERC20(TokenBAddress).balanceOf(address(this));
        require(balanceB > 0, "Insufficient tokens B");

        if (_token == TokenAAddress) {
            // price tokenA
            return balanceB / balanceA;
        } else {
            // price tokenB
            return balanceA / balanceB;
        }
    }
}
