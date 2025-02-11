"use strict";

/**
 * Module dependencies
 */

// Public node modules.
const fs = require("fs");
const path = require("path");

const UPLOADS_FOLDER_NAME = "uploads";

module.exports = {
  provider: "strapi-provider-upload-local",
  name: "Local server",
  init() {
    const uploadDir = path.resolve(
      strapi.dirs.static.public,
      UPLOADS_FOLDER_NAME
    );

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
            ? `/${formatDate()}/${file.path}`
            : `/${formatDate()}`;

          const dir = path.join(uploadDir, folder);


          if (!fs.existsSync(dir)) {
						fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFile(`${dir}/${file.hash}${file.ext}`, file.buffer, (err) => {
            if (err) {
              return reject(err);
            }

            file.url = `/${UPLOADS_FOLDER_NAME}${folder}/${file.hash}${file.ext}`;

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
