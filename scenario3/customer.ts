import * as Fs from 'fs';
import { Contract } from 'web3-eth-contract';
import { Util } from './util';
import WebSocketAwait = require('ws-await');

import Web3 from 'web3';


// ----------------------------------------------------------------------------

class Customer {
    publicKey: string;
    privateKey: string;
    address: string;
    addressOther: string;
    wage: number;
    contract: Contract;
    ipOther: string;
    ipBlockchain: string;
    port: number;
    portOther: number;
    loop: boolean = true;
    util: Util;

    input: string;
    work: string;
    workEncrypted: any;
    stamp: [string, string, string];
    web3: Web3;

    deployCost: number;
    methodCost: number;
    pkSp: string;
    wsC: WebSocketAwait.Server;

    constructor(wage: number, sk: string, pk: string, addr:string, input: string, port: number, portOther: number, portBlockchain: number, pkSp: string, ipOther: string, ipBlockchain: string) {
        this.privateKey = sk.toLowerCase();
        this.publicKey = pk.toLowerCase();
        this.address = addr;

        this.wage = wage;
        this.ipOther = ipOther;
        this.ipBlockchain = ipBlockchain;
        this.port = port;
        this.portOther = portOther;
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(`ws://${this.ipBlockchain}:${[portBlockchain]}`));
        this.util = new Util();

        this.input = input;
        this.pkSp = pkSp;
        this.wsC = new WebSocketAwait.Server({ port: port });
        console.log(`Creating server on port: ${port}`);
    }

    async sendInfo(): Promise<void> {
        await this.deployContract();
        await this.subscribe();

        this.wsC.on('connection', (ws: any) => {
            console.log(`C: someone connected to me`);

            ws.on('messageAwait', async (msg: any, id: any) => {
                console.log(`C: I received a message`);
                this.workEncrypted = msg.work;
                this.stamp = msg.stamp;
                this.addressOther = msg.addr;

                await ws.resAwait({
                    res: true,
                }, id);

                await this.verifyWork();
            });
        });

        const wsSp = new WebSocketAwait(`ws://${this.ipOther}:${this.portOther}`);
        wsSp.on('open', async () => {
            await wsSp.sendAwait({
                input: this.input, addrC: this.contract.options.address
            });
        });
        while (this.loop) {
            await this.util.delay(1000);
        }
    }

    async deployContract(): Promise<void> {
        const name = 'FairDelegation3';
        const compiled_name = name + '_sol_' + name;
        const abi = JSON.parse(
            Fs.readFileSync(compiled_name + '.abi').toString()
        );

       const contract: any = new this.web3.eth.Contract(
            abi, this.address, {
                from: this.address,
                data: Fs.readFileSync(compiled_name + '.bin').toString()
            }
        );
        this.contract = contract;

        const contractCost = await contract.deploy({
            data: contract.options.data,
            arguments: []
        }).estimateGas();
        console.log(`S3 - deploymentCost: ${contractCost}`);

        await contract.deploy({
            data: contract.options.data,
            arguments: []
        }).send({
            from: contract.options.from,
            gas: 4712388, gasPrice: '0',
            value: this.web3.utils.toWei(this.wage.toString(), 'wei')
        }).then((sentContract: any) => {
            contract.options.address = sentContract.options.address;
        });
    }

    async verifyWork(): Promise<void> {

        // const [workHash, enc, sig]: [string, string, string] = [
        //     this.stamp[0], this.stamp[1], this.stamp[2]
        // ]

        // const decHash = await this.util.decrypt(
        //     this.privateKey, enc
        // );

        // No need to contact the SP in s2 or s3 since they subbed to the contract
        // const wsSp = new WebSocketAwait(`ws://${this.ipOther}:${this.portOther}`);
        // wsSp.on('open', async () => {
        //     await wsSp.sendAwait({
        //         input: undefined, addr: this.contract.options.address
        //     });
        // });

        this.sendKeyAndWage();
    }

    async subscribe() {
        await this.contract.events.ServiceProviderTrigger({},
            async (error: any, event: any): Promise<boolean> => {
            const key = event['returnValues']['k'];
            this.work = await this.util.decrypt(key, this.workEncrypted);
            console.log(`C: I decrypted my reward!`);
            this.loop = false;

            return true;
        });
    }

    async sendKeyAndWage(): Promise<void> {
        const k = this.pkSp;
        const first = k.substr(0, k.length/2);
        const last = k.substr(k.length/2);

        this.methodCost = await this.contract.methods.customer(
            this.addressOther, '0x' + first, '0x' + last
        ).estimateGas();
        console.log(`C.methodCost: ${this.methodCost}`);

        await this.contract.methods.customer(
            this.addressOther, '0x' + first, '0x' + last
        ).send({from: this.address, value: this.web3.utils.toWei(
            this.wage.toString(), 'wei'
        )}).on('error', console.error);
    }
}

export { Customer };

    // constructor(wage: number, sk: string, pk: string, addr:string, input: string, port: number, portOther: number, portBlockchain: number, pkSp: string, ipOther: string, ipBlockchain: string) {
const c: Customer = new Customer(
    +process.argv[2], process.argv[3], process.argv[4],
    process.argv[5], process.argv[6], +process.argv[7],
    +process.argv[8], +process.argv[9], process.argv[10],
    process.argv[11], process.argv[12]
);

c.sendInfo();
