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
Object.defineProperty(exports, "__esModule", { value: true });
// Show Services || Create Services || Delete Services
// Show ID || Create ID || Delete ID
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
        console.log("Not users to show");
        process.exit();
    }
    console.log("USERS:");
    for (var i = 0; i < users.length; ++i) {
        console.log("  " + (i + 1) + " - " + users[i].username); // https://stackoverflow.com/questions/69791780/property-username-does-not-exist-on-type-database-users
    }
    console.log("\n");
};
var createUser = function (jsonPath, userData) {
    var _a;
    var data = getData(jsonPath);
    if (data) {
        var user = {};
        user.username = userData.username;
        if (userData.key) {
            user.key = userData.key;
        }
        user.services = [];
        (_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.push(user);
        updateDatabase(jsonPath, data);
    }
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
        eu: "mvc@gmail.com",
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
    var cli = {};
    for (var i = 0; i < process.argv.length; ++i) {
        var current = process.argv[i];
        var next = process.argv[+i + 1];
        switch (current) {
            case "getUsers":
            case "getusers":
            case "get-users":
            case "get_users":
            case "get":
            case "Get":
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
            case "username":
            case "--username":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.username = next;
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
                console.log("Help Men\u00FA:\n\ngetUsers          Show all the users\ncreateUser        Create new users\n...\n...\n...\n...\n");
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
if (cli.getUsers) {
    showUsers(JSON_PATH);
}
else if (cli.createUser && cli.userData) {
    createUser(JSON_PATH, cli.userData);
}
else {
    //showUsage();
}
/* Json preview:
const db = {
  users: [{
    username: "stringmanolo",
    key: "qwe",
    services: [{
      name: "gmail",
      ids: [{
    id: "main account",
    eu: "mvc@gmail.com",
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
// console.log(JSON.stringify(db));
