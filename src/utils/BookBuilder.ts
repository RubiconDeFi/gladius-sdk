// An object that builds and displays order book information for a given ERC20 pair on Gladius
import EventEmitter from 'events';

// import { /* other necessary imports */ } from '...';
import { JsonRpcProvider } from '@ethersproject/providers';
import axios from 'axios';
import { Interface } from 'ethers/lib/utils';

import ERC20DATA from '../../abis/MockERC20.json';
import { Contract } from 'ethers';
import { parseOrderWithChainId } from '../order';

// interface GenericOrderWithOrderPayload extends GenericOrderWithData {
//     payload: any; // Adjust according to your payload structure
// }

interface GenericOrderWithData {
    size: number;
    price: number;
    data: any; // Customize as per your data structure
}

interface SimpleBook {
    asks: GenericOrderWithData[];
    bids: GenericOrderWithData[];
}

class BookBuilder extends EventEmitter {
    private chainID: number;
    private assetAddress: string;
    private quoteAddress: string;
    private gladiusUrl: string;
    private rpcUrl: string;
    private book: SimpleBook;
    private gladiusPollTime: number;
    private assetDecimals: number | undefined;
    private quoteDecimals: number | undefined;
    private rpcProvider: JsonRpcProvider;

    constructor(config: { chainID: number; assetAddress: string; quoteAddress: string; gladiusUrl: string; rpcUrl: string; gladiusPollTime?: number }) {
        super();
        this.chainID = config.chainID;
        this.assetAddress = config.assetAddress;
        this.quoteAddress = config.quoteAddress;
        this.gladiusUrl = config.gladiusUrl;
        this.rpcUrl = config.rpcUrl;
        this.gladiusPollTime = config.gladiusPollTime || 500;
        this.book = { asks: [], bids: [] };

        this.rpcProvider = new JsonRpcProvider(this.rpcUrl, this.chainID);
        this.initializeTokenDecimals().then(() => {
            // console.log("this is the asset decimals", this.assetDecimals);
            // console.log("this is the quote decimals", this.quoteDecimals);

            this.listenToGladiusBook();
        });

        console.log("rpcUrl", this.rpcUrl);
        console.log("book", this.book);
    }

    private async initializeTokenDecimals(): Promise<void> {
        try {
            const assetContract = new Contract(this.assetAddress, new Interface(ERC20DATA.abi), this.rpcProvider);
            const quoteContract = new Contract(this.quoteAddress, new Interface(ERC20DATA.abi), this.rpcProvider);

            const [assetDecimals, quoteDecimals] = await Promise.all([
                assetContract.decimals(),
                quoteContract.decimals(),
            ]);

            this.assetDecimals = assetDecimals;
            this.quoteDecimals = quoteDecimals;

            console.log(`Asset Decimals: ${this.assetDecimals}, Quote Decimals: ${this.quoteDecimals}`);
        } catch (error) {
            console.log("tried this contract address", this.assetAddress);
            console.log("tried this contract address", this.quoteAddress);
            console.error('Error fetching token decimals FAIL:', error);
        }
    }

    private listenToGladiusBook(): void {
        setInterval(async () => {
            try {
                const data = await this.getOffers();
                if (data) {
                    this.parseRawDataToUpdateFormattedBook(data.asks, data.bids);
                }
            } catch (error: any) {
                console.error('Error polling Gladius book:', error.message);
            }
        }, this.gladiusPollTime);
    }

    public async getOffers(): Promise<{ bids: any; asks: any }> {
        try {
            const bidResponse = axios.get(`${this.gladiusUrl}dutch-auction/orders?buyToken=${this.assetAddress}&sellToken=${this.quoteAddress}&orderStatus=open&chainId=${this.chainID}`);
            const askResponse = axios.get(`${this.gladiusUrl}dutch-auction/orders?buyToken=${this.quoteAddress}&sellToken=${this.assetAddress}&orderStatus=open&chainId=${this.chainID}`);

            const [bids, asks] = await Promise.all([bidResponse, askResponse]);
            return {
                bids: bids.data,
                asks: asks.data,
            };
        } catch (error: any) {
            console.error('Error fetching offers:', error.message);
            throw error;
        }
    }


    private parseRawDataToUpdateFormattedBook(_asks: any, _bids: any) {
        const asks = _asks.orders;
        const bids = _bids.orders;
        console.log("this is asks", asks);
        console.log("this is bids", bids);

        // Loop through the asks and bids and parse the data
        // TODO: at some point we will add deadline filtering here
        for (let index = 0; index < Math.max(asks.length, bids.length); index++) {
            const ask = asks[index];
            const bid = bids[index];

            if (ask) {
                console.log("got an ask we need to parse", ask);
                // const quoteOutputStartAmount = ask.outputs[0].startAmount;
                // const quoteOutputEndAmount = ask.outputs[0].endAmount;
                // const assetInputStartAmount = ask.input.startAmount;
                // const assetInputEndAmount = ask.input.endAmount;

                if (ask.outputs[0].token != this.quoteAddress || ask.input.token != this.assetAddress) {
                    console.log("ask outputs token does not match quote address");
                    continue;
                }
                try {
                    const parsedOrderData = parseOrderWithChainId(ask.encodedOrder, this.chainID)
                    console.log("this is the parsed order ASK data", parsedOrderData);
                    
                } catch (error) {
                    console.log("error parsing order", error);
                    
                }

            }

            if (bid) {
                console.log("got a bid we need to parse", bid);
            }

        }

        // Implement the parsing logic as per your requirements
        // Update this.book with the parsed data
    }

    // // Method to subscribe and listen for updates
    // public subscribeToUpdate() {
    //     // Implement logic to subscribe and emit updates
    //     // this.emit('update', this.book);
    // }

    // // Method for market buy
    // public marketBuy(quantity: number, isAsset: boolean): void {
    //     // Implement market buy logic
    // }

    // // Method for market sell
    // public marketSell(quantity: number, isAsset: boolean): void {
    //     // Implement market sell logic
    // }
}

export default BookBuilder;
