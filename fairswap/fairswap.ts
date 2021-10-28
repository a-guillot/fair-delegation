import Fs from 'fs';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://172.16.238.45:8545'));


class FairSwap{
    contract!: Contract;

    generateContract() {
        const compiled_name = 'fairswap_sol_fileSale';
        const abi = JSON.parse(
            Fs.readFileSync(compiled_name + '.abi').toString()
        );

        this.contract = new web3.eth.Contract(
            abi, '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', {
                from: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
                data: Fs.readFileSync(compiled_name + '.bin').toString()
            }
        );
    }

    async pushContract() {
        // while (true) {
        //     await new Promise( resolve => setTimeout(resolve, 1000) );
        // }
        const contractCost = await this.contract.deploy({
            data: '',
            arguments: []
        }).estimateGas();

        const cost_sp = await this.contract.methods.revealKey(
            '0x'
        ).estimateGas();

        var cost_c = await this.contract.methods.accept(
        ).estimateGas();
        cost_c += await this.contract.methods.noComplain(
        ).estimateGas();

        console.log(`Estimated cost for the deployment:\n${contractCost}`);
        console.log(`Estimated cost for the customer:\n${cost_c}`);
        console.log(`Estimated cost for the service provider:\n${cost_sp}`);
    }

    async main() {
        try {
            this.generateContract();
            await this.pushContract();
        } catch(error) {
            console.error(error);
        }
    }
}

var fairSwap: FairSwap = new FairSwap();
fairSwap.main();
