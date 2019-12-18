import Blockchain from '../../utils/blockchain'
import uuid from 'uuid/v1'
import rp from 'request-promise'
const nodeAddress = uuid().split('-').join('')

const cb = new Blockchain();

class BlockchainController {

	// get entire blockchain
	async index(req, res) {
		res.send(cb);
	}
// create a new transaction
	async storeTransaction(req, res) {
		const newTransaction = req.body;
		const blockIndex = cb.addTransactionToPendingTransactions(newTransaction);
		res.json({ note: `Transaction will be added in block ${blockIndex}.` });
	}

// broadcast transaction
	async broadcastTransaction(req, res) {
		const newTransaction = cb.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
	cb.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	cb.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
	}
// mine a block
	async mineBlock(req, res) {
		const lastBlock = cb.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: cb.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = cb.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = cb.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = cb.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	cb.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: cb.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});
	}

// receive new block
async receiveNewBlock(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = cb.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		cb.chain.push(newBlock);
		cb.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
}

// register a node and broadcast it the network
async registerAndBroadcastNode(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));
	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	});

}



// register a node with the network
async registerNewNode(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });

}

// register multiple nodes at once
async registerNodeBulk(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = cb.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = cb.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) cb.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
}

// consensus
async consensus(req, res) {
	app.get('/consensus', function(req, res) {
		const requestPromises = [];
		cb.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/blockchain',
				method: 'GET',
				json: true
			};
	
			requestPromises.push(rp(requestOptions));
		});
	
		Promise.all(requestPromises)
		.then(blockchains => {
			const currentChainLength = cb.chain.length;
			let maxChainLength = currentChainLength;
			let newLongestChain = null;
			let newPendingTransactions = null;
	
			blockchains.forEach(blockchain => {
				if (blockchain.chain.length > maxChainLength) {
					maxChainLength = blockchain.chain.length;
					newLongestChain = blockchain.chain;
					newPendingTransactions = blockchain.pendingTransactions;
				};
			});
	
	
			if (!newLongestChain || (newLongestChain && !cb.chainIsValid(newLongestChain))) {
				res.json({
					note: 'Current chain has not been replaced.',
					chain: cb.chain
				});
			}
			else {
				cb.chain = newLongestChain;
				cb.pendingTransactions = newPendingTransactions;
				res.json({
					note: 'This chain has been replaced.',
					chain: cb.chain
				});
			}
		});
	});
}

// get block by blockHash
async getBlockByBlockchain(req, res) {
	const blockHash = req.params.blockHash;
	const correctBlock = cb.getBlock(blockHash);
	res.json({
		block: correctBlock
	});
}

// get transaction by transactionId
async getTransactionByTransactionId(req, res) {
	const transactionId = req.params.transactionId;
	const trasactionData = cb.getTransaction(transactionId);
	res.json({
		transaction: trasactionData.transaction,
		block: trasactionData.block
	});
}

// get address by address
async getAddress(req, res) {
	const address = req.params.address;
	const addressData = cb.getAddressData(address);
	res.json({
		addressData: addressData
	});
}
}

export default new BlockchainController()