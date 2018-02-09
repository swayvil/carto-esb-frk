'use strict';

var Graph = require("graphlib").Graph;
var es = require('./elastic-client');

var service = {};
service.build = build;

module.exports = service;

// Node schema definition
/*
 * node = { "componentName": "string", "flowCode": "string", "auditId":
 * "string", "flowId": "string", "ids": [{ "taskId": "string", "contextId":
 * "string" }] }
 */

// Create a new directed graph
var g = new Graph();

function build(logId) {
	return new Promise(function(resolve, reject) {
		buildCallBack(logId, function(err, result) {
			if (err) {
				return reject(err);
			}
			return resolve(result);
		});
	});
}

function buildCallBack(logId, callback) {
	getLogsById(logId).then(function(log) {
		// Add node "componentName" to the graph with an Object "node"
		g.setNode(log.componentName, newNode(log));

		var queueChildren = [];
		queueChildren.push(log);
		// Look at that, promises + recursivity!
		buildRec(queueChildren, 0, function() {
			//console.log(g);
			//console.log(g._nodes['bw.mc-carto-F1-1']);
			//console.log(g.nodes());
			//console.log(g.edges());
			//console.log(g.outEdges("bw.mc-carto-F1-1"));
			callback(null, { nodes: nodesToD3JsFormat(), links: edgesToD3JsFormat() });
		});
	}).catch(function(error) {
		console.error(error);
	})
}

function buildRec(queueChildren, i, callback) {
	if (i >= queueChildren.length) {
		return callback();
	} else {
		var log = queueChildren[i];
		getLogsChildren(log).then(function(logsChildren) {
			logsChildren = removeDuplicate(logsChildren);
			if (logsChildren.length <= 0) {
				return callback();
			}
			logsChildren.forEach(function(logChild) {
				g.setNode(logChild.componentName, newNode(logChild));
				// Add a directed edge from "log" to "logChild", but assign no
				// label
				g.setEdge(log.componentName, logChild.componentName);
				
				queueChildren.push(logChild);
				return buildRec(queueChildren, i + 1, callback);
			});
		}).catch(function(error) {
			console.error(error);
		});
}
}

function getLogsById(id) {
	return new Promise(function(resolve, reject) {
		es.log.getLogsById(id, function(err, result) {
			if (err) {
				return reject(err);
			}
			return resolve(result);
		});
	});
}

// Search logs with same flowId, taskId or contextId
function getLogsChildren(log) {
	return new Promise(function(resolve, reject) {
		es.log.getLogsChildren(log.flowId, log.taskId, log.contextId, function(
				err, result) {
			if (err) {
				return reject(err);
			}
			return resolve(result);
		});
	});
}

function newNode(log) {
	var node = {
		"componentName" : log.componentName,
		"serviceName" : log.serviceName,
		"flowCode" : log.flowCode,
		"auditId" : log.auditId,
		"flowId" : log.flowId,
		"ids" : []
	};
	var id = {
		"taskId" : log.taskId,
		"contextId" : log.contextId
	};
	node.ids.push(id);
	return node;
}

function removeDuplicate(arraylogs) {
	// console.log("arraylogs: ");
	// console.log(arraylogs);
	var newArrayLogs = [];
	arraylogs.forEach(function(log) {

		var found = newArrayLogs.find(function(element) {
			// console.log("componentName: " + log._source.componentName);
			return element.componentName === log._source.componentName;
		});
		// console.log("found: " + found);
		if (found === undefined) {
			newArrayLogs.push(log._source);
		}
	});
	return newArrayLogs;
}

function nodesToD3JsFormat() {
	var nodesTarget = [];

	var index = 0;
	g.nodes().forEach(function(node) {
		var nodeTarget = g._nodes[node];
		nodeTarget.index = index++;
		nodesTarget.push(nodeTarget);
		});
	return nodesTarget;
}

function findNodeIndex(nodes, componentName) {
	for (var index = 0; index < nodes.length; index++) {
		if (nodes[index] == componentName) {
			return index;
		}
	}
	return index;
}

function edgesToD3JsFormat() {
	var edgesTarget = [];
	
	var index = 0;
	g.edges().forEach(function(edge) {
		var edgeTarget = { source: 0, target: 0};
		edgeTarget.source = findNodeIndex(g.nodes(), edge.v);
		edgeTarget.target = findNodeIndex(g.nodes(), edge.w);
		edgesTarget.push(edgeTarget);
		});
	return edgesTarget;
}