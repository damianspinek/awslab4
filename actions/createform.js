var util = require("util");
var randomString = require('randomstring');
var AWS = require("aws-sdk");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";

createDomain();
var task = function(request, callback){
	//1. load configuration
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);
	var simpledb = new AWS.SimpleDB();
    //callback(null, "Hello" + request.params.name);
	//2. prepare policy
	policyData.conditions.push({"x-amz-meta-address": request.ip});
	policyData.conditions.push({"x-amz-meta-firstname":"Damian"});
	policyData.conditions.push({"x-amz-meta-lastname": "Spinek"});
	var policy = new Policy(policyData);

	//3. generate form fields for S3 POST
	var s3Form = new S3Form(policy);
	var fields = s3Form.generateS3FormFields();
	s3Form.addS3CredientalsFields(fields, awsConfig);

	//4. get bucket name
	var bucketName = policyData.conditions[1].bucket;
	logToDb(request);
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields, bucket:bucketName}});
}

exports.action = task;
function createDomain(){
		var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
		var policyData = helpers.readJSONFile(POLICY_FILE);
		AWS.config.loadFromPath('./config.json');
		var simpledb = new AWS.SimpleDB();
		
		var params = {
			DomainName: 'Spinek-domena',
			/* required */
		};
		
		simpledb.createDomain(params, function (err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else     console.log(data);           // successful response
		});
}

function logToDb(request){
	AWS.config.loadFromPath('./config.json');
	var simpledb = new AWS.SimpleDB();
	var params = {
		Attributes : [
			{
				Name: "ip",
				Value: request.ip,
				Replace: false
			},
			{
				Name: 'data',
				Value: (new Date().toISOString()),
				Replace: false
			}
		],
		DomainName: 'Spinek-domena',
		ItemName: randomString.generate(10)
	};
	simpledb.putAttributes(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     selectFromDb();           // successful response
});
}

function selectFromDb(){
	AWS.config.loadFromPath('./config.json');
	var simpledb = new AWS.SimpleDB();
	var params = {
		SelectExpression: 'SELECT * FROM `Spinek-domena`' /* required */
	};
	simpledb.select(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else     console.log(data);           // successful response
	});
}