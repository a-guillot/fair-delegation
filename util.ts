import EthCrypto from 'eth-crypto';
import { Contract } from 'web3-eth-contract';

class Util {
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    async inspectVariable(contract: Contract, variable: string): Promise<string> {
        return new Promise((resolve, reject) => resolve(
            contract.methods[variable]()
            .call()
        ));
    }
    async encrypt(key: string, data: string): Promise<string> {
        return new Promise((resolve, reject) => resolve(
            EthCrypto.encryptWithPublicKey(
                key, JSON.stringify(data)
            )
            .then(function(encrypted) {
                return EthCrypto.cipher.stringify(encrypted);
            })
        ));
    }

    async decrypt(key: string, data: string): Promise<string> {
        const encryptedObject = EthCrypto.cipher.parse(data);

        return new Promise((resolve, reject) => resolve(
            EthCrypto.decryptWithPrivateKey(
                key, encryptedObject
            )
            .then(function(decrypted) {
                return JSON.parse(decrypted);
            })
            .catch(function(error: Error) {
            })
        ));
    }

    hash(data: string): string {
        // type's here to match solidity's format
        return EthCrypto.hash.keccak256([
            {type: 'string', value: data}
        ]);
    }
}

export { Util };
