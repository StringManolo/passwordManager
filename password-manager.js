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
var _a, _b;
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
        return undefined;
    }
    console.log("USERS:");
    for (var i = 0; i < users.length; ++i) {
        console.log("  " + (i + 1) + " - " + users[i].username);
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
        console.log("Not users to show");
        return undefined;
    }
    for (var i = 0; i < users.length; ++i) {
        if (((_a = users[i]) === null || _a === void 0 ? void 0 : _a.username) === username) {
            // show services for this username
            if ((_b = users[i].services) === null || _b === void 0 ? void 0 : _b.length) {
                console.log("SERVICES:");
                for (var j in users[i].services) {
                    console.log("  " + (j + 1) + " - " + users[i].services[j].name);
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
            user.services.push({ name: userData.serviceName, ids: [] });
            data.users[userIndex] = user;
            updateDatabase(jsonPath, data);
            console.log("Database updated");
        }
    }
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
            case "username":
            case "--username":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.username = next;
                }
                break;
            case "serviceName":
            case "--serviceName":
                if (cli === null || cli === void 0 ? void 0 : cli.userData) {
                    cli.userData.serviceName = next;
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
// TODO: ask for masterkey before decrypting
if (cli.getUsers) {
    showUsers(JSON_PATH);
}
else if (cli.createUser && cli.userData) {
    createUser(JSON_PATH, cli.userData);
}
else if (cli.deleteUser && ((_a = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _a === void 0 ? void 0 : _a.username)) {
    deleteUser(JSON_PATH, cli.userData.username);
}
else if (cli.getServices && ((_b = cli === null || cli === void 0 ? void 0 : cli.userData) === null || _b === void 0 ? void 0 : _b.username)) {
    console.log("Showing Services");
    showServices(JSON_PATH, cli.userData.username);
}
else if ((cli === null || cli === void 0 ? void 0 : cli.createService) && (cli === null || cli === void 0 ? void 0 : cli.userData)) {
    console.log("Creating Service");
    createService(JSON_PATH, cli.userData);
}
else {
    //showUsage();
}
