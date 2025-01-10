"use strict";

/**
 * Module dependencies
 */

// Public node modules.
const fs = require("fs");
const path = require("path");

module.exports = {
  provider: "strapi-provider-upload-local",
  name: "Local server",
  init() {
    const uploadDir = strapi.dir;

    const formatDate = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    return {
      upload(file) {
        return new Promise((resolve, reject) => {
          // write file in public/assets folder
          const folder = file.path
            ? `/uploads/${formatDate()}/${file.path}`
            : `/uploads/${formatDate()}`;

          const dir = path.join(uploadDir, folder);

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          fs.writeFile(`${dir}/${file.hash}${file.ext}`, file.buffer, (err) => {
            if (err) {
              return reject(err);
            }

            file.url = `${folder}/${file.hash}${file.ext}`;

            resolve();
          });
        });
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const filePath = path.join(uploadDir, `${file.url}`);

          if (!fs.existsSync(filePath)) {
            return resolve("File doesn't exist");
          }

          // remove file from public/assets folder
          fs.unlink(filePath, (err) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      },
    };
  },
};
