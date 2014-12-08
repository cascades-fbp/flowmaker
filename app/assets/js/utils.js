/**
 * Select file from a folder and pass its path to callback
 */
function chooseFile(element, callback) {
  var chooser = $(element);

  chooser.change(function(event) {
    var fs = require("fs");
    fs.readFile($(this).val(), "utf8", function(err, data) {
      if (err) {
        alert("Failed to read file: " + err);
        return;
      }
      callback(data);
    });
  });

  chooser.trigger('click');
}


/**
 * Show save file dialog with a given suggested name and content
 */
function saveToFile(element, suggFilename, data) {
  var chooser = $(element);

  chooser.attr("nwsaveas", suggFilename);
  chooser.attr("nwworkingdir", getUserHome());

  chooser.change(function(event) {
    var fs = require("fs");
    var filepath = $(this).val();

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    fs.writeFile(filepath, data, "binary", function(err) {
      if (err) {
        alert("Failed to save file: " + err);
      }
    });

  });

  chooser.trigger('click');
}

/*
 * Cross-platform way to get user's home
 */
function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}