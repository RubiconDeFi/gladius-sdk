// An object that builds and displays order book information for a given ERC20 pair on Gladius
import EventEmitter from 'events';
// import { /* other necessary imports */ } from '...';
import axios from 'axios';

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

    constructor(config: { chainID: number; assetAddress: string; quoteAddress: string; gladiusUrl: string; rpcUrl: string; gladiusPollTime?: number }) {
        super();
        this.chainID = config.chainID;
        this.assetAddress = config.assetAddress;
        this.quoteAddress = config.quoteAddress;
        this.gladiusUrl = config.gladiusUrl;
        this.rpcUrl = config.rpcUrl;
        this.gladiusPollTime = config.gladiusPollTime || 500;
        this.book = { asks: [], bids: [] };

        this.listenToGladiusBook();

        console.log("rpcUrl", this.rpcUrl);
        console.log("book", this.book);
        
        
    }

    private listenToGladiusBook(): void {
        setInterval(async () => {
            try {
                const data = await this.getOffers();
                if (data) {
                    // this.parseRawDataToUpdateFormattedBook(data.orders);
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
    

    // private parseRawDataToUpdateFormattedBook(rawData: any[]) {

    //     // console.log("rawData", rawData);
    //     // const tsShit = rawData;
        
    //     // Implement the parsing logic as per your requirements
    //     // Update this.book with the parsed data
    // }

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
