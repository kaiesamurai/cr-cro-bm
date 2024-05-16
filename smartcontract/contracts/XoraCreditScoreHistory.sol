// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';

contract XoraCreditScoreHistory is Ownable {
    event CreditScoreRequestCreated(address indexed _requester, uint indexed _score);

    struct CreditScoreRequest {
        address requester;
        string[] proofs;
        uint score;
        uint timestamp;
    }

    CreditScoreRequest[] public creditScoreRequests;

    constructor() {}

    function addCreditScoreRequest(address requester, string[] memory proofs, uint score) public onlyOwner {
        emit CreditScoreRequestCreated(requester, score);
        creditScoreRequests.push(CreditScoreRequest(requester, proofs, score, block.timestamp));
    }

    function getCreditScoreRequests() public view returns (CreditScoreRequest[] memory) {
        return creditScoreRequests;
    }
}
