'use strict';

const express = require('express');
const router = express.Router();
var buildGraph      = require('../services/build-graph');

// declare axios for making http requests
const axios = require('axios');

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

// Get carto
// http://localhost:3000/api/carto/XXX
router.get('/carto/:id', (req, res) => {
	if (req.params.id) {
	buildGraph.build(req.params.id).then(function(carto) {
		res.status(200).json(carto);
	}).catch(error => {
      res.status(500).send(error)
    });
	}
});

module.exports = router;