# pdeffff
## Converts html files and strings, as well as urls, into pdf streams

### Options

Takes viewportSize and paperSize options, in an options object.

```
var options = {
  viewportSize: {
    width: 2000, // default 1100
    height: 1000 // default 800
  },
  paperSize: { // default, undefined
    format: "Letter",
    orientation: "portrait",
    margin: "1cm"
  }
};
```

### Sample usage

```
var pdeffff = require("pdeffff");
var fs = require("fs");
var uuid = require('node-uuid');

var options = {
  viewportSize: {
    width: 1000,
    height: 800
  },
  paperSize: {
    format: "Letter",
    orientation: "portrait",
    margin: "1cm"
  }
};

options = undefined;

pdeffff.fromURL("http://cnn.com", options)
  .then(function(stream){
    var filename = uuid.v1() + '.pdf';
    var writableStream = fs.createWriteStream(filename);
    stream.pipe(writableStream);
  });

pdeffff.fromString("<p>Hey!</p>", options)
  .then(function(stream){
    var filename = uuid.v1() + '.pdf';
    var writeableStream = fs.createWriteStream(filename);
    stream.pipe(writeableStream);
  });

pdeffff.fromFile([readableStream], options)
  .then(function(stream){
    var filename = uuid.v1() + '.pdf';
    var writeableStream = fs.createWriteStream(filename);
    stream.pipe(writeableStream);
  });
```

This can also be used in express, or any other server that deals in streams.

```
app.post('/url', function (req, res) {
  pdeffff.fromURL(req.body.url, options)
    .then(function(stream) {
      stream.pipe(res);
    });
});
```

### Notes

This takes awhile to run (about 10-15 seconds), there are setTimeout's everywhere. Will work at chipping away at them, but in due time.
