// An object that builds and displays order book information for a given ERC20 pair on Gladius
import EventEmitter from 'events';

// import { /* other necessary imports */ } from '...';
import { JsonRpcProvider } from '@ethersproject/providers';
import axios from 'axios';
import { Interface, formatUnits } from 'ethers/lib/utils';

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
            // Note: for some reason order really matters here!
            const bidResponse = axios.get(`${this.gladiusUrl}dutch-auction/orders?buyToken=${this.assetAddress}&sellToken=${this.quoteAddress}&chainId=${this.chainID}&orderStatus=open`);
            const askResponse = axios.get(`${this.gladiusUrl}dutch-auction/orders?buyToken=${this.quoteAddress}&sellToken=${this.assetAddress}&chainId=${this.chainID}&orderStatus=open`);

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

        const newAsks: GenericOrderWithData[] = [];
        const newBids: GenericOrderWithData[] = [];
        for (let index = 0; index < Math.max(asks.length, bids.length); index++) {
            const ask = asks[index];
            const bid = bids[index];

            if (ask) {
                // console.log("got an ask we need to parse", ask);
                const quoteOutputStartAmount = ask.outputs[0].startAmount;
                const quoteOutputEndAmount = ask.outputs[0].endAmount;
                const assetInputStartAmount = ask.input.startAmount;
                const assetInputEndAmount = ask.input.endAmount;

                if (ask.outputs[0].token != this.quoteAddress || ask.input.token != this.assetAddress) {
                    console.log("ask outputs token does not match quote address");
                    continue;
                }
                try {
                    const parsedOrderData = parseOrderWithChainId(ask.encodedOrder, this.chainID)
                    console.log("this is the parsed order ASK data", parsedOrderData);

                    // e.g.
                    //     info: {
                    //       reactor: '0xcB23e6c82c900E68d6F761bd5a193a5151A1D6d2',
                    //       swapper: '0x00b20eEd81122763A393F11765D821eA0B8D4d5a',
                    //       nonce: BigNumber { _hex: '0xa8', _isBigNumber: true },
                    //       deadline: 1698670880,
                    //       additionalValidationContract: '0x0000000000000000000000000000000000000000',
                    //       additionalValidationData: '0x',
                    //       decayStartTime: 1698670870,
                    //       decayEndTime: 1698670879,
                    //       exclusiveFiller: '0x0000000000000000000000000000000000000000',
                    //       exclusivityOverrideBps: BigNumber { _hex: '0x00', _isBigNumber: true },
                    //       input: {
                    //         token: '0x4200000000000000000000000000000000000006',
                    //         startAmount: [BigNumber],
                    //         endAmount: [BigNumber]
                    //       },
                    //       outputs: [ [Object] ]
                    //     },
                    //     chainId: 10,
                    //     _permit2Address: undefined,
                    //     permit2Address: '0x000000000022d473030f116ddee9f6b43ac78ba3'
                    //   }

                    // deadline filtering
                    // TODO: also introduce deadline leadup time for added cushion!
                    if (parsedOrderData.info.deadline < Math.floor(Date.now() / 1000)) {

                        console.log("deadline", parsedOrderData.info.deadline);
                        console.log("now", Math.floor(Date.now() / 1000));
                        
                        console.log("this order is expired");
                        continue;
                    }

                    console.log("this order is not expired");
                    

                    // Perform any more filtering as needed
                    if (quoteOutputEndAmount == quoteOutputStartAmount && assetInputEndAmount == assetInputStartAmount) {
                        // Non decaying order we can parse
                        const quoteOutputAmount = quoteOutputEndAmount;
                        const assetInputAmount = assetInputStartAmount;
                        const price = parseFloat(formatUnits(quoteOutputAmount, this.quoteDecimals)) / parseFloat(formatUnits(assetInputAmount, this.assetDecimals));
                        const size = parseFloat(formatUnits(assetInputAmount, this.assetDecimals));
                        const data = {
                            parsedInfo: parsedOrderData.info,
                            rawOrder: ask,
                        };
                        newAsks.push({ size, price, data });
                    } else {
                        //  have a dutch order we need to parse!
                        console.log("TODO: this is a dutch order we need to parse");

                    }

                } catch (error) {
                    console.log("error parsing order", error);

                }

            }

            if (bid) {
                // console.log("got a bid we need to parse", bid);
                const quoteInputStartAmount = bid.input.startAmount;
                const quoteInputEndAmount = bid.input.endAmount;
                const assetOutputStartAmount = bid.outputs[0].startAmount;
                const assetOutputEndAmount = bid.outputs[0].endAmount;

                if (bid.input.token != this.quoteAddress || bid.outputs[0].token != this.assetAddress) {
                    console.log("bid inputs token does not match quote address");
                    continue;
                }

                try {
                    const parsedOrderData = parseOrderWithChainId(bid.encodedOrder, this.chainID)
                    // console.log("this is the parsed order BID data", parsedOrderData);

                    // deadline filtering
                    // TODO: also introduce deadline leadup time for added cushion!
                    if (parsedOrderData.info.deadline < Math.floor(Date.now() / 1000)) {
                        console.log("this order is expired");
                        continue;
                    }
                    console.log("this order is not expired");

                    // Perform any more filtering as needed

                    if (quoteInputEndAmount == quoteInputStartAmount && assetOutputEndAmount == assetOutputStartAmount) {
                        // Non decaying order we can parse
                        const quoteInputAmount = quoteInputEndAmount;
                        const assetOutputAmount = assetOutputStartAmount;
                        const price = parseFloat(formatUnits(quoteInputAmount, this.quoteDecimals)) / parseFloat(formatUnits(assetOutputAmount, this.assetDecimals));
                        const size = parseFloat(formatUnits(assetOutputAmount, this.assetDecimals));
                        const data = {
                            parsedInfo: parsedOrderData.info,
                            rawOrder: bid,
                        };
                        newBids.push({ size, price, data });
                    } else {
                        //  have a dutch order we need to parse!
                        console.log("TODO: this is a dutch order we need to parse");

                    }

                } catch (error) {
                    console.log("error parsing BID order", error);

                }

            }

        }

        // Implement the parsing logic as per your requirements
        // Update this.book with the parsed data
        this.book = {
            asks: newAsks,
            bids: newBids,
        };
    }

    public getBook(): SimpleBook {
        return this.book;
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
