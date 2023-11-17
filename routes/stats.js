const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verify } = require('jsonwebtoken')

router.get('/', async (req, res) => {
    res.send('Hello 👋, this is stats endpoint');
});

router.get('/aggregate', async (req, res) => {
    res.send('something');
});

router.get('/breakdown', async (req, res) => {
    res.send('something');
});

module.exports = router;