var express = require('express');
var app = express();

var server = app.listen(3000, () => {
	console.log('Node.js is listening to PORT:' + server.address().port);
});

app.use('/ysd', express.static(__dirname + '/node_modules/ysd-media-processor/'));
// app.use('/ysd', express.static(__dirname + '/../ysd-media-processor/'));
app.use(express.static('public'));
app.use(express.static('audio'));