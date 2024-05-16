import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.ETH_RPC;

async function callMeVBlockerApi(req, res) {
    const accountAddress = req.body.accountAddress;
    const storageKeys = [req.body.storageKeys];
    try {
        const response = await axios.post(url, {
            jsonrpc: '2.0',
            method: 'eth_getProof',
            params: [
                accountAddress,
                storageKeys,
                'latest'
            ],
            id: 1
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        let trieProofs = Object.values(response.data).slice(2);
        const responseProof = calculateProof(trieProofs, storageKeys);
        console.log(responseProof);
        // if (responseProof) {
        //     res.status(200).json(responseProof);
        // }
        res.status(200).send("Check response on console");

    } catch (error) {
        res.status(409).send('Details are not correct');
        console.error('Error:', error);
    }
}

// Define chunkBytesInput function
const chunkBytesInput = (input) => {
    const result = [];
    for (let i = 0; i < input.length; i += 8) {
        result.push(input.slice(i, i + 8));
    }
    return result;
};

function hexToDecimal(hex) {
    const hexDigits = '0123456789ABCDEF';
    let decimal = BigInt(0); // Use BigInt to handle large integers
    // Iterate over each digit of the hexadecimal number
    for (let i = 0; i < hex.length; i++) {
        const digit = BigInt(hexDigits.indexOf(hex[i].toUpperCase()));
        decimal = decimal * BigInt(16) + digit;
    }
    return decimal;
}

// Define Encoding enum
const Encoding = {
    BIG: 'big',
};

// Define Data class
class Data {
    constructor(rawBytes) {
        this.rawBytes = rawBytes;
    }

    toInts(encoding = Encoding.BIG) {
        const chunked = chunkBytesInput(this.rawBytes);
        const intsArray = chunked.map(chunk =>
            hexToDecimal(chunk.toString('hex'))
        );
        return {
            values: intsArray,
            length: this.rawBytes.length,
        };
    }

    toHex() {
        return '0x' + this.rawBytes.toString('hex');
    }

    static fromHex(input) {
        return new Data(
            Buffer.from(input.slice(2), 'hex')
        );
    }
}


function calculateProof(trieProofs, storageKeys) {

    let proof = trieProofs[0].accountProof.map(element => Data.fromHex(element).toInts());
    // Flatten proof
    let flatProof = [];
    let flatProofSizesBytes = [];
    let flatProofSizesWords = [];


    for (let proofElement of proof) {
        flatProof.push(...proofElement.values);
        flatProofSizesBytes.push(proofElement.length);
        flatProofSizesWords.push(proofElement.values.length);
    }


    // Define l1AccountAddress
    const l1AccountAddress = BigInt(trieProofs[0].address);


    // Define stateRoot
    const stateRoot = BigInt(storageKeys);

    const jsonResponse = {
        "flat_proof": flatProof,
        "flat_proof_sizes_bytes": flatProofSizesBytes,
        "flat_proof_sizes_words": flatProofSizesWords,
        "len_proof": flatProof.length,
        "address": l1AccountAddress, // Convert to string to avoid JSON conversion issues
        "state_root": stateRoot // Convert to string to avoid JSON conversion issues
    };

    return jsonResponse;
}
export default callMeVBlockerApi;
