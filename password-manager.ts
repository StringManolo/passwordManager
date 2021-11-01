// Show Users || Create Users || Delete Users

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
import * as fs from "fs";
import * as exec from "child_process";



/* TYPESCRIPT INTERFACES */
interface DATABASE_USERS_SERVICES_IDS {
  [index: number]: {
    id: string,
    eu: string, // email/username
    password: string,
    description: string
  }
}

interface DATABASE_USERS_SERVICES {
  [index: number]: {
    name: string,
    ids: DATABASE_USERS_SERVICES_IDS[]
  }
}

interface DATABASE_USERS {
  [index: number]: {
    username: string,
    key?: string,
    services: DATABASE_USERS_SERVICES[]
  }
}

interface DATABASE_CONFIG {
  useMasterKey: boolean,
  usePerUserKey: boolean
}

interface DATABASE {
  users?: DATABASE_USERS[],

  masterKey?: string,
  masterTestKey?: string,
  expectedTest?: string,

  config?: DATABASE_CONFIG
}

interface INPUTUSERDATA {
  username: string,
  key?: string
}



interface CLI {
  getUsers?: true | false,
  createUser?: string,
  userData?: INPUTUSERDATA
}


interface FILEDESCRIPTOR {
  internalFd: number,
  read(buffer: Buffer, position: number, len: number): number,
  puts(str: string): number,
  close(): void
}



/* UTILS FUNCTIONS */
const run = (args: string): string => {
  let res = exec.execSync(args).toString()
  return res;
};


const createProgramFolder = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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


const open = (filename: string, mode: string) => {
  const fd: FILEDESCRIPTOR = {} as any;
  fd.internalFd = fs.openSync(filename, mode);
  fd.read = (buffer, position, len) => fs.readSync(fd.internalFd, buffer, position, len, null);
  fd.puts = (str) => fs.writeSync(fd.internalFd, str);
  fd.close = () => fs.closeSync(fd.internalFd);
  return fd;
}


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



/* PROGRAM FUNCTIONS */
const createDatabase = (dbPath: string) => {
  if (!fs.existsSync(dbPath)) {
    const db: DATABASE = {
      users: [],
      masterKey: "",
      masterTestKey: "jdjdusjdjddj",
      expectedTest: "key is fine",
      config: {
        useMasterKey: false,
        usePerUserKey: false
      }
    }
    createFile(dbPath, JSON.stringify(db, null, 2));
  }
}


const updateDatabase = (dbPath: string, db: DATABASE) => {
  if (fs.existsSync(dbPath)) {
    createFileOverwrite(dbPath, JSON.stringify(db, null, 2)); 
  } else {
    createDatabase(dbPath);
    updateDatabase(dbPath, db); // try again after create the database
  }
}

// get the program data as json from filesystem
const getData = (jsonPath: string): null | DATABASE => {
  const data: string | null = loadFile(jsonPath);
  let jsonData: DATABASE = {} as any;
  if (data) {
    try {
      jsonData = JSON.parse(data);
    } catch(error) {
      return null
    }
  } else {
    return null;
  }

  if (!data) {
    return null;
  }

  return jsonData;
}


const getUsers = (jsonPath: string) => {
  const data = getData(jsonPath);
  if (!data?.users?.length) {
    return null;
  } else {
    return data.users;
  }
}


const showUsers = (jsonPath: string) => {
  const users = getUsers(jsonPath);
  if (!users) {
    console.log("Not users to show");
    process.exit();
  }

  console.log("USERS:");
  for (let i = 0; i < users.length; ++i) {
    console.log(`  ${i + 1} - ${(<any>users[i]).username}`); // https://stackoverflow.com/questions/69791780/property-username-does-not-exist-on-type-database-users
  }
  console.log("\n");
}


const createUser = (jsonPath: string, userData: INPUTUSERDATA) => {
  const data = getData(jsonPath);
  if (data && userData?.username) {
    const user = {} as any;
    user.username = userData.username;
    if (userData.key) {
      user.key = userData.key;
    }
    user.services = [];

    // check if user already exists
    if (data?.users) {
      for (let i = 0; i < data?.users?.length; ++i) {
        if ( (<any>data.users[i]).username === user.username) {
	  console.log(`Found User ${ (<any>data.users[i]).username}`);
          return undefined; 
	}
      }
    }
    data?.users?.push(user);
    updateDatabase(jsonPath, data);
  }
  return undefined;
}

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


const parseArguments = (): CLI => {
  const cli: CLI = {} as any;
  for (let i = 0; i < process.argv.length; ++i) {
    const current = process.argv[i];
    const next = process.argv[+i + 1];
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
        cli.userData = {} as any;
      break;

      case "username":
      case "--username":
        if (cli?.userData) {
          cli.userData.username = next;
	}
      break;

      case "key":
      case "--key":
        if (cli?.userData) {
          cli.userData.key = next;
        }
      break;
      // case "interactive input: ? maybe

      case "h":
      case "help":
      case "Help":
      case "-h":
      case "--help":
        console.log(`Help Menú:

getUsers          Show all the users
createUser        Create new users
...
...
...
...
`);
        process.exit(); 
    }
  }
  return cli;
}




/* PROGRAM CONFIG */
// Check if program running in Termux
const foundTermux = (): true | false => {
  if (/termux/gi.test(run(`echo "$PREFIX"`))) {
    return true;
  }
  return false;
}

const PATH = foundTermux() ? "/data/data/com.termux/files/usr/bin" : "/bin";
const PROGRAM_FOLDER_PATH = `${PATH}/.password-manager`;
const JSON_PATH = `${PROGRAM_FOLDER_PATH}/pm.json`;





/* PROGRAM INSTRUCTIONS */
createProgramFolder(PROGRAM_FOLDER_PATH); // create folder structure
createDatabase(JSON_PATH); // create json file (database)
const cli = parseArguments(); // parse arguments from cli

// TODO: ask for masterkey before decrypting

if (cli.getUsers) {
  showUsers(JSON_PATH);
} else if (cli.createUser && cli.userData) {
  createUser(JSON_PATH, cli.userData);
} else {
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
