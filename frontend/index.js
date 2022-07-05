import {
    abi,
    contractAddress,
} from "./constants.js";
import { ethers } from "./ethers.min.js";

const connectBtn = document.getElementById("connect-btn");
const fundBtn = document.getElementById("fund-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const balanceBtn = document.getElementById("balance-btn");
const fundersListBtn = document.getElementById("fundersList-btn");

fundersListBtn.onclick = getFundersList;
connectBtn.onclick = connect;
fundBtn.onclick = fund;
withdrawBtn.onclick = withdraw;
balanceBtn.onclick = getBalance;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const res = await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        console.log("signer", signer);
        connectBtn.innerHTML = "Connected";
    } else {
        console.log("No web3 detected. Please install MetaMask first.");
    }
}

async function fund() {
    const ethAmount = document.getElementById("fund-input").value;

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("signer...", signer);

        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            console.log("funding...", contract);
            const tx = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            console.log(`mining at ${tx.hash}`);
            const transactionReceipt = await tx.wait();
            console.log(
                `transaction ${transactionReceipt.confirmations} confirmations`
            );
            getBalance();
        } catch (err) {
            console.log(">>>>>", err);
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("signer...", signer);

        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            console.log("funding...", contract);
            const tx = await contract.withdraw();
            console.log(`mining at ${tx.hash}`);
            const transactionReceipt = await tx.wait();
            console.log(
                `transaction ${transactionReceipt.confirmations} confirmations`
            );
            getBalance();
        } catch (err) {
            console.log("withdraw()", err);
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("signer...", signer);

        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            console.log("getting balance...");
            const balance = await contract.getContractBalance();
            console.log(`balance: ${ethers.utils.formatEther(balance)}`);
            const balancePara = document.getElementById("balance-p");
            balancePara.innerHTML = `Balance: ${ethers.utils.formatEther(
                balance
            )} ether`;
            getFundersList();
        } catch (err) {
            console.log("getBalance()", err);
        }
    }
}

async function getFundersList() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("signer...", signer);

        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            console.log("getting funders list...");
            for (let index = 0; index < 2; index++) {
                const funderAddress = await contract.getFundersList(index);
                const funderBalance = await contract.getFunders(funderAddress);
                const fundersList = document.getElementById("funders-ul");
                const fundersListItem = document.createElement("li");
                fundersListItem.className = "flex py-6";
                fundersListItem.innerHTML = `${funderAddress.toString()} : ${ethers.utils.formatEther(
                    funderBalance
                )} ether`;
                fundersList.append(fundersListItem);
            }
        } catch (err) {
            console.log("getFundersList()", err);
        }
    }
}
