import Blockchain from '../../utils/blockchain'
import mongoose from 'mongoose'
import uuid from 'uuid/v1'
import rp from 'request-promise'
import FramCASSModel from './FramCASSModel'
import ScheduleModel from '../schedule/ScheduleModel'
import ReservationModel from '../reservation/ReservationModel'
const nodeAddress = uuid().split('-').join('')

const framCASS = new Blockchain();

class FramCASSController {

	// get entire blockchain
	async indexBlockchain(req, res) {
		res.send(framCASS);
	}
	// create a new transaction
	async storeTransaction(req, res) {
		const newTransaction = req.body;
		const blockIndex = framCASS.addTransactionToPendingTransactions(newTransaction);
		res.json({ note: `Transaction will be added in block ${blockIndex}.` });
	}

	// broadcast transaction
	async broadcastTransaction(req, res) {
		const newTransaction = framCASS.createNewTransaction(
			req.body.title, req.body.price, req.body.date, req.body.userId, req.body.establishmentId,
			req.body.miner);
		framCASS.addTransactionToPendingTransactions(newTransaction);

		const requestPromises = [];
		framCASS.networkNodes.forEach(networkNodeUrl => {
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
		let miner = ''
		framCASS.pendingTransactions.forEach(e => {
			miner = e.miner
		})
		const lastBlock = framCASS.getLastBlock();
		//se não houver documentos adiciona o lastBlock.
		let documents = await FramCASSModel.find()
		if (documents.length == 0) {
			await FramCASSModel.create({ block: lastBlock })
		}
		const previousBlockHash = lastBlock['hash'];
		const currentBlockData = {
			transactions: framCASS.pendingTransactions,
			index: lastBlock['index'] + 1
		};
		const nonce = framCASS.proofOfWork(previousBlockHash, currentBlockData);
		const blockHash = framCASS.hashBlock(previousBlockHash, currentBlockData, nonce);
		const newBlock = framCASS.createNewBlock(nonce, previousBlockHash, blockHash);
		const requestPromises = [];
		framCASS.networkNodes.forEach(networkNodeUrl => {
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
					uri: framCASS.currentNodeUrl + '/transaction/broadcast',
					method: 'POST',
					body: {
						price: 2,
						miner: miner
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
		let reservation = {}
		let newBlockTransactions = newBlock.transactions.filter(e => {
			return e.userId != undefined
		})
		let blockchain = await FramCASSModel.find()
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


		const session = await mongoose.startSession()
		try {
			session.startTransaction()
			reservation = await ReservationModel.findById(req.params._id)
			await FramCASSModel.create({ block: newBlock }).then(() => {
				newBlockTransactions.forEach(e => {
					reservation.datesReserved.push(e.date)
					ScheduleModel.create(e).then(() => { })
					ReservationModel.findOneAndUpdate(req.params._id, reservation,
						{ new: true, useFindAndModify: false }).then(() => { })
				})
			}).session(session)
			await session.commitTransaction()
		} catch (err) {
			await session.abortTransaction()
		} finally {
			session.endSession()
		}
	}

	// receive new block
	async receiveNewBlock(req, res) {
		const newBlock = req.body.newBlock;
		const lastBlock = framCASS.getLastBlock();
		const correctHash = lastBlock.hash === newBlock.previousBlockHash;
		const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

		if (correctHash && correctIndex) {
			framCASS.chain.push(newBlock);
			framCASS.pendingTransactions = [];
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
		if (framCASS.networkNodes.indexOf(newNodeUrl) == -1) framCASS.networkNodes.push(newNodeUrl);

		const regNodesPromises = [];
		framCASS.networkNodes.forEach(networkNodeUrl => {
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
					body: { allNetworkNodes: [...framCASS.networkNodes, framCASS.currentNodeUrl] },
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
		const nodeNotAlreadyPresent = framCASS.networkNodes.indexOf(newNodeUrl) == -1;
		const notCurrentNode = framCASS.currentNodeUrl !== newNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) framCASS.networkNodes.push(newNodeUrl);
		res.json({ note: 'New node registered successfully.' });
	}

	// register multiple nodes at once
	async registerNodeBulk(req, res) {
		const allNetworkNodes = req.body.allNetworkNodes;
		allNetworkNodes.forEach(networkNodeUrl => {
			const nodeNotAlreadyPresent = framCASS.networkNodes.indexOf(networkNodeUrl) == -1;
			const notCurrentNode = framCASS.currentNodeUrl !== networkNodeUrl;
			if (nodeNotAlreadyPresent && notCurrentNode) framCASS.networkNodes.push(networkNodeUrl);
		});
		res.json({ note: 'Bulk registration successful.' });
	}

	// consensus
	async consensus(req, res) {
		app.get('/consensus', function (req, res) {
			const requestPromises = [];
			framCASS.networkNodes.forEach(networkNodeUrl => {
				const requestOptions = {
					uri: networkNodeUrl + '/blockchain',
					method: 'GET',
					json: true
				};
				requestPromises.push(rp(requestOptions));
			});
			Promise.all(requestPromises)
				.then(blockchains => {
					const currentChainLength = framCASS.chain.length;
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

					if (!newLongestChain || (newLongestChain && !framCASS.chainIsValid(newLongestChain))) {
						res.json({
							note: 'Current chain has not been replaced.',
							chain: framCASS.chain
						});
					}
					else {
						framCASS.chain = newLongestChain;
						framCASS.pendingTransactions = newPendingTransactions;
						res.json({
							note: 'This chain has been replaced.',
							chain: framCASS.chain
						});
					}
				});
		});
	}

	// get block by blockHash
	async getBlockByBlockchain(req, res) {
		const blockHash = req.params.blockHash;
		const correctBlock = framCASS.getBlock(blockHash);
		res.json({
			block: correctBlock
		});
	}

	// get transaction by transactionId
	async getTransactionByTransactionId(req, res) {
		const transactionId = req.params.transactionId;
		const trasactionData = framCASS.getTransaction(transactionId);
		res.json({
			transaction: trasactionData.transaction,
			block: trasactionData.block
		});
	}

	// get address by address
	async getAddress(req, res) {
		const address = req.params.address;
		const addressData = framCASS.getAddressData(address);
		res.json({
			addressData: addressData
		});
	}
}

export default new FramCASSController()