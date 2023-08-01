pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

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
     * @dev Allow the user to claim their claimable balance.
     */
    function claimPrize() external {
        require(playerTotalClaimable[msg.sender] > 0, "Nothing to claim");
        bool success = token.transfer(msg.sender, playerTotalClaimable[msg.sender]);
        require(success, "Token transfer failed");
        playerTotalClaimable[msg.sender] = 0;
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

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

