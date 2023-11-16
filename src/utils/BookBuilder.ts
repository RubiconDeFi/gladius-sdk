import EventEmitter from 'events';

import { JsonRpcProvider } from '@ethersproject/providers';
import axios from 'axios';
import { Contract } from 'ethers';
import { formatUnits, Interface } from 'ethers/lib/utils';

import ERC20DATA from '../../abis/MockERC20.json';
import { parseOrderWithChainId } from '../order';


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

/**
 * BookBuilder class builds and displays order book information for a given ERC20 pair on Gladius.
 * This class listens to updates from Gladius and maintains an order book.
 * 
 * @extends EventEmitter
 */
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

    /**
    * Constructs the BookBuilder instance with the given configuration.
    * 
    * @param {Config} config - Configuration object for the BookBuilder.
    * @param {number} config.chainID - The blockchain network chain ID.
    * @param {string} config.assetAddress - The address of the asset (ERC20 token).
    * @param {string} config.quoteAddress - The address of the quote (ERC20 token).
    * @param {string} config.gladiusUrl - The URL to the Gladius service.
    * @param {string} config.rpcUrl - The URL to the RPC provider.
    * @param {number} [config.gladiusPollTime=500] - OPTIONAL: The polling interval in milliseconds for Gladius book updates.
    * @param {number} [config.expirationPadding=10] - OPTIONAL: Padding time for order expiration in milliseconds.
    */
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

    /**
    * Initializes token decimals for asset and quote ERC20 tokens.
    * This method sets up the contract instances and fetches the decimal values.
    * @private
    * @returns {Promise<void>}
    */
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

    /**
    * Fetches offers from the Gladius service for both bids and asks.
    * @public
    * @returns {Promise<{bids: any; asks: any}>} An object containing bid and ask data in raw form, unparsed. See parseOrderWithChainID or parseOrder for parsing.
    */
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

    /**
    * Returns the current state of the book with asks and bids. Contains price, size, and parsed order data associated with each offer.
    * @public
    * @returns {SimpleBook} The current state of the book.
    */
    public getBook(): SimpleBook {
        return this.book;
    }

    /**
     * Queries the market to determine how much asset can be purchased with a given amount of quote currency.
     * @public
     * @param {number} quoteAmount - The amount of quote currency to spend.
     * @returns {{ assetPurchased: number; orders: string[] }} An object containing the amount of asset that can be purchased and an array of encoded orders that can be used for execution.
     */
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

    /**
    * Queries the market to determine how much quote currency can be obtained by selling a given amount of asset.
    * @public
    * @param {number} assetAmount - The amount of asset to sell.
    * @returns {{ quoteReceived: number; orders: string[] }} An object containing the amount of quote currency that can be obtained and an array of encoded orders that can be used for execution.
    */
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
