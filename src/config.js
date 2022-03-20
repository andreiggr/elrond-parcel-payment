import { ProxyProvider } from "@elrondnetwork/erdjs/out";

//https://devnet-gateway.elrond.com for dev net
//https://gateway.elrond.com for main net
const proxy = new ProxyProvider("https://devnet-gateway.elrond.com", 60000);

const bridge = "https://bridge.walletconnect.org";

const webAddress =
  "erd10ya7tkgjusj6cdhss90awc4lhvv63h6clazsv7w5ska677m2kmsqzgqqzd";
const maiarAppAddress =
  "erd14ntyrv83dw72u9jmkl45nww4a0qeyjxlf0dsy4cvkwjetljkrneqzj27d7";

export { proxy, bridge };
