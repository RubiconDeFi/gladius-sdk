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

interface Config {
    chainID: number;
    assetAddress: string;
    quoteAddress: string;
    gladiusUrl: string;
    rpcUrl: string;
    gladiusPollTime?: number;
    expirationPadding?: number; // milliseconds
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
    private expirationPadding: number;

    constructor(config: Config) {
        super();
        this.chainID = config.chainID;
        this.assetAddress = config.assetAddress;
        this.quoteAddress = config.quoteAddress;
        this.gladiusUrl = config.gladiusUrl;
        this.rpcUrl = config.rpcUrl;
        this.gladiusPollTime = config.gladiusPollTime || 500;
        this.expirationPadding = config.expirationPadding || 10;
        this.book = { asks: [], bids: [] };

        this.rpcProvider = new JsonRpcProvider(this.rpcUrl, this.chainID);
        this.initializeTokenDecimals().then(() => {
            this.listenToGladiusBook();
        });
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

            // console.log(`Asset Decimals: ${this.assetDecimals}, Quote Decimals: ${this.quoteDecimals}`);
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

        const newAsks: GenericOrderWithData[] = [];
        const newBids: GenericOrderWithData[] = [];
        // Process asks
        asks.forEach((ask: any) => {
            // Your existing logic for processing an ask
            // console.log("got an ask we need to parse", ask);
            const quoteOutputStartAmount = ask.outputs[0].startAmount;
            const quoteOutputEndAmount = ask.outputs[0].endAmount;
            const assetInputStartAmount = ask.input.startAmount;
            const assetInputEndAmount = ask.input.endAmount;

            if (ask.outputs[0].token != this.quoteAddress || ask.input.token != this.assetAddress) {
                console.log("ask outputs token does not match quote address");
                return;
            }
            try {
                const parsedOrderData = parseOrderWithChainId(ask.encodedOrder, this.chainID)

                // deadline filtering
                if (parsedOrderData.info.deadline < Math.floor(Date.now() / 1000) - (this.expirationPadding / 1000)) {
                    return;
                }

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

        });

        // Process bids
        bids.forEach((bid: any) => {
            // Your existing logic for processing a bid
            const quoteInputStartAmount = bid.input.startAmount;
            const quoteInputEndAmount = bid.input.endAmount;
            const assetOutputStartAmount = bid.outputs[0].startAmount;
            const assetOutputEndAmount = bid.outputs[0].endAmount;

            if (bid.input.token != this.quoteAddress || bid.outputs[0].token != this.assetAddress) {
                return;
            }

            try {
                const parsedOrderData = parseOrderWithChainId(bid.encodedOrder, this.chainID)

                // deadline filtering
                if (parsedOrderData.info.deadline < Math.floor(Date.now() / 1000) - (this.expirationPadding / 1000)) {
                    return;
                }

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
        });

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

    // Function to query output and data to send for a given input amount of quote
    public queryMarketBuy(quoteAmount: number): { assetPurchased: number, orders: string[] } {
        if (this.book.asks.length === 0) return { assetPurchased: 0, orders: [] };
    
        let remainingQuote = quoteAmount;
        let assetPurchased = 0;
        const encodedOrders: string[] = [];
    
        for (const ask of this.book.asks) {
            const totalOrderCost = ask.size * ask.price;
            if (remainingQuote >= totalOrderCost) {
                assetPurchased += ask.size;
                remainingQuote -= totalOrderCost;
                encodedOrders.push(ask.data.rawOrder.encodedOrder);
            } else {
                break;
            }
        }
    
        return { assetPurchased, orders: encodedOrders };
    }
    
    public queryMarketSell(assetAmount: number): { quoteReceived: number, orders: string[] } {
        if (this.book.bids.length === 0) return { quoteReceived: 0, orders: [] };
    
        let remainingAsset = assetAmount;
        let quoteReceived = 0;
        const encodedOrders: string[] = [];
    
        for (const bid of this.book.bids) {
            if (remainingAsset >= bid.size) {
                quoteReceived += bid.size * bid.price;
                remainingAsset -= bid.size;
                encodedOrders.push(bid.data.rawOrder.encodedOrder);
            } else {
                break;
            }
        }
    
        return { quoteReceived, orders: encodedOrders };
    }
    
    

}

export default BookBuilder;
