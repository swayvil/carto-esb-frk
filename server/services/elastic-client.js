'use strict';

var elasticsearch = require('elasticsearch');

var esClient = {};
esClient.log = null;
esClient.client = null;

module.exports = esClient;
connect();

function connect() {
	esClient.client = new elasticsearch.Client({
		host : 'localhost:9200'
		//log : 'trace'
	});
	initDao();
}

function initDao() {
	esClient.log = require('../dao/log-dao')(esClient.client);
}