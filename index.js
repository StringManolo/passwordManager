"use strict";
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
var fs = __importStar(require("fs"));
var exec = __importStar(require("child_process"));
var open = function (filename, mode) {
    var fd = {};
    fd.internalFd = fs.openSync(filename, mode);
    fd.read = function (buffer, position, len) { return fs.readSync(fd.internalFd, buffer, position, len, null); };
    fd.puts = function (str) { return fs.writeSync(fd.internalFd, str); };
    fd.close = function () { return fs.closeSync(fd.internalFd); };
    return fd;
};
var output = function (text) {
    var fd = open("/dev/stdout", "w");
    fd.puts(text);
    fd.close();
};
var input = function () {
    var rtnval = "";
    var buffer = Buffer.alloc ? Buffer.alloc(1) : new Buffer(1);
    for (;;) {
        fs.readSync(0, buffer, 0, 1, null);
        if (buffer[0] === 10) {
            break;
        }
        else if (buffer[0] !== 13) {
            rtnval += new String(buffer);
        }
    }
    return rtnval;
};
var ask = function (question) {
    output(question);
    return input();
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
var run = function (args) {
    var res = exec.execSync(args).toString();
    return res;
};
var outputUsers = function (users) {
    var retVal = "";
    for (var i = 0; i < users.length; ++i) {
        retVal += "  " + (i + 1) + " - " + users[i] + "\n";
    }
    return retVal;
};
var foundTermux = function () {
    if (/termux/gi.test(run("echo \"$PREFIX\""))) {
        return true;
    }
    return false;
};
/*
const getServicesListFromUser = (user: string) => {
  if(runningInTermux) {
     
  }
}
*/
var createProgramFolder = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
var removeDuplicates = function (arr) {
    return Array.from(new Set(arr));
};
var createUser = function () {
    var username = ask("Write desired username\n-> ");
    var usersList = loadFile(path + "/users_list.json");
    var list = [];
    if (!usersList) {
        list = ["abc"];
    }
    else {
        list = JSON.parse(usersList);
    }
    list.push(username);
    createFileOverwrite(path + "/users_list.json", JSON.stringify(list));
};
var DEBUG = true;
var _debug = function (text) {
    if (DEBUG) {
        console.log(text);
    }
};
/* Program */
console.log("StringManolo Password Manager\n");
var runningInTermux = foundTermux(); // Check if system is running Termux (to patch filesystem)
_debug("Running in Termux? (" + runningInTermux + ")");
var path = "";
if (runningInTermux) {
    path = "/data/data/com.termux/files/usr/bin/.smpm";
}
else {
    path = "/bin/.smpm";
}
_debug("Creating " + path + " folder...");
createProgramFolder(path);
var users = [];
try {
    var _users = loadFile(path + "/users_list.json");
    if (!_users) {
    }
    else {
        users = JSON.parse(_users);
    }
}
catch (e) {
}
_debug("Creating " + path + "/users_list.json file");
createFile(path + "/users_list.json", JSON.stringify(users));
var selectedUser = +ask("Select User \n\nAvailable Users:\n" + outputUsers(users) + "\n\n  0 - Create New User\n\n-> ");
var userExists = false;
if (selectedUser === 0) {
    console.log("Creating new user...");
    createUser();
}
else {
    for (var i = 0; i < users.length; ++i) {
        if (selectedUser === (i + 1)) {
            console.log("Accessing " + users[i] + " services list");
            userExists = true;
            // getServicesListFromUser(`pw_${users[i]}`);
            break;
        }
    }
    if (!userExists) {
        console.log("No user for " + selectedUser + ". Plese select a valid choice");
    }
}
