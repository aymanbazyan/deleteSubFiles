const fs = require("fs");
const path = require("path");

// config:
const deleteFilesWithExt = ".vtt";
const dontDeleteFilesWithTheeseStrings = ["Arabic", "English"];

const filesnames = fs.readdirSync(
  __dirname
  // { withFileTypes: true }
);

filesnames.forEach((filename) => {
  // is folder
  if (path.extname(filename) == "") {
    const subFilesnames = fs.readdirSync(`${__dirname}/${filename}`);

    subFilesnames.forEach((subFileName) => {
      if (
        path.extname(subFileName) == deleteFilesWithExt &&
        dontDeleteFilesWithTheeseStrings.every(
          (val) => !subFileName.includes(val)
        )
      ) {
        fs.rm(`${filename}/${subFileName}`, () => {
          console.log(`Deleted: ${filename}}/${subFileName}`);
        });
      }
    });
  }
});
