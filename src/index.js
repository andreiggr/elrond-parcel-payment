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
  ChainID
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
    data: new TransactionPayload("First trans"),
    gasLimit: new GasLimit(70000),
    receiver: new Address(
      "erd14ntyrv83dw72u9jmkl45nww4a0qeyjxlf0dsy4cvkwjetljkrneqzj27d7"
    ),
    value: Balance.egld(0.0001),
    chainID: new ChainID("1")
  });

  tx.setNonce(senderAccount.nonce);
  await tx.send(provider);
}

document.getElementById("button-login").onclick = handleLogin;

document.getElementById("button-send").onclick = handleSend;
