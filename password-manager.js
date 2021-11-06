"use strict";
// Show Users || Create Users || Delete Users
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", { value: true });
// Show Services || Create Services || Delete Services
// Show ID || Create ID || Delete ID
// Show ID Fields || Add ID Fields || Edit ID Field ||  Remove ID Fields
// Config
//   Select Cipher
//   Set Master Key
//   Set Key Per User
// DESIGN
//   Use as cli with arguments
//   Use as interactive with ask 
/* PROGRAM MODULES */
var fs = __importStar(require("fs"));
var exec = __importStar(require("child_process"));
/* UTILS FUNCTIONS */
var run = function (args) {
    var res = exec.execSync(args).toString();
    return res;
};
var createProgramFolder = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
var loadFile = function (filename) {
    var retValue;
    try {
        retValue = fs.readFileSync(filename, { encoding: "utf-8" });
    }
    catch (e) {
        retValue = null;
    }
    return retValue;
};
var open = function (filename, mode) {
    var fd = {};
    fd.internalFd = fs.openSync(filename, mode);
    fd.read = function (buffer, position, len) { return fs.readSync(fd.internalFd, buffer, position, len, null); };
    fd.puts = function (str) { return fs.writeSync(fd.internalFd, str); };
    fd.close = function () { return fs.closeSync(fd.internalFd); };
    return fd;
};
var createFile = function (filename, data) {
    if (!fs.existsSync(filename)) {
        var fd = open(filename, "w");
        fd.puts(data);
        fd.close();
    }
};
var createFileOverwrite = function (filename, data) {
    var fd = open(filename, "w");
    fd.puts(data);
    fd.close();
};
/* PROGRAM FUNCTIONS */
var createDatabase = function (dbPath) {
    if (!fs.existsSync(dbPath)) {
        var db = {
            users: [],
            masterKey: "",
            masterTestKey: "jdjdusjdjddj",
            expectedTest: "key is fine",
            config: {
                useMasterKey: false,
                usePerUserKey: false
            }
        };
        createFile(dbPath, JSON.stringify(db, null, 2));
    }
};
var updateDatabase = function (dbPath, db) {
    if (fs.existsSync(dbPath)) {
        createFileOverwrite(dbPath, JSON.stringify(db, null, 2));
    }
    else {
        createDatabase(dbPath);
        updateDatabase(dbPath, db); // try again after create the database
    }
};
// get the program data as json from filesystem
var getData = function (jsonPath) {
    var data = loadFile(jsonPath);
    var jsonData = {};
    if (data) {
        try {
            jsonData = JSON.parse(data);
        }
        catch (error) {
            return null;
        }
    }
    else {
        return null;
    }
    if (!data) {
        return null;
    }
    return jsonData;
};
var getUsers = function (jsonPath) {
    var _a;
    var data = getData(jsonPath);
    if (!((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length)) {
        return null;
    }
    else {
        return data.users;
    }
};
var showUsers = function (jsonPath) {
    var users = getUsers(jsonPath);
    if (!users) {
        console.log("No users to show");
        return undefined;
    }
    console.log("USERS:");
    for (var i = 0; i < users.length; ++i) {
        console.log("  " + (+i + 1) + " - " + users[i].username);
    }
    console.log("\n");
    return undefined;
};
var createUser = function (jsonPath, userData) {
    var _a, _b;
    var data = getData(jsonPath);
    if (data && (userData === null || userData === void 0 ? void 0 : userData.username)) {
        var user = {};
        user.username = userData.username;
        if (userData.key) {
            user.key = userData.key;
        }
        user.services = [];
        // check if user already exists
        if (data === null || data === void 0 ? void 0 : data.users) {
            for (var i = 0; i < ((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length); ++i) {
                if (data.users[i].username === user.username) {
                    console.log("\nUser \"" + user.username + "\" already exists");
                    return undefined;
                }
            }
        }
        (_b = data === null || data === void 0 ? void 0 : data.users) === null || _b === void 0 ? void 0 : _b.push(user);
        updateDatabase(jsonPath, data);
    }
    return undefined;
};
var deleteUser = function (jsonPath, username) {
    var _a;
    var data = getData(jsonPath);
    if (data && username) {
        if (data === null || data === void 0 ? void 0 : data.users) {
            for (var i = 0; i < ((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length); ++i) {
                if (data.users[i].username === username) {
                    data.users.splice(i, 1); // remove current object
                    updateDatabase(jsonPath, data);
                    return undefined;
                }
            }
        }
    }
    return undefined;
};
var showServices = function (jsonPath, username) {
    var _a, _b;
    var users = getUsers(jsonPath);
    if (!users) {
        console.log("No users to show");
        return undefined;
    }
    for (var i = 0; i < users.length; ++i) {
        if (((_a = users[i]) === null || _a === void 0 ? void 0 : _a.username) === username) {
            // show services for this username
            if ((_b = users[i].services) === null || _b === void 0 ? void 0 : _b.length) {
                console.log("SERVICES:");
                for (var j in users[i].services) {
                    console.log("  " + (+j + 1) + " - " + users[i].services[j].name);
                }
            }
            return undefined;
        }
    }
    console.log("User \"" + username + "\" not found");
    return undefined;
};
var createService = function (jsonPath, userData) {
    var _a;
    var data = getData(jsonPath);
    if (data && (userData === null || userData === void 0 ? void 0 : userData.username) && (userData === null || userData === void 0 ? void 0 : userData.serviceName)) {
        var user = void 0;
        var userIndex = 0;
        if (data === null || data === void 0 ? void 0 : data.users) {
            for (var i = 0; i < ((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length); ++i) {
                if (data.users[i].username === (userData === null || userData === void 0 ? void 0 : userData.username)) {
                    user = data.users[i];
                    userIndex = i;
                    break;
                }
            }
            if (!(user === null || user === void 0 ? void 0 : user.username)) {
                console.log("Username \"" + (userData === null || userData === void 0 ? void 0 : userData.username) + "\" not found.");
                return undefined;
            }
            if (!(user === null || user === void 0 ? void 0 : user.services)) {
                user.services = [];
            }
            // TODO: check if service already exists
            for (var j in data.users[userIndex].services) {
                if (data.users[userIndex].services[j].name === userData.serviceName) {
                    console.log("\nService \"" + userData.serviceName + "\" already exists");
                    return undefined;
                }
            }
            user.services.push({ name: userData.serviceName, ids: [] });
            data.users[userIndex] = user;
            updateDatabase(jsonPath, data);
        }
    }
    return undefined;
};
var deleteService = function (jsonPath, userData) {
    var _a, _b;
    var data = getData(jsonPath);
    if (data && (userData === null || userData === void 0 ? void 0 : userData.username) && (userData === null || userData === void 0 ? void 0 : userData.serviceName)) {
        if (data === null || data === void 0 ? void 0 : data.users) {
            for (var i = 0; i < ((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length); ++i) {
                if (data.users[i].username === userData.username) {
                    for (var j = 0; j < ((_b = data.users[i]) === null || _b === void 0 ? void 0 : _b.services.length); ++j) {
                        if (data.users[i].services[j].name === (userData === null || userData === void 0 ? void 0 : userData.serviceName)) {
                            data.users[i].services.splice(j, 1); // remove current object (service)
                            updateDatabase(jsonPath, data);
                            return undefined;
                        }
                    }
                }
            }
        }
    }
    return undefined;
};
var showIds = function (jsonPath, username, serviceName) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var users = getUsers(jsonPath);
    if (!users) {
        console.log("No users to show");
        return undefined;
    }
    for (var i = 0; i < users.length; ++i) {
        if (((_a = users[i]) === null || _a === void 0 ? void 0 : _a.username) === username) {
            if ((_b = users[i].services) === null || _b === void 0 ? void 0 : _b.length) {
                for (var j in users[i].services) {
                    if (((_c = users[i].services[j]) === null || _c === void 0 ? void 0 : _c.name) === serviceName) {
                        if ((_e = (_d = users[i].services[j]) === null || _d === void 0 ? void 0 : _d.ids) === null || _e === void 0 ? void 0 : _e.length) {
                            console.log("IDS:");
                            for (var k in users[i].services[j].ids) {
                                console.log("  " + (+k + 1) + " - " + ((_f = users[i].services[j].ids[k]) === null || _f === void 0 ? void 0 : _f.id));
                                if ((_g = users[i].services[j].ids[k]) === null || _g === void 0 ? void 0 : _g.description) {
                                    console.log((_h = users[i].services[j].ids[k]) === null || _h === void 0 ? void 0 : _h.description);
                                }
                                console.log(""); // line break
                            }
                        }
                    }
                }
            }
        }
    }
    return undefined;
};
var createId = function (jsonPath, userData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var data = getData(jsonPath);
    if (data && (userData === null || userData === void 0 ? void 0 : userData.username) && (userData === null || userData === void 0 ? void 0 : userData.serviceName) && (userData === null || userData === void 0 ? void 0 : userData.idName)) {
        var userIndex = 0;
        var servicesIndex = 0;
        // check if userData.ids has the mandatory values
        if (!(userData === null || userData === void 0 ? void 0 : userData.idName) || !((_a = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _a === void 0 ? void 0 : _a.password)) {
            console.log("Missing --id-name and/or --id-password arguments");
        }
        if (data === null || data === void 0 ? void 0 : data.users) {
            for (var i = 0; i < ((_b = data === null || data === void 0 ? void 0 : data.users) === null || _b === void 0 ? void 0 : _b.length); ++i) {
                if (data.users[i].username === (userData === null || userData === void 0 ? void 0 : userData.username)) {
                    userIndex = i;
                    for (var j = 0; j < ((_d = (_c = data.users[i]) === null || _c === void 0 ? void 0 : _c.services) === null || _d === void 0 ? void 0 : _d.length); ++j) {
                        if (data.users[i].services[j].name === (userData === null || userData === void 0 ? void 0 : userData.serviceName)) {
                            servicesIndex = j;
                            // check if optional ids exists
                            var aux = {};
                            // You can make this checks shorter by looping trought userData.ids keys 
                            if (userData === null || userData === void 0 ? void 0 : userData.idName) {
                                aux.id = userData === null || userData === void 0 ? void 0 : userData.idName;
                            }
                            if ((_e = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _e === void 0 ? void 0 : _e.eu) {
                                aux.eu = (_f = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _f === void 0 ? void 0 : _f.eu;
                            }
                            if ((_g = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _g === void 0 ? void 0 : _g.password) {
                                aux.password = userData.ids.password;
                            }
                            if ((_h = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _h === void 0 ? void 0 : _h.email) {
                                aux.email = userData.ids.email;
                            }
                            if ((_j = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _j === void 0 ? void 0 : _j.username) {
                                aux.username = userData.ids.username;
                            }
                            if ((_k = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _k === void 0 ? void 0 : _k.description) {
                                aux.description = userData.ids.description;
                            }
                            // check if already exists the idName in the database to avoid create duplicates
                            for (var k in data.users[i].services[j].ids) {
                                if (data.users[i].services[j].ids[k].id === userData.idName) {
                                    console.log("\nId \"" + userData.idName + "\" already exists");
                                    return undefined;
                                }
                            }
                            data.users[i].services[j].ids.push(aux);
                            updateDatabase(jsonPath, data);
                            return undefined;
                        }
                    }
                    break;
                }
            }
        }
    }
    return undefined;
};
var deleteId = function (jsonPath, userData) {
    var _a, _b, _c, _d;
    var data = getData(jsonPath);
    if (data && (userData === null || userData === void 0 ? void 0 : userData.username) && (userData === null || userData === void 0 ? void 0 : userData.serviceName) && (userData === null || userData === void 0 ? void 0 : userData.idName)) {
        if (data === null || data === void 0 ? void 0 : data.users) {
            for (var i = 0; i < ((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length); ++i) {
                if (data.users[i].username === userData.username) {
                    for (var j = 0; j < ((_c = (_b = data.users[i]) === null || _b === void 0 ? void 0 : _b.services) === null || _c === void 0 ? void 0 : _c.length); ++j) {
                        if (data.users[i].services[j].name === (userData === null || userData === void 0 ? void 0 : userData.serviceName)) {
                            for (var k = 0; k < ((_d = data.users[i].services[k]) === null || _d === void 0 ? void 0 : _d.ids.length); ++k) {
                                if (data.users[i].services[j].ids[k].id === (userData === null || userData === void 0 ? void 0 : userData.idName)) {
                                    data.users[i].services[j].ids.splice(k, 1);
                                    updateDatabase(jsonPath, data);
                                    return undefined;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return undefined;
};
var showIdFields = function (jsonPath, userData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var users = getUsers(jsonPath);
    if (!users) {
        console.log("No users to show");
        return undefined;
    }
    for (var i = 0; i < users.length; ++i) {
        if (((_a = users[i]) === null || _a === void 0 ? void 0 : _a.username) === (userData === null || userData === void 0 ? void 0 : userData.username)) {
            if ((_b = users[i].services) === null || _b === void 0 ? void 0 : _b.length) {
                for (var j in users[i].services) {
                    if (((_c = users[i].services[j]) === null || _c === void 0 ? void 0 : _c.name) === (userData === null || userData === void 0 ? void 0 : userData.serviceName)) {
                        if ((_e = (_d = users[i].services[j]) === null || _d === void 0 ? void 0 : _d.ids) === null || _e === void 0 ? void 0 : _e.length) {
                            for (var k in users[i].services[j].ids) {
                                if (users[i].services[j].ids[k].id === (userData === null || userData === void 0 ? void 0 : userData.idName)) {
                                    var current = users[i].services[j].ids[k];
                                    var aux = {};
                                    if ((userData === null || userData === void 0 ? void 0 : userData.idName) || ((_f = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _f === void 0 ? void 0 : _f.all)) {
                                        if (current === null || current === void 0 ? void 0 : current.id) {
                                            console.log("id: " + current.id);
                                        }
                                        else {
                                            // console.log("id not found");
                                        }
                                    }
                                    if (((_g = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _g === void 0 ? void 0 : _g.eu) || ((_h = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _h === void 0 ? void 0 : _h.all)) {
                                        if (current === null || current === void 0 ? void 0 : current.eu) {
                                            console.log("eu: " + current.eu);
                                        }
                                        else {
                                            // console.log("eu not found");
                                        }
                                    }
                                    if (((_j = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _j === void 0 ? void 0 : _j.password) || ((_k = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _k === void 0 ? void 0 : _k.all)) {
                                        if (current === null || current === void 0 ? void 0 : current.password) {
                                            console.log("password: " + current.password);
                                        }
                                        else {
                                            // console.log("password not found");
                                        }
                                    }
                                    if (((_l = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _l === void 0 ? void 0 : _l.email) || ((_m = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _m === void 0 ? void 0 : _m.all)) {
                                        if (current === null || current === void 0 ? void 0 : current.email) {
                                            console.log("email: " + current.email);
                                        }
                                        else {
                                            // console.log("email not found");
                                        }
                                    }
                                    if (((_o = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _o === void 0 ? void 0 : _o.username) || ((_p = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _p === void 0 ? void 0 : _p.all)) {
                                        if (current === null || current === void 0 ? void 0 : current.username) {
                                            console.log("username: " + current.username);
                                        }
                                        else {
                                            // console.log("username not found");
                                        }
                                    }
                                    if (((_q = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _q === void 0 ? void 0 : _q.description) || ((_r = userData === null || userData === void 0 ? void 0 : userData.ids) === null || _r === void 0 ? void 0 : _r.all)) {
                                        if (current === null || current === void 0 ? void 0 : current.description) {
                                            console.log("description: " + current.description);
                                        }
                                        else {
                                            // console.log("description not found");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return undefined;
};
var setMasterKey = function (jsonPath, key) {
    var data = getData(jsonPath);
    if (!data) {
        return undefined;
    }
    data.masterKey = key;
    // @ts-ignore
    data.config.useMasterKey = true;
    // cipher the expected test
    // set the cipher text result into masterTestKey
    updateDatabase(jsonPath, data);
    return undefined;
};
/*
const db = {
  users: [{
    username: "stringmanolo",
    key: "qwe",
    services: [{
      name: "gmail",
      ids: [{
        id: "main account",
        eu: "stringmanolo@gmail.com",
        password: "12345678",
        description: "This is the password for my personal gmail account"
      }]
    }]
  }],
  masterKey: "qwerty",
  masterTestKey: "uwjwhsusjwjs",
  expectedTest: "hello",

  config: {
    useMasterKey: true,
    userPerUserKey: false
  }
}
*/
var parseArguments = function () {
    var _a, _b, _c, _d, _e;
    var cli = {};
    for (var i = 0; i < process.argv.length; ++i) {
        var current = process.argv[i];
        var next = process.argv[+i + 1];
        switch (current) {
            case "setMasterKey":
            case "setmasterkey":
            case "set-master-key":
                cli.setMasterKey = true;
                cli.userData = {};
                break;
            case "getUsers":
            case "getusers":
            case "get-users":
            case "get_users":
            case "get":
            case "Get":
            case "g":
            case "u":
            case "-u":
            case "--users":
            case "--get-users":
                cli.getUsers = true;
                break;
            case "createUser":
            case "createuser":
            case "create-user":
            case "create_user":
            case "create":
            case "Create":
            case "c":
            case "-c":
            case "--create":
            case "--create-user":
                cli.createUser = next;
                cli.userData = {};
                break;
            case "deleteUser":
            case "deleteuser":
            case "delete-user":
            case "delete_user":
            case "delete":
            case "Delete":
            case "d":
            case "-d":
            case "--delete":
            case "--delete-user":
                cli.deleteUser = next;
                cli.userData = {};
                break;
            case "getServices":
            case "getservices":
            case "get-services":
            case "get_services":
            case "s":
            case "-s":
            case "--services":
            case "--get-services":
                cli.getServices = true;
                cli.userData = {};
                break;
            case "createService":
            case "createservice":
            case "create-service":
            case "create_service":
            case "--create-service":
                cli.createService = next;
                cli.userData = {};
                break;
            case "deleteService":
            case "deleteservice":
            case "delete-service":
            case "delete_service":
            case "--delete-service":
                cli.deleteService = next;
                cli.userData = {};
                break;
            case "getIds":
            case "getIDs":
            case "get-ids":
            case "get_ids":
            case "--ids":
            case "--get-ids":
                cli.getIds = true;
                cli.userData = {};
                break;
            case "createId":
            case "createid":
            case "createID":
            case "create-id":
            case "create_id":
            case "--create-id":
                cli.createId = next;
                cli.userData = {};
                // @ts-ignore
                cli.userData.ids = {};
                break;
            case "deleteId":
            case "deleteid":
            case "delete-id":
            case "delete_id":
            case "--delete-id":
                cli.deleteId = next;
                cli.userData = {};
                break;
            case "getField":
            case "getFields":
            case "getfield":
            case "getfields":
            case "get-field":
            case "get-fields":
            case "get_field":
            case "get_fields":
            case "--get-field":
            case "--get-fields":
            case "getIdField":
            case "getIdFields":
                cli.getFields = true;
                cli.userData = {};
                // @ts-ignore
                cli.userData.ids = {};
                break;
            case "username":
            case "--username":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.username = next;
                }
                break;
            case "--service":
            case "serviceName":
            case "--serviceName":
            case "--service-name":
            case "--service_name":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.serviceName = next;
                }
                break;
            case "id":
            case "idName":
            case "--id":
            case "--idName":
            case "--id-name":
            case "--id_name":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.idName = next;
                }
                break;
            case "--id-email":
            case "--email":
                if ((_a = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _a === void 0 ? void 0 : _a.ids) {
                    cli.userData.ids.email = next;
                }
                break;
            case "--id-username":
            case "--account":
                if ((_b = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _b === void 0 ? void 0 : _b.ids) {
                    cli.userData.ids.username = next;
                }
                break;
            case "--id-password":
            case "--password":
                if ((_c = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _c === void 0 ? void 0 : _c.ids) {
                    cli.userData.ids.password = next;
                }
                break;
            case "--id-description":
            case "--description":
                if ((_d = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _d === void 0 ? void 0 : _d.ids) {
                    cli.userData.ids.description = next;
                }
                break;
            case "--id-all":
            case "--all":
                if ((_e = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _e === void 0 ? void 0 : _e.ids) {
                    cli.userData.ids.all = true;
                }
                break;
            case "key":
            case "--key":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.key = next;
                }
                break;
            // case "interactive input: ? maybe
            case "h":
            case "help":
            case "Help":
            case "-h":
            case "--help":
                console.log("Help Men\u00FA:\n\n  KEY\nsetMasterKey      Key to access the database\n\t\t    \n  USER\ngetUsers          Show all the users\ncreateUser        Create new users\ndeleteUser        Delete a user\n\n  SERVICE\ngetServices       Show all the services for a user\ncreateService     Create a new service for a user\ndeleteService     Delete a service from a user\n\n  ID\ngetIds            Show all the ids from a user's service\ncreateId          Create new id for a service\ndeleteId          Delete an id from a user's service\n\n  FIELD\ngetFields         Show selected fields from an id\n\n...\n...\n...\n\n\nUsage:\n  pm [mainAction] [--mandatory-argument value] {--optional-argument value}\n\n\nmainAction list:\n\nsetMasterKey\ngetUsers\ncreateUser\ndeleteUser\ngetServices \ncreateService\ndeleteService\ngetIds\ncreateId\ndeleteId\ngetFields\n\n\narguments list\n--key\n--username\n--service-name\n--id-name\n--id-email\n--id-username\n--id-password\n--id-description\n--id-all\n\n\nAvailable arguments for each action:\nsetMasterKey --key abc123\n\ngetUsers\n\ncreateUser --username StringManolo\n\ndeleteUser --username StringManolo\n\ngetServices --username StringManolo\n\ncreateService --username StringManolo --service-name gmail\n\ndeleteService --username StringManolo --service-name gmail\n\ngetIds --username StringManolo --service-name gmail \n\ncreateId --username StringManolo --service-name gmail --id-name 'dev account' --id-email 'stringmanolo@gmail.com' --id-password 'abc123456' --id-description 'Gmail account for development'\n\ndeleteId --username StringManolo --service-name gmail --id-name 'dev account'\n\ngetFields --username StringManolo --service-name gmail --id-name 'dev account' --id-password true\n\n\nRemember to use single quotes ' for values that have spaces or may end or modify the shell input like: createUser --username 'My Name Is ;Jhon' \n\n");
                process.exit();
        }
    }
    return cli;
};
/* PROGRAM CONFIG */
// Check if program running in Termux
var foundTermux = function () {
    if (/termux/gi.test(run("echo \"$PREFIX\""))) {
        return true;
    }
    return false;
};
var PATH = foundTermux() ? "/data/data/com.termux/files/usr/bin" : "/bin";
var PROGRAM_FOLDER_PATH = PATH + "/.password-manager";
var JSON_PATH = PROGRAM_FOLDER_PATH + "/pm.json";
/* PROGRAM INSTRUCTIONS */
createProgramFolder(PROGRAM_FOLDER_PATH); // create folder structure
createDatabase(JSON_PATH); // create json file (database)
var cli = parseArguments(); // parse arguments from cli
// TODO: ask for masterkey before decrypting
if ((cli === null || cli === void 0 ? void 0 : cli.setMasterKey) && ((_a = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _a === void 0 ? void 0 : _a.key)) {
    setMasterKey(JSON_PATH, cli.userData.key);
}
else if (cli === null || cli === void 0 ? void 0 : cli.getUsers) {
    showUsers(JSON_PATH);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.createUser) && cli.userData) {
    createUser(JSON_PATH, cli.userData);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.deleteUser) && ((_b = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _b === void 0 ? void 0 : _b.username)) {
    deleteUser(JSON_PATH, cli.userData.username);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.getServices) && ((_c = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _c === void 0 ? void 0 : _c.username)) {
    showServices(JSON_PATH, cli.userData.username);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.createService) && (cli === null || cli === void 0 ? void 0 : cli.userData)) {
    createService(JSON_PATH, cli.userData);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.deleteService) && ((_d = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _d === void 0 ? void 0 : _d.username) && ((_e = cli.userData) === null || _e === void 0 ? void 0 : _e.serviceName)) {
    deleteService(JSON_PATH, cli.userData);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.getIds) && ((_f = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _f === void 0 ? void 0 : _f.username) && ((_g = cli.userData) === null || _g === void 0 ? void 0 : _g.serviceName)) {
    showIds(JSON_PATH, cli.userData.username, cli.userData.serviceName);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.createId) && ((_h = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _h === void 0 ? void 0 : _h.username) && ((_j = cli.userData) === null || _j === void 0 ? void 0 : _j.serviceName) && ((_k = cli.userData) === null || _k === void 0 ? void 0 : _k.idName)) {
    createId(JSON_PATH, cli.userData);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.deleteId) && ((_l = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _l === void 0 ? void 0 : _l.username) && ((_m = cli.userData) === null || _m === void 0 ? void 0 : _m.serviceName) && ((_o = cli.userData) === null || _o === void 0 ? void 0 : _o.idName)) {
    deleteId(JSON_PATH, cli.userData);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.getFields) && ((_p = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _p === void 0 ? void 0 : _p.username) && ((_q = cli.userData) === null || _q === void 0 ? void 0 : _q.serviceName) && ((_r = cli.userData) === null || _r === void 0 ? void 0 : _r.idName)) {
    showIdFields(JSON_PATH, cli.userData);
}
else {
    // detect what command is used
    // showUsage(commandName);
}
