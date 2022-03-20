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
import { bridge, proxy } from "./config";
import { checkAddressValidity, checkAmountValidity } from "./util";

var qrcodeCanvas = document.getElementById("qrcode");

//get address from input
var destinationAddress = document.getElementById("send-address-input").value;
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
  const validAmount = await checkAmountValidity(amount);

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

function generatePaymentQR(qrcodeCanvas, payUri) {
  QRCode.toCanvas(qrcodeCanvas, payUri, function(error) {
    if (error) console.error(error);
    console.log("qrcode generated!");
  });
}

async function handleSendWeb() {
  var destinationAddress = document.getElementById("send-address-input").value;
  var amountToSend = document.getElementById("send-amount-input").value;

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
  var destinationAddress = document.getElementById("send-address-input").value;
  var amountToSend = document.getElementById("send-amount-input").value;

  //load tx data
  let tx = new Transaction({
    data: new TransactionPayload("T3"),
    gasLimit: new GasLimit(70000),
    receiver: new Address(destinationAddress),
    value: Balance.egld(amountToSend),
    // T for testnet, D for devnet, 1 for mainnet
    chainID: new ChainID("D"),
  });

  let walletConnect = new WalletConnectProvider(proxy, bridge, {
    onClientLogin: async () => {
      walletConnect.getAddress().then((address) => {
        console.log("connected to:", address);
      });

      let account = new Account(new Address(await walletConnect.getAddress()));
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
  });

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
  var textEl = document.createTextNode(`Transaction ID: ${text}`);
  element.appendChild(textEl);
}

function handleConfirmPayment() {
  const type = document.getElementById("select-payment-type").value;

  var address = document.getElementById("send-address-input").value;
  var amount = document.getElementById("send-amount-input").value;

  const validAddress = checkAddressValidity(address);
  const validAmount = checkAmountValidity(amount);

  if (validAmount && validAddress) {
    if (type === "web") {
      handleSendWeb();
    }
    if (type === "maiar") {
      handleSendQR();
    }
  } else console.log("something is not right");
}

document.getElementById(
  "button-confirm-payment"
).onclick = handleConfirmPayment;
