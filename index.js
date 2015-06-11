var fs = require('fs');
var path = require("path");
var uuid = require('node-uuid');
var phantom = require('phantom');
var Q = require("Q");

module.exports = {
  fromURL: function(url, options) {
    var deferred = Q.defer();

    var filename = 'tmp/' + uuid.v1() + '.pdf';
    phantom.create(function(ph) {
      ph.createPage(function(page) {
        page.open(url, function(status){
          setTimeout(function() {
            renderPDFAndSendStream(filename, page, ph, options)
              .then(function(stream){
                deferred.resolve(stream);
              });
          }, 1000);
        });
      });
    });

    return deferred.promise;
  },
  fromString: function(str, options) {
    var deferred = Q.defer();

    var filename = 'tmp/' + uuid.v1() + '.pdf';
    phantom.create(function(ph) {
      ph.createPage(function(page) {
        page.set("content", str);
        setTimeout(function() {
          renderPDFAndSendStream(filename, page, ph, options)
            .then(function(stream){
              deferred.resolve(stream);
            });
        }, 5000);
      });
    });

    return deferred.promise;
  },
  fromFile: function(file, options) {
    var deferred = Q.defer();

    var self = this;

    var filename = 'tmp/' + uuid.v1() + '.pdf';
    fs.readFile(file, "utf-8", function(err, data) {
      self.fromString(data, options)
        .then(function(stream){
          deferred.resolve(stream);
        });
    });

    return deferred.promise;
  }
};

function renderPDFAndSendStream(filename, page, ph, options) {
    var deferred = Q.defer();

    if (options === undefined) {
      options = {};
    }

    if (options.viewportSize === undefined) {
      options.viewportSize = {
        width: 1100,
        height: 800
      };
    }

    prepareStylesheetsForPhantom(page);
    if (options.paperSize !== undefined) {
      page.set("paperSize", options.paperSize);
    }
    page.set("zoomFactor", 1100 / options.viewportSize.width);
    page.evaluate(function(w, h) {
        document.body.style.width = w + "px";
        document.body.style.height = h + "px";
    }, null, options.viewportSize.width, options.viewportSize.height);
    page.clipRect = {top: 0, left: 0, width: options.viewportSize.width, height: options.viewportSize.height};
    page.render(filename, function() {
      sendPDFStream(filename, page, ph)
        .then(function(stream){
          deferred.resolve(stream);
        });
    });

    return deferred.promise;
}

function sendPDFStream(filename, page, ph) {
  var deferred = Q.defer();

  setTimeout(function() {
    var exists = fs.exists(filename, function(exists) {
      if (exists) {
        setTimeout(function() {
          var readStream = fs.createReadStream(filename);
          readStream.on('open', function () {
            page.close();
            ph.exit();
            deferred.resolve(readStream);
          });

          readStream.on('error', function(err) {

          });

          readStream.on('close', function() {
            fs.unlink(filename);
          });
        }, 10000);
      }
    });
  }, 1000);

  return deferred.promise;
}

function prepareStylesheetsForPhantom(page) {
  page.evaluate(function() {
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === 'stylesheet') {
        links[i].media = links[i].media + ',print';
      }
    }
  });
}