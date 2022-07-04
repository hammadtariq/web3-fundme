const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

describe("FundMe", function () {
    let fundMe;
    let mockV3Aggregator;
    let deployer;
    const sendValue = ethers.utils.parseEther("1");
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund()", function () {
        it("should revert if amount is less than expected", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "should be greater than zero."
            );
        });
        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getFunders(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });
        it("Updates the getFunders list", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getFundersList(0);
            assert.equal(response, deployer);
        });
    });

    describe("withdraw()", function () {
        let account1;
        beforeEach(async () => {
            const accounts = await ethers.getSigners();
            account1 = accounts[1];
            await fundMe.fund({ value: sendValue });
        });

        it("withdraws ETH from the contract", async () => {
            const contractStartingBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const transactionReceipt = await fundMe.withdraw();
            await transactionReceipt.wait(1);
            const contractEndBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            expect(contractStartingBalance).to.equal(sendValue);
            expect(contractEndBalance).to.equal(0);
        });

        it("withdraws ETH amount transferred to deployer", async () => {
            // Arrange
            const contractStartingBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const ownerStartingBalance = await fundMe.provider.getBalance(
                deployer
            );
            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait();
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const ownerEndBalance = await fundMe.provider.getBalance(deployer);
            // Assert
            expect(
                contractStartingBalance.add(ownerStartingBalance).toString()
            ).to.equal(ownerEndBalance.add(gasCost).toString());
        });

        it("should revert if withdrawer is not owner", async () => {
            await expect(
                fundMe.connect(account1).withdraw()
            ).to.be.revertedWith("not an owner");
        });
        it("should empty single funder", async () => {
            await fundMe.withdraw();
            await expect(fundMe.getFundersList(0)).to.be.reverted;
        });
        it("is allows us to withdraw with multiple getFunders", async () => {
            // Arrange
            const accounts = await ethers.getSigners();
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Act
            const transactionResponse = await fundMe.withdraw();
            // Let's compare gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait();
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
            console.log(`GasCost: ${withdrawGasCost}`);
            console.log(`GasUsed: ${gasUsed}`);
            console.log(`GasPrice: ${effectiveGasPrice}`);
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString()
            );
            // Make a getter for storage variables
            await expect(fundMe.getFundersList(0)).to.be.reverted;

            for (i = 1; i < 6; i++) {
                const response = await fundMe.getFunders(accounts[i].address);
                assert.equal(response.toString(), 0);
            }
        });
    });
});
