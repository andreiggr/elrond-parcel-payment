import "./styles.css";
import {
  Account,
  Address,
  ExtensionProvider,
  SignableMessage,
  Transaction,
  TransactionPayload,
  GasLimit,
  Balance,
  ChainID,
  WalletConnectProvider,
  ProxyProvider,
} from "@elrondnetwork/erdjs";
import QRCode from "qrcode";
import { proxy } from "./config";
import { checkAddressValidity, checkAmountValidity } from "./util";

var qrcodeCanvas = document.getElementById("qrcode");

//get address from input
var destinationAddress = document.getElementById("send-address-input").value;
// console.log("dest", destinationAddress);

//get amount in EGLD from input
var amountToSend = document.getElementById("send-amount-input").value;

var inputElAddress = document.getElementById("send-address-input");

inputElAddress.oninput = async (e) => {
  var address = e.target.value;
  var validAddress = false;

  const isAddressValid = await checkAddressValidity(address);
  if (isAddressValid !== false) {
    console.log("it's a valid address", address);
    inputElAddress.classList.remove("invalid-input");
    inputElAddress.classList.add("valid-input");
  } else {
    console.log("its not a valid address", address);
    inputElAddress.classList.remove("valid-input");
    inputElAddress.classList.add("invalid-input");
  }
};

var inputElAmount = document.getElementById("send-amount-input");

inputElAmount.oninput = async (e) => {
  var amount = e.target.value;
  validAmount = checkAmountValidity(amount);

  if (validAmount) {
    console.log("it's a valid amount", amount);
    inputElAmount.classList.remove("invalid-input");
    inputElAmount.classList.add("valid-input");
  } else {
    console.log("its not a valid amount", amount);
    inputElAmount.classList.remove("valid-input");
    inputElAmount.classList.add("invalid-input");
  }
};

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

function generatePaymentQR(qrcodeCanvas, payUri) {
  QRCode.toCanvas(qrcodeCanvas, payUri, function(error) {
    if (error) console.error(error);
    console.log("qrcode generated!");
  });
}

async function handleSendWeb() {
  let provider = ExtensionProvider.getInstance();
  await provider.init();
  let account = await provider.login();

  //sync user Account
  let senderAccount = new Account(account);

  //load tx data
  let tx = new Transaction({
    data: new TransactionPayload("T3"),
    gasLimit: new GasLimit(70000),
    receiver: new Address(destinationAddress),
    value: Balance.egld(amountToSend),
    // T for testnet, D for devnet, 1 for mainnet
    chainID: new ChainID("D"),
  });

  //sent tx
  tx.setNonce(senderAccount.nonce);
  const txSent = await tx.send(provider);

  //get transaction ID and append it in the tx div
  appendTxText(await txSent.getHash().toString());
}

async function handleSendQR() {
  //sync user Account
  // let senderAccount = new Account(account);

  //load tx data
  let tx = new Transaction({
    data: new TransactionPayload("T3"),
    gasLimit: new GasLimit(70000),
    receiver: new Address(destinationAddress),
    value: Balance.egld(amountToSend),
    // T for testnet, D for devnet, 1 for mainnet
    chainID: new ChainID("D"),
  });

  let walletConnect = new WalletConnectProvider(
    proxy,
    "https://bridge.walletconnect.org",
    {
      onClientLogin: async () => {
        walletConnect.getAddress().then((address) => {
          console.log("connected to:", address);
        });

        let account = new Account(
          new Address(await walletConnect.getAddress())
        );
        await account.sync(proxy);
        tx.setNonce(account.nonce);
        walletConnect
          .sendTransaction(tx)
          .then((hash) => appendTxText(hash.getHash().toString()))
          .catch((error) => console.log("oops error", error));
        // console.log(result.hash.toString());
      },
      onClientLogout: () => {
        console.log("logout");
      },
    }
  );

  //initialize walletconnect
  if (!walletConnect.isInitialized()) {
    walletConnect.init();
  }

  //trigger login to connect with walletconnect in maiar first
  walletConnect.login().then((walletConnectUri) => {
    if (walletConnectUri) {
      generatePaymentQR(qrcodeCanvas, walletConnectUri);
    }
  });
}

function appendTxText(text) {
  var element = document.getElementById("transaction-id-container");
  var text = document.createTextNode(text);
  element.appendChild(text);
}

document.getElementById("button-login").onclick = handleLogin;

document.getElementById("button-send-web").onclick = handleSendWeb;
document.getElementById("button-send-qr").onclick = handleSendQR;
