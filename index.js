import { ethers } from "./ethers.js";
import { contractAddress, abi } from "./constant.js";
const btn_connect = document.getElementById("btn_connect");
const btn_signature = document.getElementById("btn_signature");
const btn_permit = document.getElementById("btn_permit");

btn_connect.onclick = connect;
btn_signature.onclick = Signature;
btn_permit.onclick = PermitAndTransfer;

async function connect() {
  if (typeof window.ethereum != "undefined") {
    console.log("Connecting to metamask...");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected");
  } else {
    console.log("No metamask!!!");
  }
}
async function Signature() {
  if (typeof window.ethereum != "undefined") {
    console.log("Signature...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const domain = {
      name: "TestToken",
      version: "1",
      chainId: 11155111,
      verifyingContract: contractAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value = 10000000000;

    const nonce = await contract.nonces(signerAddress);
    const deadline = ethers.constants.MaxUint256;
    const message = {
      owner: signerAddress,
      spender: "0x843F0F7BBF1da45651f6f302162f4B0d04B996CB",
      value: value,
      nonce: nonce,
      deadline: deadline,
    };

    //使用钱包A生成链下的签名
    const signature = await signer._signTypedData(domain, types, message);

    const { v, r, s } = ethers.utils.splitSignature(signature);
    console.log(v);
    console.log(r);
    console.log(s);

    // const transActionResponse = await contract.submitTransaction(
    //   address,
    //   ethers.utils.parseEther(ethAmount),
    //   tokenaddress
    // );
    // await listenForTransactionMine(transActionResponse, provider);
    console.log("Signature Finished");
  } else {
    console.log("No metamask!!!");
  }
}
async function PermitAndTransfer() {
  if (typeof window.ethereum != "undefined") {
    console.log("PermitAndTransfer...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log(111111111111);
    const value = 10000000000;
    const deadline = ethers.constants.MaxUint256;
    const v = 27;
    const r =
      "0x3b7db358fefd6a4740838afc8b1acd57a215264e8759dcb490e2f0f45409f093";
    const s =
      "0x540372969efb9ffd871d7304f91f84be9ca1b25b20b4d6be3b2ceab5ade2a565";
    const gasLimit = 1000000;
    console.log(111111111111);

    const transActionResponse = await contract.permit(
      "0x294e0bCC654D249eA6EF17f9f83d20B58999C921",
      "0x843F0F7BBF1da45651f6f302162f4B0d04B996CB",
      value,
      deadline,
      v,
      r,
      s,
      { gasLimit }
    );
    console.log(111111111111);

    // const transActionResponse = await contract.confirmTransaction(Index);
    await listenForTransactionMine(transActionResponse, provider);
    console.log("Permit Finished");

    const transActionResponse1 = await contract.transferFrom(
      "0x294e0bCC654D249eA6EF17f9f83d20B58999C921",
      "0x843F0F7BBF1da45651f6f302162f4B0d04B996CB",
      5000000000
    );

    // const transActionResponse = await contract.confirmTransaction(Index);
    await listenForTransactionMine(transActionResponse1, provider);
    console.log("Transfer Finished");
  } else {
    console.log("No metamask!!!");
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
