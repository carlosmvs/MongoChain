import Blockchain from '../utils/blockchain'
import mongoose from 'mongoose'
import rp from 'request-promise'
import uuid from 'uuid/v1'
const nodeAddress = uuid().split('-').join('');
import ACIDNoSQLChainBlockModel from './ACIDNoSQLChainBlockModel'
import ACIDNoSQLChainSenderModel from './ACIDNoSQLChainSender.Model'
import ACIDNoSQLChainRecipientModel from './ACIDNoSQLChainRecipientModel'
import ACIDNoSQLChainTransferenceModel from './ACIDNoSQLChainTransference.Model'

const ACIDNoSQLChain = new Blockchain();

class ACIDNoSQLChainController {

	//create a new blockchain call blocks in MongoDB for user admin framework
	async storeBlockchainMongo(req, res) {
		//se não houver documentos adiciona o lastBlock.
		const lastBlock = ACIDNoSQLChain.getLastBlock();
		let documents = await ACIDNoSQLChainBlockModel.find()
		if (documents.length == 0) {
			await ACIDNoSQLChainBlockModel.create({ block: lastBlock })
		}
		res.json({ note: `Collection Chain created and add genesis block` })
	}

	//get entire blockchain in MongoDB to clients 
	async indexBlockchainMongo(req, res) {
		const chain = await ACIDNoSQLChainBlockModel.find()
		return res.json(chain)
	}

	// get entire blockchain current in server
	async indexBlockchain(req, res) {
		res.send(ACIDNoSQLChain);
	}

	// register a node with the network
	async storeNode(req, res) {
		const newNodeUrl = req.body.newNodeUrl;
		const nodeNotAlreadyPresent = ACIDNoSQLChain.networkNodes.indexOf(newNodeUrl) == -1;
		const notCurrentNode = ACIDNoSQLChain.currentNodeUrl !== newNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) {
			ACIDNoSQLChain.networkNodes.push(newNodeUrl)
		}
		res.json({ note: 'New node registered successfully.' });
	}

	// register multiple nodes at once
	async storeNodeMultiple(req, res) {
		const allNetworkNodes = req.body.allNetworkNodes;
		allNetworkNodes.forEach(networkNodeUrl => {
			const nodeNotAlreadyPresent = ACIDNoSQLChain.networkNodes.indexOf(networkNodeUrl) == -1;
			const notCurrentNode = ACIDNoSQLChain.currentNodeUrl !== networkNodeUrl;
			if (nodeNotAlreadyPresent && notCurrentNode) ACIDNoSQLChain.networkNodes.push(networkNodeUrl);
		});
		res.json({ note: 'Bulk registration successful.' });
	}

	// register a node and broadcast it the network
	async storeBroadcastNode(req, res) {
		const newNodeUrl = req.body.newNodeUrl;
		if (ACIDNoSQLChain.networkNodes.indexOf(newNodeUrl) == -1) {
			ACIDNoSQLChain.networkNodes.push(newNodeUrl)
		}
		const regNodesPromises = [];
		ACIDNoSQLChain.networkNodes.forEach(networkNodeUrl => {
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
					body: { allNetworkNodes: [...ACIDNoSQLChain.networkNodes, ACIDNoSQLChain.currentNodeUrl] },
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
		const blockIndex = ACIDNoSQLChain.addTransactionToPendingTransactions(newTransaction);
		res.json({ note: `Transaction will be added in block ${blockIndex}.` });
	}

	// broadcast transaction
	async storeBroadcastTransaction(req, res) {
		const newTransaction = ACIDNoSQLChain.createNewTransaction(
			req.body.senderId, req.body.recipientId, req.body.amount,
			1.5, nodeAddress);
		ACIDNoSQLChain.addTransactionToPendingTransactions(newTransaction);
		const requestPromises = [];
		ACIDNoSQLChain.networkNodes.forEach(networkNodeUrl => {
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
		const lastBlock = ACIDNoSQLChain.getLastBlock();
		const correctHash = lastBlock.hash === newBlock.previousBlockHash;
		const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

		if (correctHash && correctIndex) {
			ACIDNoSQLChain.chain.push(newBlock);
			ACIDNoSQLChain.pendingTransactions = [];
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
		ACIDNoSQLChain.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/blockchain/server',
				method: 'GET',
				json: true
			};
			requestPromises.push(rp(requestOptions));
		});
		Promise.all(requestPromises)
			.then(blockchains => {
				const currentChainLength = ACIDNoSQLChain.chain.length;
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

				if (!newLongestChain || (newLongestChain && !ACIDNoSQLChain.chainIsValid(newLongestChain))) {
					res.json({
						note: 'Current chain has not been replaced.',
						chain: ACIDNoSQLChain.chain
					});
				}
				else {
					ACIDNoSQLChain.chain = newLongestChain;
					ACIDNoSQLChain.pendingTransactions = newPendingTransactions;
					res.json({
						note: 'This chain has been replaced.',
						chain: ACIDNoSQLChain.chain
					});
				}
			});
	}

	// mine a block
	async indexMine(req, res) {

		const lastBlock = ACIDNoSQLChain.getLastBlock();
		const previousBlockHash = lastBlock['hash'];
		const currentBlockData = {
			transactions: ACIDNoSQLChain.pendingTransactions,
			index: lastBlock['index'] + 1
		};
		const nonce = ACIDNoSQLChain.proofOfWork(previousBlockHash, currentBlockData);
		const blockHash = ACIDNoSQLChain.hashBlock(previousBlockHash, currentBlockData, nonce);
		const newBlock = ACIDNoSQLChain.createNewBlock(nonce, previousBlockHash, blockHash);
		const requestPromises = [];
		ACIDNoSQLChain.networkNodes.forEach(networkNodeUrl => {
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
					uri: ACIDNoSQLChain.currentNodeUrl + '/transaction/broadcast',
					method: 'POST',
					body: {
						rate: 1.5,
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
		let blockchain = await ACIDNoSQLChainBlockModel.find()
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

		//Add transactions Blockchain + ACID
		const session = await mongoose.startSession({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } })
		session.startTransaction()
		try {
			await ACIDNoSQLChainBlockModel.create([{ block: newBlock }]).then(() => {
				newBlockTransactions.forEach(e => {
					ACIDNoSQLChainTransferenceModel.create(e)
				})
			}, { session })
			await session.commitTransaction()
		} catch (err) {
			await session.abortTransaction()
		} finally {
			session.endSession()
		}
	}

	async storeSender(req, res) {
		try {
			const sender = ACIDNoSQLChainSenderModel.create(req.body, { session })
			res.json(sender)
		} catch (err) {
			throw err
		}
	}

	async storeRecipient(req, res) {
		const sessionTransference = await mongoose.startSession()
		sessionTransference.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } })
		try {
			let recipient = await ACIDNoSQLChainRecipientModel.create([req.body], { sessionTransference })
			await sessionTransference.commitTransaction()
			res.json(recipient)
		} catch (err) {
			await sessionTransference.abortTransaction()
		} finally {
			sessionTransference.endSession()
		}
	}

	async updateTransference(req, res) {
		const sessionTransference = await mongoose.startSession()
		sessionTransference.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } })
		try {
			let sender = await ACIDNoSQLChainSenderModel.findById(req.body.senderId).session(sessionTransference)
			let recipient = await ACIDNoSQLChainRecipientModel.findById(req.body.recipientId).session(sessionTransference)
			let transference = await ACIDNoSQLChainTransferenceModel.findById(req.params.id).session(sessionTransference)
			sender.amount -= req.body.amount
			recipient.amount += req.body.amount
			transference.amount += req.body.amount
			await ACIDNoSQLChainSenderModel.findByIdAndUpdate(req.body.senderId, sender).session(sessionTransference)
			await ACIDNoSQLChainRecipientModel.findByIdAndUpdate(req.body.recipientId, recipient).session(sessionTransference)
			await ACIDNoSQLChainTransferenceModel.findByIdAndUpdate(req.params.id, transference).session(sessionTransference)
			await sessionTransference.commitTransaction()
			res.json({ message: "OK" })
		} catch (err) {
			await sessionTransference.abortTransaction()
		} finally {
			sessionTransference.endSession()
		}
	}

	async storeTransference(req, res) {
		const sessionTransference = await mongoose.startSession()
		sessionTransference.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } })
		try {
			let transference = await ACIDNoSQLChainTransferenceModel.create([req.body]).session(sessionTransference)
			await sessionTransference.commitTransaction()
			res.json(transference)
		} catch (err) {
			await sessionTransference.abortTransaction()
		} finally {
			sessionTransference.endSession()
		}
	}

	async destroyTransference(req, res) {
		const sessionTransference = await mongoose.startSession()
		sessionTransference.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } })
		try {
			await ACIDNoSQLChainTransferenceModel.findByIdAndDelete(req.params.id).session(sessionTransference)
			await sessionTransference.commitTransaction()
			res.send()
		} catch (err) {
			await sessionTransference.abortTransaction()
		} finally {
			sessionTransference.endSession()
		}
	}

	async indexTransference(req, res) {
		try {
			const transference = await ACIDNoSQLChainTransferenceModel.find()
			res.json(transference)
		} catch (err) {
			throw err
		}
	}
}





export default new ACIDNoSQLChainController()