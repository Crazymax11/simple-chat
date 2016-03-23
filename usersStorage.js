"use strict";

// пользователь содержит 3 поля
// login - string
// password - string
// avatar - url string
// username - string

var fs = require('fs');
// хранилище - папка с файлами

// TODO: проверка на существующие юзернеймы
class UsersStorage{
  constructor(values){
    this.dir = values.dir;
    this.defaultAvatarUrl = values.defaultAvatarUrl;
    this.logger = values.logger("user storage");
    fs.readdir( this.dir, (err, files) => {
      if (err) throw (err);
      this.keys = files;
      this.logger.info("user storage loaded with %d users", this.keys.length);
    });
  }
  //callback (err, userInfo);
  createUser(values, callback){
    new Promise( (resolve, reject) => {
      if (!values.username || !values.password || !values.login) reject(new Error("not all data is presented"));
      values.avatar = values.avatar || this.defaultAvatarUrl;
      if (values.login in this.keys) reject(new Error("login already exists"))
      let obj = {
        login: values.login,
        password: values.password,
        avatar: values.avatar,
        username: values.username
      }
      fs.writeFile(this.dir + '/' + obj.login, JSON.stringify(obj), (err) =>{
        if (err) reject(err);
        resolve(obj);
      })
    })
    .then(  (obj) => {
      this.keys.push(obj.login);
      callback(NULL, obj);
    })
    .catch( (err) => callback(err, NULL));
  }
  // callback( err, userInfo)
  readUser(values, callback){
    new Promise( (resolve, reject) => {
      if (!(values.login in this.keys)) reject(new Error("no such login"));
      fs.readFile(this.dir + '/' + values.login, (err, data) =>{
        err? reject(err): resolve(json.parse(data));
      })
      .then( (data) => callback(NULL, data))
      .catch( (err) => callback(err, NULL));
    }
  )
  // обновляет данные о юзере, callback (err, userInfo)
  updateUser(values, callback){
    new Promise( (resolve, reject) => {
      this.readUser(values, {err, obj} =>{
        if (err) reject(err);
        if ("avatar" in values) obj.avatar = values.avatar;
        if ("username" in values) obj.username = values.username;
        if ("password" in values) obj.password = values.password;
        fs.writeFile(this.dir + '/' + values.login, JSON.stringify(obj), (err) => {
          if (err) reject(err);
          resolve(obj);
        })
      })
    })
    .then(  (obj) => callback(NULL, obj))
    .catch( (err) => callback(err, NULL));
  }
  //callback(err)
  deleteUser(values, callback){
    new Promise( (resolve, reject) => {
      if (!(values.login in this.keys)) reject(new Error("no such login"));

      fs.unlink(this.dir + '/' + values.login, (err) =>{
        if (err) reject(err);
        resolve();
      })
    })
    .then( () => {
      this.keys.splice(this.keys.indexOf(values.login), 1);
      callback();
    })
    .catch( (err) => callback(err) );
  }
}
