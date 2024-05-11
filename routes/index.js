const userRouter = require('./user')
const houseRouter = require('./house')
const roomRouter = require('./roomManagement')
const serviceRouter = require('./serviceManagement')
const contractRouter = require('./contract')
const holdingDepositRouter = require('./holdingDeposit')
const voiceRouter = require('./invoice')
const chatRouter = require('./chat')
const utilitiesRouter = require('./utilities')
const notificationRouter = require('./notification')
const appointmentRouter = require('./Appointment')
const issueRouter = require('./issue')
const {notFound, errHandler} = require('../middlewares/errHandler')

const initRoutes = (app) =>{
    app.use('/api/user', userRouter)
    app.use('/api/house', houseRouter)
    app.use('/api/room', roomRouter)
    app.use('/api/service', serviceRouter)
    app.use('/api/contract', contractRouter)
    app.use('/api/holdingdeposit', holdingDepositRouter)
    app.use('/api/invoice', voiceRouter)
    app.use('/api/chat', chatRouter)
    app.use('/api/utilities', utilitiesRouter)
    app.use('/api/notification', notificationRouter)
    app.use('/api/appointment', appointmentRouter)
    app.use('/api/issue', issueRouter)
    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes