import EthCrypto from 'eth-crypto';
const WebSocketAwait = require('ws-await');

const wss = new WebSocketAwait.Server({ port: 8080 });

class Verifier {

    pkSp: string;
    pkC: string;
    skC: string;
    work: string;
    workEncrypted: string;


    constructor(pkSp: string, pkC: string, skC: string) {
        this.pkSp = pkSp;
        this.pkC = pkC;
        this.skC = skC;
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

    sign(k: string, data: string): string {
        return EthCrypto.sign(
            k, data
        );
    }

    async createStamp(work: string): Promise<{hash: string; enc: string; sig: string;}> {
        const workEncrypted = await this.encrypt(
            this.pkSp, work
        );

        const workHash = this.hash(workEncrypted);
        const enc: string = await this.encrypt(
            this.pkC,
            workHash
        );
        const sig: string = this.sign(
            this.skC, workHash
        );
        const stamp: [string, string, string] = [
            workHash, enc, sig
        ];
        // console.log(stamp);

        return {
            hash: workHash,
            enc: enc,
            sig: sig
        };
    }
}

const verifier: Verifier = new Verifier(process.argv[2], process.argv[3], process.argv[4]);

wss.on('connection', (ws: any) => {
    ws.on('messageAwait', async (msg: any, id: any) => {
        const d = await verifier.createStamp(msg.work);
        await ws.resAwait({
            res: true,
            hash: d.hash,
            enc: d.enc,
            sig: d.sig
        }, id);
    });
});
