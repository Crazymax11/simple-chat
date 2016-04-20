"use strict";

// пользователь содержит 3 поля
// login - string
// password - string
// avatar - url string
// username - string

var fs = require('fs');
// хранилище - папка с файлами
var mkdirp = require('mkdirp');
class UsersStorage {
    constructor(values) {
            this.dir = values.dir;
            this.defaultAvatarUrl = values.defaultAvatarUrl;
            this.logger = values.logger.getLogger("user storage");
            // создать директорию если ее нет
            mkdirp.sync(this.dir);
            this.logger.info("user storage loaded");
        }
        //callback (err, userInfo);
    createUser(values, callback) {
            new Promise((resolve, reject) => {
                    // все ли данные представлены
                    let notpresented = [];
                    if (!values.username) notpresented.push("username");
                    if (!values.password) notpresented.push("password");
                    if (!values.login) notpresented.push("login");

                    if (notpresented.length) {
                        let errstr = "provide all data to create a new user, you didn't provide these values: ";
                        for (let v of notpresented) errstr += v + " ";
                        reject(new Error(errstr));
                    }
                    values.avatar = values.avatar || this.defaultAvatarUrl;
                    let obj = {
                        login: values.login,
                        password: values.password,
                        avatar: values.avatar,
                        username: values.username
                    };
                    resolve(obj);
                })
                .then((obj) => {
                    return new Promise((resolve, reject) => {
                        //проверим существует ли такой юзер
                        this._doesLoginExists({
                            login: obj.login
                        }, (ex) => ex ? reject(new Error("such login already created")) : resolve(obj));
                    });
                })
                .then((obj) => {
                    return new Promise((resolve, reject) => {
                        //проверим занят ли юзернейм
                        this._doesUsernameExists({
                            username: obj.username
                        }, (ex) => ex ? reject(new Error("such username already created")) : resolve(obj));
                    });
                })
                .then((obj) => {
                    return new Promise((resolve, reject) => {
                        //ну можно и создать юзера
                        fs.writeFile(this.dir + '/' + obj.login, JSON.stringify(obj), (err) => {
                            if (err) reject(err);
                            resolve(obj);
                        });
                    });
                })
                .then((obj) => callback(null, obj))
                .catch((err) => callback(err, null));
        }
        // callback( err, userInfo)
    readUser(values, callback) {
            fs.readFile(this.dir + '/' + values.login, (err, data) => {
                err ? callback(err, null) : callback(err, JSON.parse(data));
            });
        }
        // обновляет данные о юзере, callback (err, userInfo)
    updateUser(values, callback) {
            new Promise((resolve, reject) => {
                    this.readUser(values, (err, obj) => {
                        if (err) reject(err);
                        if (values.avatar) obj.avatar = values.avatar;
                        if (values.username) obj.username = values.username;
                        if (values.password) obj.password = values.password;
                        fs.writeFile(this.dir + '/' + values.login, JSON.stringify(obj), (err) => {
                            if (err) reject(err);
                            resolve(obj);
                        });
                    });
                })
                .then((obj) => callback(obj, null))
                .catch((err) => callback(err, null));
        }
        //callback(err)
    deleteUser(values, callback) {
        new Promise((resolve, reject) => {
                fs.unlink(this.dir + '/' + values.login, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            })
            .then(() => {
                callback(null);
            })
            .catch((err) => callback(err));
    }
    _doesLoginExists(values, callback) {
        fs.exists(this.dir + "/" + values.login, callback);
    }
    _doesUsernameExists(values, callback) {
        new Promise((resolve, reject) => {
                fs.readdir(this.dir, (err, files) => {
                    err ? reject(err) : resolve(files);
                });
            })
            .then((files) => {
                if (!files.length) callback(false);
                let promises = [];
                for (var filename of files) {
                    promises.push(new Promise((resolve, reject) => {
                        fs.readFile(this.dir + "/" + filename, (err, data) => {
                            if (data) {
                                data = JSON.parse(data);
                                data.username === values.username ? reject(data) : resolve();
                            }
                        })
                    }))
                    Promise.all(promises)
                        .then(() => callback(false))
                        .catch((data) => callback(true));
                }
            })
    }
}


module.exports = UsersStorage;
