const express = require("express");
const { isLoggedIn } = require("../controllers/auth.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const sharp = require("sharp");

const UserController = require("../controllers/user.js");
const dbService = require("../services/dbService.js");
const { fail } = require("assert");
const { registerHelper } = require("hbs");
const dbs = new dbService();

router.get(
  "/active",
  isLoggedIn,
  (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      console.log(req.body);
      req.body.user = req.user;
      next();
    }
  },
  UserController.users_get_userById
);

router.post(
  "/control",
  isLoggedIn,
  (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      req.body.userId = req.user.unique_id;
      next();
    }
  },
  UserController.users_control_user
);

router.patch(
  "/patch",
  isLoggedIn,
  (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      console.log(req.user);
      req.body.userId = req.user.unique_id;
      req.body.oldpassword = req.user.password;
      next();
    }
  },
  UserController.users_update_user
);

router.post(
  "/avatar",
  isLoggedIn,
  (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      req.body.userId = req.user.unique_id;

      if (req.files) {
        const file = req.files.image;
        const fileName = req.files.image.name;
        const ext = path.extname(fileName);

        const unique_id = req.user.unique_id;

        dbs.setUserFolders(unique_id);

        const basePath = `./public/images/users/${unique_id}/avatar/`;

        fs.readdir(basePath, (err, files) => {
          if (err) {
            console.log(err);
            return res.json({
              message: "Hiba történt!",
            });
          } else {
            if (files.length > 0) {
              for (const file of files) {
                console.log(file);
                fs.unlink(path.join(basePath, file), (err) => {
                  if (err) return console.log(err);
                });
              }
            } else {
              return res.json({
                message: "Nincs törölhető kép!",
              });
            }
          }
        });

        const rnd = uuid.v4();
        const randomId = rnd;
        const unique_name = `${randomId}${ext}`;

        file.mv(basePath + unique_name, (err) => {
          if (err) {
            res.send(err);
            return;
          } else {
            req.body.avatarId = unique_name;
            next();
          }
        });
      } else {
        return res.json({
          message: "Nincs file csatolva!",
        });
      }
    }
  },
  UserController.users_update_avatar
);

router.delete(
  "/avatar",
  isLoggedIn,
  (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      req.body.userId = req.user.unique_id;
      const unique_id = req.user.unique_id;
      const basePath = `./public/images/users/${unique_id}/avatar/`;
      try {
        fs.readdir(basePath, (err, files) => {
          if (err) {
            console.log(err);
            return res.json({
              message: "Hiba történt!",
            });
          } else {
            if (files.length > 0) {
              for (const file of files) {
                fs.unlink(path.join(basePath, file), (err) => {
                  if (err) throw err;
                });
              }
              fs.copyFile(
                "./public/images/avatar.png",
                `${basePath}/avatar.png`,
                (err) => {
                  if (err) throw error;
                }
              );
              req.body.avatarId = "avatar.png";
              next();
            } else {
              return res.json({
                message: "Nincs törölhető kép!",
              });
            }
          }
        });
      } catch (error) {
        return error.message;
      }
    }
  },
  UserController.users_update_avatar
);

router.post("/avatar/preview", isLoggedIn, async (req, res) => {
  if (!req.user) {
    console.log("response message:", res.message);
    res.redirect("/");
  } else {
    req.body.userId = req.user.unique_id;

    if (req.files) {
      const file = req.files.image;
      const fileName = req.files.image.name;
      const fileExt = path.extname(fileName);

      // Elérési útvonalak beállítása, ha hiányozna
      const unique_id = req.user.unique_id;
      const basePath = `./public/images/users/${unique_id}/`;
      dbs.setUserFolders(unique_id);

      const pufferPath = basePath + "puffer/";
      const previewPath = basePath + "prev/";

      // PUFFER mappa ürítése
      //   try {
      //     fs.readdir(pufferPath, (err, files) => {
      //       if (err) throw err;
      //       if (files.length > 0) {
      //         for (const file of files) {
      //           fs.unlink(path.join(pufferPath, file), (err) => {
      //             if (err) throw err;
      //           });
      //         }
      //       }
      //     });
      //   } catch (err) {
      //     console.log(err);
      //   }

      // // Előnézeti kép betöltése pufferbe

      let randomName = uuid.v4();
      //   try {
      //     file.mv(pufferPath + randomName + fileExt, (err) => {
      //       if (err) throw err;
      //     });
      //   } catch (err) {
      //     console.log(err);
      //   }

      // }

      // // Előézeti mappa ürítése
      fs.readdir(previewPath, (err, files) => {
        if (err) throw err;
        if (files.length > 0) {
          console.log("A mappa nem üres!");
          for (const file of files) {
            fs.unlink(path.join(previewPath, file), (err) => {
              if (err) throw err;
            });
          }
        }
      });

      // Végleges kép paramétereinek meghatározása, majd másolás
      const unique_name = randomName + fileExt;

      file.mv(previewPath + unique_name, (err) => {
        if (err) {
          return console.log(err);
        } else {
          res.json({
            img: unique_name,
            user: unique_id,
          });
        }
      });

      //   let input = pufferPath + unique_name;
      //   console.log(input);
      //   await sharp(input)
      //     .resize({ width: 300 })
      //     .toFile(previewPath + unique_name)
      //     .catch((error) => {
      //       console.log(error);
      //     });
    } else {
      return {
        status: false,
      };
    }
  }
});

router.post(
  "/avatar/prev",
  isLoggedIn,
  async (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      if (req.files) {
        // Elérési útvonalak beállítása, ha hiányozna
        const unique_id = req.user.unique_id;
        const path = await dbs.setUserFolders(unique_id);
        req.body.userId = req.user.unique_id;
        //await dbs.clearPufferFolder(path.pufferPath);
        req.body.fp = path;
        next();
      } else {
        res.json({
          ok: false,
          message: "no files",
        });
      }
    }
  },
  (req, res, next) => {
    const file = req.files.image;
    const fileName = path.basename(req.files.image.name);
    const fileExt = path.extname(fileName);
    const pufferedImage = uuid.v4() + fileExt;

    file.mv(req.body.fp.pufferPath + pufferedImage, (err) => {
      if (err) {
        res.send(err);
      } else {
        console.log("Másolás kész!");
        req.body.pufferedImage = pufferedImage;
        next();
      }
    });
  },
  async (req, res) => {
    const pufferedName = req.body.pufferedImage;
    const pufferPath = req.body.fp.pufferPath;
    const prevPath = req.body.fp.prevPath;

    fs.access(pufferPath + pufferedName, async (err) => {
      if (err) {
        console.log("Nem létezik a file");
      } else {
        console.log("Létezik a file!");
        //await dbs.clearPreviewFolder(prevPath);

        const pufferedImage = pufferPath + pufferedName;
        const final = await sharp(pufferedImage)
          .resize({ width: 300 })
          .toFile(prevPath + pufferedName)
          .catch((err) => {
            console.log(err);
          });
        if (final) {
          res.json({
            ok: true,
            message: "Sikerült az átméretezés!",
            img: pufferedName,
            user: req.user.unique_id,
          });
        }
      }
    });
  }
);

router.delete(
  "/avatar/prev",
  isLoggedIn,
  async (req, res, next) => {
    if (!req.user) {
      console.log("response message:", res.message);
      res.redirect("/");
    } else {
      const unique_id = req.user.unique_id;
      const ph = await dbs.setUserFolders(unique_id);
      const files = await dbs.getFolderFiles(ph.pufferPath);
      await dbs.removeFoldersFile(ph.pufferPath, files);
      next();
    }
  },
  async (req, res) => {
    console.log("járok itt?");
    const unique_id = req.user.unique_id;
    const ph = await dbs.setUserFolders(unique_id);
    const files = await dbs.getFolderFiles(ph.prevPath);
    const stat = await dbs.removeFoldersFile(ph.prevPath, files);
    if (stat) {
      res.json({
        ok: true,
        message: "mappák törölve!",
      });
    }
  }
);

module.exports = router;
