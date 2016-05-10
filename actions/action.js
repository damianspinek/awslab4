exports.action = function(request, callback) {
    callback(null, “Hello” + request.params.name);
}