const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

const abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "priceFeedAddress",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        stateMutability: "payable",
        type: "fallback",
    },
    {
        inputs: [],
        name: "fund",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [],
        name: "getBalanceInUSD",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getContractBalance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "funderAdd",
                type: "address",
            },
        ],
        name: "getFunders",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "getFundersList",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getPriceFeed",
        outputs: [
            {
                internalType: "contract AggregatorV3Interface",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];

export { abi, contractAddress };
