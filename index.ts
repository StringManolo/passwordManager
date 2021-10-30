// @ts-ignore
import * as crypto from "crypto";
import * as fs from "fs";
import * as exec from "child_process";

interface fileDescriptor {
  internalFd: number,
  read(buffer: Buffer, position: number, len: number): number,
  puts(str: string): number,
  close(): void
}

const open = (filename: string, mode: string) => {
  const fd: fileDescriptor = {} as any;
  fd.internalFd = fs.openSync(filename, mode);
  fd.read = (buffer, position, len) => fs.readSync(fd.internalFd, buffer, position, len, null);
  fd.puts = (str) => fs.writeSync(fd.internalFd, str);
  fd.close = () => fs.closeSync(fd.internalFd);
  return fd;
}

const output = (text: string) => {
  const fd = open("/dev/stdout", "w");
  fd.puts(text);
  fd.close();
}

const input = (): string => {
  let rtnval = "";
  let buffer = Buffer.alloc ? Buffer.alloc(1) : new Buffer(1);
  for(;;) {
    fs.readSync(0, buffer, 0, 1, null);
    if(buffer[0] === 10) {
      break;
    } else if(buffer[0] !== 13) {
      rtnval += new String(buffer);
    }
  }
  return rtnval;
}

const ask = (question: string): string => {
  output(question);
  return input();
}


const loadFile = (filename: string): string | null => {
  let retValue: string | null;
  try {
    retValue = fs.readFileSync(filename, { encoding: "utf-8" })
  } catch(e) {
    retValue = null;
  }
  return retValue;
};

const createFile = (filename: string, data: string) => {
  if (!fs.existsSync(filename)) {
    const fd = open(filename, "w");
    fd.puts(data);
    fd.close();
  }
}

const createFileOverwrite = (filename: string, data: string) => {
  const fd = open(filename, "w");
  fd.puts(data);
  fd.close();
}

const run = (args: string): string => {
  let res = exec.execSync(args).toString()
  return res;
};

const outputUsers = (users: string[]): string => {
  let retVal = "";
  for (let i = 0; i < users.length; ++i) {
    retVal += `  ${i + 1} - ${users[i]}\n`;
  }
  return retVal;
}

const foundTermux = (): true | false => {
  if (/termux/gi.test(run(`echo "$PREFIX"`))) {
    return true;
  }
  return false;
}

/*
const getServicesListFromUser = (user: string) => {
  if(runningInTermux) {
     
  }
}
*/

const createProgramFolder = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const removeDuplicates = (arr: string[]): string[] => {
  return Array.from(new Set(arr));
}

const createUser = () => {
  const username = ask("Write desired username\n-> ");
  const usersList = loadFile(`${path}/users_list.json`);
  let list = [];
  if (!usersList) {
    list = [ "abc" ];
  } else {
    list = JSON.parse(usersList);
  }

  list.push(username);
  createFileOverwrite(`${path}/users_list.json`, JSON.stringify(list));
}

const DEBUG = true;
const _debug = (text: string) => {
  if (DEBUG) {
    console.log(text);
  }
}




/* Program */
console.log(`StringManolo Password Manager\n`);


const runningInTermux = foundTermux(); // Check if system is running Termux (to patch filesystem)

_debug(`Running in Termux? (${runningInTermux})`);
let path = "";
if (runningInTermux) {
  path = "/data/data/com.termux/files/usr/bin/.smpm";
} else {
  path = "/bin/.smpm";
}

_debug(`Creating ${path} folder...`);
createProgramFolder(path);

let users = [];
try {
  let _users = loadFile(`${path}/users_list.json`);
  if (!_users) {
    
  } else {
    users = JSON.parse(_users);
  }
} catch(e) {

}

_debug(`Creating ${path}/users_list.json file`);
createFile(`${path}/users_list.json`, JSON.stringify(users));

const selectedUser = +ask(`Select User 

Available Users:
${outputUsers(users)}

  0 - Create New User

-> `);

let userExists = false;
if (selectedUser === 0) {
  console.log("Creating new user...");
  createUser();
} else {
  for (let i = 0; i < users.length; ++i) {
    if (selectedUser === (i + 1)) {
      console.log("Accessing " + users[i] + " services list");
      userExists = true;
      // getServicesListFromUser(`pw_${users[i]}`);
      break;
    }
  }
  if (!userExists) {
    console.log(`No user for ${selectedUser}. Plese select a valid choice`);
  }
}


  
