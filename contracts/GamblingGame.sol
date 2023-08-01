// SPDX-License-Identifier: MIT

// DO NOT INTERECT DIRECTLY WITH THIS CONTRACT, YOU SHOULD USE THE TELEGRAM BOT OR YOU WILL LOOSE YOUR FUNDS
// http://t.me/bubbles_erc_bot

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GamblingGame is Ownable {
    uint256 public minimumBet;
    uint256 public multiplier = 2;
    uint256 public totalBet;
    uint256 public numberOfBets;
    IERC20 public token;
    address public gameWalletCallerAddress;
    address[] public players;
    address[] public lastBetters;
    mapping(address => uint256) public playerTotalBets;
    mapping(address => uint256) public playerCurrentBet;
    mapping(address => uint256) public playerTotalClaimable;
    mapping(address => bool) peopleWhoBet;

    constructor(address _token) {
        minimumBet = 100 * 1e18;
        token = IERC20(_token);
    }

    /**
     * @dev Modifies the minimum bet amount.
     * @param _minimumBet The minimum bet amount.
     */
    function setMinimumBet(uint256 _minimumBet) public onlyOwner {
        minimumBet = _minimumBet;
    }
    
    /**
     * @dev Modifies the Game Caller address.
     * @param _gameWalletCallerAddress The new Game Caller address.
     */
    function setGameWalletCallerAddress(address _gameWalletCallerAddress) external onlyOwner {
        gameWalletCallerAddress = _gameWalletCallerAddress;
    }

    /**
     * @dev Modifies the multiplier.
     * @param _multiplier The new multiplier.
     */
    function setMultiplier(uint256 _multiplier) external onlyOwner {
        multiplier = _multiplier;
    }

    /**
     * @dev Places a bet.
     * @param _bet The user's betting amount for this game.
     */
    function bet(uint256 _bet) external {
        require(_bet > 0, "Amount must be greater than 0");
        require(_bet >= minimumBet, "Amount must be greater than the minimum bet");

        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _bet, "You need to approve the token transfer first");

        bool success = token.transferFrom(msg.sender, address(this), _bet);
        require(success, "Token transfer failed");

        playerCurrentBet[msg.sender] = _bet;
        playerTotalBets[msg.sender] += _bet;
        totalBet += _bet;
        numberOfBets++;
        lastBetters.push(msg.sender);

        if (lastBetters.length > 20) {
            delete lastBetters[0];
            for (uint i = 0; i < lastBetters.length - 1; i++) {
                lastBetters[i] = lastBetters[i + 1];
            }
            lastBetters.pop();
        }

        if (!peopleWhoBet[msg.sender]) {
            peopleWhoBet[msg.sender] = true;
            players.push(msg.sender);
        }
    }

    /**
     * @dev Double the bet amount if the participant wins.
     * @param _participant The participant's address.
     * @notice This function is called by the Game Wallet, it is important to have a trusted tier using this Game Wallet.
     */
    function incrementTotalClaimable(address _participant) external {
        require(
            msg.sender == owner() || msg.sender == gameWalletCallerAddress,
            "Forbidden"
        );
        playerTotalClaimable[_participant] += playerCurrentBet[_participant] * multiplier;
        playerCurrentBet[_participant] = 0;
    }

    /**
     * @dev Reset the bet amount if the participant loses.
     * @param _participant The participant's address.
     * @notice This function is called by the Game Wallet, it is important to have a trusted tier using this Game Wallet.
     */
    function gameLost(address _participant) external {
        require(
            msg.sender == owner() || msg.sender == gameWalletCallerAddress,
            "Forbidden"
        );
        playerCurrentBet[_participant] = 0;
    }

    /**
     * @dev Allow the user to claim their claimable balance.
     */
    function claimPrize() external {
        require(playerTotalClaimable[msg.sender] > 0, "Nothing to claim");
        bool success = token.transfer(msg.sender, playerTotalClaimable[msg.sender]);
        require(success, "Token transfer failed");
        playerTotalClaimable[msg.sender] = 0;
    }

    /**
     * @dev Returns the list of all players who played at least once.
     */
    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    /**
     * @dev Returns the list of lasts 20 players.
     */
    function getLastBetters() external view returns (address[] memory) {
        return lastBetters;
    }

    /**
     * @dev Allow the owner to withdraw all the contract's balance for the used token.
     */
    function withdraw() external onlyOwner {
        bool success = token.transfer(owner(), token.balanceOf(address(this)));
        require(success, "Token transfer failed");
    }

    /**
     * @dev Allow the owner to withdraw a specific amount of the contract's balance for the used token.
     * @param _amount The amount to withdraw.
     */
    function withdrawAmount(uint256 _amount) external onlyOwner {
        bool success = token.transfer(owner(), _amount);
        require(success, "Token transfer failed");
    }
}
