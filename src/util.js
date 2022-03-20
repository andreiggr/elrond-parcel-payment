import { Account, Address } from "@elrondnetwork/erdjs/out";
import { proxy } from "./config";

async function tryAddress(address) {
  let addrs;
  try {
    addrs = new Address(address);
  } catch (e) {
    console.log("imcatchingthiseerrr", e);
    // What to do it its bad?
    addrs = false;
  }
  return addrs;
}

async function checkValidAddress(address) {
  let isValidAddress = false;
  let addrsObj = await tryAddress(address);

  if (addrsObj !== false) {
    let account = new Account(addrsObj);
    await account.sync(proxy);

    isValidAddress = await account.toJSON();
    console.log("is contract address", await account.toJSON());
  } else {
    isValidAddress = false;
  }
  return isValidAddress;
}

async function checkAddressValidity(address) {
  //check to have 62 chars (default maiar-elrd address)
  let isValid = false;
  if (address.length === 62) {
    isValid = await checkValidAddress(address);
    //should change input color green and proceed to check if is recognized on network
  } else {
    isValid = false;
  }
  return isValid;
}

function checkAmountValidity(amount) {
  // check to be a positive number
  let isValid = false;
  if (amount > 0) {
    isValid = true;
  } else isValid = false;
  return isValid;
}

export { checkAddressValidity, checkAmountValidity };
