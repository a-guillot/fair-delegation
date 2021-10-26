import Fs from 'fs';
import { Contract } from 'web3-eth-contract';
import { Util } from './util';
import WebSocketAwait = require('ws-await');

import Web3 from 'web3';


// ----------------------------------------------------------------------------
//
class ServiceProvider {
    publicKey: string;
    privateKey: string;
    address: string;
    wage: number;
    contract: Contract;
    ipOther: string;
    ipBlockchain: string;
    ipVerifier: string;
    port: number;
    portOther: number;
    loop: boolean = true;
    util: Util;

    input: string;
    work: string;
    workEncrypted: any;
    stamp: [string, string, string];
    web3: Web3;
    methodCost: number;
    pairCost: number;
    wsSp: WebSocketAwait.Server;

    constructor(wage: number, sk: string, pk: string, addr:string, port: number, portOther: number, portBlockchain: number, portVerifier: number, ipOther: string, ipBlockchain: string, ipVerifier: string) {
        this.privateKey = sk.toLowerCase();
        this.publicKey = pk.toLowerCase();
        this.address = addr;

        this.wage = wage;
        this.port = port;
        this.portOther = portOther;
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(`ws://${ipBlockchain}:${portBlockchain}`));
        this.util = new Util();

        this.wsSp = new WebSocketAwait.Server({ port: port });
        console.log(`Creating server on port: ${port}`);

        this.wsSp.on('connection', (ws: any) => {
            console.log(`SP: someone connected to me`);
            ws.on('messageAwait', async (msg: any, id: any) => {
                this.input = msg.input;
                await ws.resAwait({
                    res: true,
                }, id);

                const contractAddress: string = msg.addrC;

                const name = 'FairDelegation3';
                const compiled_name = name + '_sol_' + name;
                const abi = JSON.parse(
                    Fs.readFileSync(compiled_name + '.abi').toString()
                );
                this.contract = new this.web3.eth.Contract(abi, contractAddress);
                await this.subscribe();

                this.work = 'Worked with:' + this.input;
                this.workEncrypted = await this.util.encrypt(
                    this.publicKey, this.work
                );

                const wsV = new WebSocketAwait(`ws://${ipVerifier}:${portVerifier}`);
                console.log(`SP: opening connection with verifier`);

                wsV.on('open', async () => {
                    const waiting = await wsV.sendAwait({
                        work: `Worked with: ${this.input}`
                    });

                    const stamp: [string, string, string] = [
                        waiting.hash, waiting.enc, waiting.sig
                    ];

                    this.stamp = stamp;
                    console.log(`SP: about to send data to other`);
                    const ws2 = new WebSocketAwait(`ws://${ipOther}:${this.portOther}`);
                    ws2.on('open', async () => {
                        await ws2.sendAwait({
                            work: this.workEncrypted,
                            stamp: this.stamp,
                            addr: this.address
                        });
                    });
                });
                // else {
                //     const contractAddress: string = msg.addr;

                //     const name = 'FairDelegation2';
                //     const compiled_name = name + '_sol_' + name;
                //     const abi = JSON.parse(
                //         Fs.readFileSync(compiled_name + '.abi').toString()
                //     );

                //     this.contract = new this.web3.eth.Contract(abi, contractAddress);
                //     await this.verifyData();
                // }

                // while (this.loop) {
                //     await this.util.delay(1000);
                // }
            });
        });
    }

    async subscribe(): Promise<void> {
        await this.contract.events.CustomerTrigger({
            }, async (error: any, event: any) => {
                // const key = event['returnValues']['k'].substr(2) +
                //     event['returnValues']['k2'].substr(2);
                // const wage = event['returnValues']['w'];

                await this.verifyData();
            }
        );
    }

    async sendAndClaimReward(): Promise<void> {
        this.methodCost = await this.contract.methods.serviceProvider(
            '0x' + this.privateKey
        ).estimateGas();
        console.log(`S3 - spCost: ${this.methodCost}`)

        this.pairCost = await this.contract.methods.pair(
            '0x' + this.privateKey,
            '0x' + this.privateKey,
            '0x' + this.privateKey,
        ).estimateGas();
        console.log(`S3 - pairCost: ${this.pairCost}`)

        await this.contract.methods.serviceProvider(
            '0x' + this.privateKey,
        ).send({
            from: this.address, gas: 1000000, gasPrice: '0'
        }).on('error', function(error: any) {
        });
        this.loop = false;
    }

    async verifyData(): Promise<void> {
        // const key1 = await this.util.inspectVariable(this.contract, 'pkSp');
        // const key2 = await this.util.inspectVariable(this.contract, 'pkSp2');

        // const wage = await this.util.inspectVariable(this.contract, 'wage');
        // const key = key1.substr(2) + key2.substr(2);

        await this.sendAndClaimReward();
        console.log(`I got my reward`);
    }

}




    // constructor(wage: number, sk: string, pk: string, addr:string, port: number, portOther: number, portBlockchain: number, portVerifier: number, ipOther: string, ipBlockchain: string, ipVerifier: string) {
new ServiceProvider(
    +process.argv[2], process.argv[3], process.argv[4],
    process.argv[5], +process.argv[6], +process.argv[7],
    +process.argv[8], +process.argv[9], process.argv[10],
    process.argv[11], process.argv[12],
);
