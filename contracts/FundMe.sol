// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./PriceConvertor.sol";
import "hardhat/console.sol";

contract FundMe {
    using PriceConvertor for uint256;

    address private immutable i_owner;
    uint256 private constant MIN_USD = 50 * 1e18;

    mapping(address => uint256) private s_funders;
    address[] private s_fundersList;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "not an owner");
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        // 1000000000000000000 WEI == 1e18 == 1 ETH
        require(
            msg.value.getConversionPrice(s_priceFeed) >= MIN_USD,
            "didn't send enough"
        );
        s_funders[msg.sender] += msg.value;
        s_fundersList.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        address[] memory fundersArr = s_fundersList;
        for (
            uint256 funderIndex = 0;
            funderIndex < fundersArr.length;
            funderIndex++
        ) {
            address funderAdd = fundersArr[funderIndex];
            s_funders[funderAdd] = 0;
        }
        s_fundersList = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getBalanceInUSD() public view returns (uint256) {
        uint256 ethBalance = address(this).balance;
        return ethBalance.getConversionPrice(s_priceFeed);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFunders(address funderAdd) public view returns (uint256) {
        return s_funders[funderAdd];
    }

    function getFundersList(uint256 index) public view returns (address) {
        return s_fundersList[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
