import { ProxyProvider } from "@elrondnetwork/erdjs/out";

//https://devnet-gateway.elrond.com for dev net
//https://gateway.elrond.com for main net
const proxy = new ProxyProvider("https://devnet-gateway.elrond.com", 60000);

const bridge = "https://bridge.walletconnect.org";

export { proxy, bridge };
