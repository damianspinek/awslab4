var AWS = require("aws-sdk");
var helpers = require("../helpers");

AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();

var task =  function(request, callback){
	
	var params = {
		Bucket: request.query.bucket, 
		Key: request.query.key
	};
	
	s3.getObject(params, function(err, data) {
	  if (err) callback(err);
	  
	  else     {
		var algorithms = ['md5', 'sha1', 'sha256', 'sha512'];
	var loopCount = 1;
	
	
	helpers.calculateMultiDigest(data.Body.toString(), 
		algorithms, 
		function(err, digests) {
			callback(null, JSON.stringify(data.Metadata) + "<br />" + digests.join("<br />")); 
		}, 
		loopCount);
	  
	  }
	});
	
	
}

exports.action = task