import "./styles.css";
import {
  Account,
  AccountOnNetwork,
  Address,
  ExtensionProvider,
  SignableMessage,
  ProxyProvider,
  NetworkConfig,
  Transaction,
  TransactionPayload,
  GasLimit,
  Balance,
  ChainID,
  TransactionHash,
  TransactionWatcher,
} from "@elrondnetwork/erdjs";

//login using erdjs
async function handleLogin() {
  let provider = ExtensionProvider.getInstance();
  await provider.init();
  let account = await provider.login();

  let message = new SignableMessage({
    message: Buffer.from("TestMe", "utf8"),
    address: new Address(account),
  });

  let signed = await provider.signMessage(message);
  console.log(signed);
}

async function handleSend() {
  //get address from input
  const destinationAddress = document.getElementById("send-address-input")
    .value;
  // console.log("dest", destinationAddress);

  //get amount in EGLD from input
  const amountToSend = document.getElementById("send-amount-input").value;
  // console.log("amout", amountToSend);

  let provider = ExtensionProvider.getInstance();
  await provider.init();
  let account = await provider.login();

  //sync user Account
  let senderAccount = new Account(account);

  let tx = new Transaction({
    data: new TransactionPayload("T3"),
    gasLimit: new GasLimit(70000),
    receiver: new Address(destinationAddress),
    value: Balance.egld(0.0001),
    // T for testnet, D for devnet
    chainID: new ChainID("D"),
  });

  tx.setNonce(senderAccount.nonce);
  const txSent = await tx.send(provider);

  appendTxText(await txSent.getHash().toString());
}

function appendTxText(text) {
  var element = document.getElementById("transaction-id-container");
  var text = document.createTextNode(text);
  element.appendChild(text);
}

document.getElementById("button-login").onclick = handleLogin;

document.getElementById("button-send").onclick = handleSend;
