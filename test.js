var Throughput = require('./index.js'),
    http = require('http'),
    https = require('https');

var throughput = new Throughput({
  expectedBytes: 10000000000,
  sampleTimeframe: 2000
});

throughput.on('count', function(count) {
  console.log('Count: ' + count);
});

throughput.on('rate', function(rate) {
  console.log('Rate: ' + rate);
});

throughput.on('report', function(report) {
  console.log('Report:');
  console.log(report);
});

setInterval(function() {
  throughput.sample(2048);
}, 1000);

setInterval(function() {
  throughput.report(false);
  //throughput.finish(true);
}, 1000);

/*
https.get('https://my.doctape.com/s/E0CVuD/video.mp4', function(res) {
  res.on('data', function(data) {
    throughput.sample(data.length);
  });
});
*/
