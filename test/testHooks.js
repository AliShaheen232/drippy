import {Client} from "xrpl";

async function main() {
    const client = new Client('wss://s.altnet.rippletest.net:51233')
    console.log("Connecting to Testnet...")


    await client.connect().then(() => {
        console.log("connected");
        console.log("funding wallet");
  
        client.fundWallet().then((fund_result) => {
          console.log(fund_result);
        });
      });


}

main()

