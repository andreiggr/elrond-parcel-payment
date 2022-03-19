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

var qrcodeCanvas = document.getElementById("qrcode");

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
  //get address from input
  const destinationAddress = document.getElementById("send-address-input")
    .value;
  // console.log("dest", destinationAddress);

  //get amount in EGLD from input
  const amountToSend = document.getElementById("send-amount-input").value;

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
  //get address from input
  const destinationAddress = document.getElementById("send-address-input")
    .value;

  //get amount in EGLD from input
  const amountToSend = document.getElementById("send-amount-input").value;

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

  //https://devnet-gateway.elrond.com for dev net
  //https://gateway.elrond.com for main net

  const proxy = new ProxyProvider("https://devnet-gateway.elrond.com", 60000);

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

  if (!walletConnect.isInitialized()) {
    walletConnect.init();
  }
  walletConnect.login().then((walletConnectUri) => {
    if (walletConnectUri) {
      console.log("wcuri", walletConnectUri);
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
