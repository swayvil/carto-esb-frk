'use strict';

module.exports = function(esClient) {
	var log = {};
	log.getLogsById = getLogsById;
	log.getLogsChildren = getLogsChildren;

	function getLogsById(id, callback) {
		try {
			esClient.get({
				index : 'tibco-audit-servicecontext',
				type : 'serviceContext',
				id : id
			}, function(error, response) {
				if (typeof (callback) == 'function') {
					callback(error, response._source);
				}
			});
		} catch (err) {
			console.log(err);
		}
	}

	/*
	 * POST tibco-audit-servicecontext/serviceContext/_search { "query": {
	 * "bool" : { "must" : [ { "term" : { "parentFlowId":
	 * "3c93b7d19dac4a2e89ca3c658793e7ed" } }, { "term" : { "parenttaskId":
	 * "3389fd520d8241cca7fe64df9039e514" } }, { "term" : { "parentCtxId":
	 * "943d3f72236d417b8af3f66e30c1db8d"} } ] } } }
	 */
	function getLogsChildren(flowId, taskId, contextId, callback) {
		try {
			var request = {
				index : 'tibco-audit-servicecontext',
				type : 'serviceContext',
				body : {
					query : {
						bool : {
							must : [ {
								term : {
									"parentFlowId" : flowId
								}
							}, {
								term : {
									"parenttaskId" : taskId
								}
							}, {
								term : {
									"parentCtxId" : contextId
								}
							} ]
						}
					}
				}
			};
			esClient.search(request, function(error, response) {
				var hits = response.hits.hits;
				//console.log("getLogsChildren");
				//console.log(hits);
				if (typeof (callback) == 'function') {
					// console.log("callback");
					callback(error, hits);
				}
			});
		} catch (err) {
			console.log(err);
		}
	}

	return log;
};