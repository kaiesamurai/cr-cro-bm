// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './Verifier.sol';

contract XoraCreditScore is Ownable {
    event CreditScoreRequestCreated(address indexed _requester, uint indexed _score);

    struct CreditScoreInput {
        uint256 balanceETH;
        uint256 balanceUSD;
        uint256 erc20BalanceETH;
        uint256 erc20BalanceUSD;
        uint256 monthlyIncomeETH;
        uint256 monthlyIncomeUSD;
    }

    struct PredictionWithProof {
        bytes proof;
        bytes32[] publicInputs;
    }

    mapping (address=>CreditScoreInput) addressToInputMap;
    mapping (address=>PredictionWithProof) addressToPrediction;

    AggregatorV3Interface internal immutable priceFeedEthUsd;
    AggregatorV3Interface internal immutable priceFeedLinkEth;
    address erc20TokenAddress;

    mapping (address=>uint256) monthlyIncomeETH;


    constructor() {
        
        // ETH-USD
        priceFeedEthUsd = AggregatorV3Interface(0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41);

        // LINK-ETH (ERC20)
        priceFeedLinkEth = AggregatorV3Interface(0xdC97CA0F3521c7F271555175314b812816ed125B);

        // LINK Scroll Testnet (0x7273ebbB21F8D8AcF2bC12E71a08937712E9E40c)
        erc20TokenAddress = 0x231d45b53C905c3d6201318156BDC725c9c3B9B1;
    }

    /**
     * @notice Returns the latest price
     *
     * @return latest price
     */
    function getLatestPriceEthUsd() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeedEthUsd.latestRoundData();
        return price;
    }

    /**
     * @notice Returns the latest price
     *
     * @return latest price
     */
    function getLatestPriceLinkEth() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeedLinkEth.latestRoundData();
        return price;
    }

    function createCreditScoreRequest(address requester) public returns (CreditScoreInput memory){
        uint256 balanceETH = payable(address(requester)).balance;
        uint256 balanceUSD = balanceETH * uint256(getLatestPriceEthUsd());
        uint256 erc20BalanceETH = IERC20(erc20TokenAddress).balanceOf(address(requester)) * uint256(getLatestPriceLinkEth());
        uint256 erc20BalanceUSD = erc20BalanceETH * uint256(getLatestPriceEthUsd());
        uint256 monthlyIncomeUSD = monthlyIncomeETH[requester] * uint256(getLatestPriceEthUsd());
        CreditScoreInput memory item = CreditScoreInput(balanceETH, balanceUSD, erc20BalanceETH, erc20BalanceUSD, monthlyIncomeETH[requester], monthlyIncomeUSD);
        addressToInputMap[requester] = item;
        return item;
    }

    function verifyCreditScorePrediction(address requester, bytes calldata _proof, bytes32[] calldata _publicInputs) public returns (bool) {
        bool verification = UltraVerifier(requester).verify(_proof, _publicInputs);
        if (verification) {
            addressToPrediction[requester] = PredictionWithProof(_proof, _publicInputs);
        }
        return verification;
    }

    function setMonthlyIncomeETH(address requester, uint256 amount) public {
        monthlyIncomeETH[requester] = amount;
    }

    function getCreditScoreInput(address requester) public view returns (CreditScoreInput memory) {
        uint256 balanceETH = payable(address(requester)).balance;
        uint256 balanceUSD = balanceETH * uint256(getLatestPriceEthUsd());
        uint256 erc20BalanceETH = IERC20(erc20TokenAddress).balanceOf(address(requester)) * uint256(getLatestPriceLinkEth());
        uint256 erc20BalanceUSD = erc20BalanceETH * uint256(getLatestPriceEthUsd());
        uint256 monthlyIncomeUSD = monthlyIncomeETH[requester] * uint256(getLatestPriceEthUsd());
        CreditScoreInput memory item = CreditScoreInput(balanceETH, balanceUSD, erc20BalanceETH, erc20BalanceUSD, monthlyIncomeETH[requester], monthlyIncomeUSD);
        return item;
    }
}
