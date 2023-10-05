const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Item = require('../models/item.model');
const Message = require('../models/message.model');
const auth = require('../middleware/auth');

router.use(auth);

// GET request to /api/profile
// Returns the user
router.route('/').get((req, res) => {
    User.findById(req.userId)
        .then(user => res.json(user))
        .catch(err => res.status(400).json({ error: err.message }))
})

// PATCH request to /api/profile
// Updates the user (password)
router.route('/').patch((req, res) => {
    User.findById(req.userId)
        .then(async user =>  {
            if (req.body.password) {
                try {
                    const hash = await bcrypt.hash(req.body.password, 10)
                    user.password = hash
                } catch (err) {
                    return res.status(400).json({ error: err.message })
                }
            }

            user.save()
                .then(() => res.status(204).json())
                .catch(err => res.status(400).json({ error: err.message }))
        })
        .catch(err => res.status(400).json({ error: err.message }))
})

// POST request to /api/profile/items
// Creates a new item
router.route('/items').post((req, res) => {
    const  item = new Item({
        owner: req.userId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        images: req.body.images,
        tags: req.body.tags
    })
    
    item.save()
        .then(() => res.status(201).json(item))
        .catch(err => res.status(400).json({ error: err.message }))
})

// PATCH request to /api/profile/items/:id
// Updates the user's item with the specified id
router.route('/items/:id').patch((req, res) => {
    Item.findOne({ _id: req.params.id, owner: req.userId })
        .then(item => {
            if (req.body.name) item.name = req.body.name
            if (req.body.price) item.price = req.body.price
            if (req.body.description) item.description = req.body.description
            if (req.body.images) item.images = req.body.images
            if (req.body.tags) item.tags = req.body.tags

            item.save()
                .then(() => res.status(204).json())
                .catch(err => res.status(400).json({ error: err.message }))
        })
        .catch(err => res.status(400).json({ error: err.message }))
})

// DELETE request to /api/profile/items/:id
// Deletes the user's item with the specified id
router.route('/items/:id').delete((req, res) => {
    Item.findOneAndDelete({ _id: req.params.id, owner: req.userId })
        .then(() => res.status(204).json())
        .catch(err => res.status(400).json({ error: err.message }))
})

// GET request to /api/profile/messages
// Returns the user's messages
router.route('/messages').get((req, res) => {
    const offset = parseInt(req.query.offset) || 0
    const limit = parseInt(req.query.limit) || undefined

    const query = { 
        $or: [{ sender: req.userId }, { receiver: req.userId }],
        blocked: false 
    }

    if (req.query.otherUser) {
        query.$or[0].receiver = req.query.otherUser
        query.$or[1].sender = req.query.otherUser
    }
    if (req.query.item) query.item = req.query.item

    Message.find(query)
        .skip(offset)
        .limit(limit)
        .then(messages => res.json(messages))
        .catch(err => res.status(400).json({ error: err.message }))
})

// GET request to /api/profile/messages/:id
// Returns the user's message with the specified id
router.route('/messages/:id').get((req, res) => {
    Message.findOne({ 
        _id: req.params.id,
        blocked: false,
        $or: [{ sender: req.userId }, { receiver: req.userId }]
    })
        .then(message => res.json(message))
        .catch(err => res.status(400).json({ error: err.message }))
});


// POST request to /api/profile/messages
// Creates a new message
router.route('/messages').post(async (req, res) => {
    const item = await Item.findById(req.body.item)
    if (!item) return res.status(400).json({ error: 'Item not found' })
    const message = new Message({
        sender: req.userId,
        receiver: item.owner,
        item: item._id,
        content: req.body.content
    })

    message.save()
        .then(() => res.status(201).json(message))
        .catch(err => res.status(400).json({ error: err.message }))
})

module.exports = router;