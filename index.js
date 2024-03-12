const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const bip39 = require('bip39');
const hdkey = require('hdkey');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

class TransactionKit {
  constructor() {
    this.web3 = web3;
  }

  async sendTransaction({ from, to, value, privateKey }) {
    const nonce = await this.web3.eth.getTransactionCount(from);
    const txDetails = {
      nonce: web3.utils.toHex(nonce),
      to: to,
      value: web3.utils.toHex(web3.utils.toWei(value.toString(), 'ether')),
      gasLimit: web3.utils.toHex(21000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
    };

    const tx = new Tx(txDetails, { 'chain': 'mainnet' });
    tx.sign(Buffer.from(privateKey, 'hex'));

    const serializedTransaction = tx.serialize();
    const raw = '0x' + serializedTransaction.toString('hex');

    const receipt = await this.web3.eth.sendSignedTransaction(raw);
    return receipt;
  }

  generateAccount(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) throw new Error("Invalid Mnemonic");
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const addrNode = root.derive("m/44'/60'/0'/0/0");
    const addr = `0x${addrNode.publicKey.toString('hex')}`;
    return addr;
  }
}

module.exports = TransactionKit;