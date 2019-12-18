import mongoose from 'mongoose'

function ACID() {
	
};

ACID.prototype.commitTransaction = async function () {
    console.log('teste')
    const session = await mongoose.startSession()
    session.startTransaction()
    await session.commitTransaction()
    session.endSession()
    return session
}

ACID.prototype.cancelTransaction() = async function () {
    const session = await session.abortTransaction()
    session.endSession()
    return session
}

export default ACID

