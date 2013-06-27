/*

  @TODO

  - Mean (average), median, mode
  - Make ETA work without record
*/

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

function Throughput(opts) {
  EventEmitter.call(this);

  var self = this;

  opts = opts || {};

  this.count = 0;
  this.timePassed = 0;
  this.rate = 0;
  this.expectedBytes = opts.expectedBytes || null;
  this.sampleTimeframe = opts.sampleTimeframe || 1000;
  this.record = opts.record || true,
  this.finished = false,
  this.recordData = [];

  this.interval = setInterval(function() {
    // Increment timePassed
    self.timePassed += self.sampleTimeframe;
    // Calculate byte/s for last interval
    var rate = self.rate * (1000/self.sampleTimeframe);
    // Emit events
    self.emit('count', self.count);
    self.emit('rate', rate);
    // Record rate
    if(self.record) { self.recordData.push(rate); }
    // Reset rate
    self.rate = 0;
  }, this.sampleTimeframe);

  return this;
}

util.inherits(Throughput, EventEmitter);
module.exports = Throughput;

Throughput.prototype.sample = function(bytes) {
  if(this.finished) {
    throw new Error('Can\'t sample data after finish() was called.');
  }
  this.count += bytes;
  this.rate += bytes;
};

Throughput.prototype.finish = function(exposeData) {
  this.finished = true;
  clearInterval(this.interval);
  this.report(null, exposeData);
}

Throughput.prototype.report = function(reset, exposeData) {
  if(this.record) {

    var total = 0, eta = null, rate, overallRate;

    for(var i in this.recordData) {
      total += this.recordData[i];
    }

    // Calculate overall rate
    overallRate = ( total * (1000/(this.sampleTimeframe*this.recordData.length)) );

    // Calculate current rate
    rate = this.recordData[this.recordData.length-1] * (1000/this.sampleTimeframe);

    // Calculate ETA
    if(this.expectedBytes) {
      eta = (this.expectedBytes - this.count) / rate;
      eta = Math.round(eta) + ' seconds';
    }

    var report = {
      byteCount: this.count,
      overallRate: Math.round(overallRate/1024) + ' kbyte/s',
      currentRate: Math.round(rate/1024) + ' kbyte/s',
      eta: eta,
      timePassed: this.timePassed,
      sampleTimeframe: this.sampleTimeframe,
      sampleData: exposeData ? this.recordData : null,
    };
    this.emit('report', report);
    if(reset) {
      this.recordData = [];
    }
  }
};