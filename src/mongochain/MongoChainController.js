import Blockchain from '../utils/blockchain'
import mongoose from 'mongoose'
import rp from 'request-promise'
import uuid from 'uuid/v1'
const nodeAddress = uuid().split('-').join('');
import MongoChainBlockModel from './MongoChainBlockModel'
import MongoChainTransferenceModel from './MongoChainTransferenceModel'

const MongoChain = new Blockchain();

class MongoChainController {

	//create a new blockchain call blocks in MongoDB for user admin framework
	async storeBlockchainMongo(req, res) {
		//se não houver documentos adiciona o lastBlock.
		const lastBlock = MongoChain.getLastBlock();
		let documents = await MongoChainBlockModel.find()
		if (documents.length == 0) {
			await MongoChainBlockModel.create({ block: lastBlock })
		}
		res.json({ note: `Collection Chain created and add genesis block` })
	}

	//get entire blockchain in MongoDB to clients 
	async indexBlockchainMongo(req, res) {
		const chain = await MongoChainBlockModel.find()
		return res.json(chain)
	}

	// get entire blockchain current in server
	async indexBlockchainServer(req, res) {
		res.send(MongoChain);
	}

	// register a node with the network
	async storeNode(req, res) {
		const newNodeUrl = req.body.newNodeUrl;
		const nodeNotAlreadyPresent = MongoChain.networkNodes.indexOf(newNodeUrl) == -1;
		const notCurrentNode = MongoChain.currentNodeUrl !== newNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) {
			MongoChain.networkNodes.push(newNodeUrl)
		}
		res.json({ note: 'New node registered successfully.' });
	}

	// register multiple nodes at once
	async storeNodeMultiple(req, res) {
		const allNetworkNodes = req.body.allNetworkNodes;
		allNetworkNodes.forEach(networkNodeUrl => {
			const nodeNotAlreadyPresent = MongoChain.networkNodes.indexOf(networkNodeUrl) == -1;
			const notCurrentNode = MongoChain.currentNodeUrl !== networkNodeUrl;
			if (nodeNotAlreadyPresent && notCurrentNode) MongoChain.networkNodes.push(networkNodeUrl);
		});
		res.json({ note: 'Bulk registration successful.' });
	}

	// register a node and broadcast it the network
	async storeBroadcastNode(req, res) {
		const newNodeUrl = req.body.newNodeUrl;
		if (MongoChain.networkNodes.indexOf(newNodeUrl) == -1) {
			MongoChain.networkNodes.push(newNodeUrl)
		}
		const regNodesPromises = [];
		MongoChain.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/node',
				method: 'POST',
				body: { newNodeUrl: newNodeUrl },
				json: true
			};
			regNodesPromises.push(rp(requestOptions));
		})
		Promise.all(regNodesPromises)
			.then(data => {
				const bulkRegisterOptions = {
					uri: newNodeUrl + '/node/multiple',
					method: 'POST',
					body: { allNetworkNodes: [...MongoChain.networkNodes, MongoChain.currentNodeUrl] },
					json: true
				};
				return rp(bulkRegisterOptions);
			})
			.then(data => {
				res.json({ note: 'New node registered with network successfully.' });
			});
	}

	// create a new transaction
	async storeTransaction(req, res) {
		const newTransaction = req.body;
		const blockIndex = MongoChain.addTransactionToPendingTransactions(newTransaction);
		res.json({ note: `Transaction will be added in block ${blockIndex}.` });
	}

	// broadcast transaction
	async storeBroadcastTransaction(req, res) {
		const newTransaction = MongoChain.createNewTransaction(
			req.body.senderId, req.body.recipientId, req.body.amount,
			1.5, nodeAddress);
		MongoChain.addTransactionToPendingTransactions(newTransaction);
		const requestPromises = [];
		MongoChain.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/transaction',
				method: 'POST',
				body: newTransaction,
				json: true
			};
			requestPromises.push(rp(requestOptions));
		})
		Promise.all(requestPromises)
			.then(data => {
				res.json({ note: 'Transaction created and broadcast successfully.' });
			});
	}

	// receive new block
	async storeBlock(req, res) {
		const newBlock = req.body.newBlock;
		const lastBlock = MongoChain.getLastBlock();
		const correctHash = lastBlock.hash === newBlock.previousBlockHash;
		const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

		if (correctHash && correctIndex) {
			MongoChain.chain.push(newBlock);
			MongoChain.pendingTransactions = [];
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

	// indexConsensu
	async indexConsensu(req, res) {
		const requestPromises = [];
		MongoChain.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/blockchain/server',
				method: 'GET',
				json: true
			};
			requestPromises.push(rp(requestOptions));
		});
		Promise.all(requestPromises)
			.then(blockchains => {
				const currentChainLength = MongoChain.chain.length;
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

				if (!newLongestChain || (newLongestChain && !MongoChain.chainIsValid(newLongestChain))) {
					res.json({
						note: 'Current chain has not been replaced.',
						chain: MongoChain.chain
					});
				}
				else {
					MongoChain.chain = newLongestChain;
					MongoChain.pendingTransactions = newPendingTransactions;
					res.json({
						note: 'This chain has been replaced.',
						chain: MongoChain.chain
					});
				}
			});
	}

	// mine a block
	async indexMine(req, res) {
		const lastBlock = MongoChain.getLastBlock();
		const previousBlockHash = lastBlock['hash'];
		const currentBlockData = {
			transactions: MongoChain.pendingTransactions,
			index: lastBlock['index'] + 1
		};
		const nonce = MongoChain.proofOfWork(previousBlockHash, currentBlockData);
		const blockHash = MongoChain.hashBlock(previousBlockHash, currentBlockData, nonce);
		const newBlock = MongoChain.createNewBlock(nonce, previousBlockHash, blockHash);
		const requestPromises = [];
		MongoChain.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/block',
				method: 'POST',
				body: { newBlock: newBlock },
				json: true
			};
			requestPromises.push(rp(requestOptions));
		});
		Promise.all(requestPromises)
			.then(data => {
				const requestOptions = {
					uri: MongoChain.currentNodeUrl + '/transaction/broadcast',
					method: 'POST',
					body: {
						rate: 5,
						sender: "00",
						mine: nodeAddress
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
			})

		let blocks = []
		let arrayBlockHash = []
		let newBlockTransactions = newBlock.transactions.filter(e => {
			return e.senderId != undefined
		})
		let blockchain = await MongoChainBlockModel.find()
		blockchain.forEach(e => {
			arrayBlockHash.push(e.block.hash)
			blocks.push(e.block.index)
		})
		function arrayMax(arr) {
			return arr.reduce(function (p, v) {
				return (p > v ? p : v);
			});
		}
		newBlock.index = arrayMax(blocks) + 1
		newBlock.previousBlockHash = arrayBlockHash.pop()


		const sessionBlockchain = await mongoose.startSession()
		sessionBlockchain.startTransaction({
			readConcern: { level: 'snapshot' },
			writeConcern: { w: 'majority' }
		})
		try {
			await MongoChainBlockModel.create([{ block: newBlock }],
				{ session: sessionBlockchain }).then(() => {
					newBlockTransactions.forEach(async transaction => {
						MongoChainTransferenceModel.createCollection().then(() => {
							MongoChainTransferenceModel.create(transaction).then(() => { })
						})
					})
				})
			await sessionBlockchain.commitTransaction()
		} catch (err) {
			await sessionBlockchain.abortTransaction()
		} finally {
			sessionBlockchain.endSession()
		}
	}
}
export default new MongoChainController()