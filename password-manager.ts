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
interface DatabaseUsersServicesIds {
  id: string,
  eu: string, // email/username
  password: string,
  description: string
}

interface DatabaseUsersServices {
  name: string,
  ids: DatabaseUsersServicesIds[]
}

interface DatabaseUsers {
  username: string,
  key?: string,
  services: DatabaseUsersServices[]
}

interface DatabaseConfig {
  useMasterKey: boolean,
  usePerUserKey: boolean
}

interface Database {
  users?: DatabaseUsers[],

  masterKey?: string,
  masterTestKey?: string,
  expectedTest?: string,

  config?: DatabaseConfig
}

interface Ids {
  id?: string,
  eu?: string,
  email?: string,
  username?: string,
  password?: string,
  description?: string
}

interface InputUserData {
  username: string,
  key?: string,
  serviceName?: string,
  idName?: string,
  createId?: string,
  ids?: Ids
}

interface Cli {
  getUsers?: true | false,
  createUser?: string,
  deleteUser?: string,
  getServices?: true | false,
  createService?: string,
  deleteService?: string,
  createId?: string,
  userData?: InputUserData
}

interface FileDescriptor {
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
  const fd: FileDescriptor = {} as any;
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
    const db: Database = {
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


const updateDatabase = (dbPath: string, db: Database) => {
  if (fs.existsSync(dbPath)) {
    createFileOverwrite(dbPath, JSON.stringify(db, null, 2)); 
  } else {
    createDatabase(dbPath);
    updateDatabase(dbPath, db); // try again after create the database
  }
}

// get the program data as json from filesystem
const getData = (jsonPath: string): null | Database => {
  const data: string | null = loadFile(jsonPath);
  let jsonData: Database = {} as any;
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
    return undefined;
  }

  console.log("USERS:");
  for (let i = 0; i < users.length; ++i) {
    console.log(`  ${i + 1} - ${users[i].username}`);
  }
  console.log("\n");
  return undefined;
}


const createUser = (jsonPath: string, userData: InputUserData) => {
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
        if (data.users[i].username === user.username) {
          return undefined; 
	}
      }
    }
    data?.users?.push(user);
    updateDatabase(jsonPath, data);
  }
  return undefined;
}


const deleteUser = (jsonPath: string, username: string) => {
  const data = getData(jsonPath);
  if (data && username) {
    if (data?.users) {
      for (let i = 0; i < data?.users?.length; ++i) {
        if (data.users[i].username === username) {
          data.users.splice(i, 1); // remove current object
	  updateDatabase(jsonPath, data);
	  return undefined;
	}
      }
    }
  }
  return undefined;
}

const showServices = (jsonPath: string, username: string) => {
  const users = getUsers(jsonPath);
  if (!users) {
    console.log("Not users to show");
    return undefined;
  }

  for (let i = 0; i < users.length; ++i) {
    if (users[i]?.username === username) {
      // show services for this username
      if (users[i].services?.length) {
        console.log("SERVICES:");
        for (let j in users[i].services) {
          console.log(`  ${j + 1} - ${users[i].services[j].name}`);
	}
      }
      return undefined;
    }
  }
  console.log(`User "${username}" not found`);
  return undefined;
}

const createService = (jsonPath: string, userData: InputUserData) => {
  const data = getData(jsonPath);
  if (data && userData?.username && userData?.serviceName) {
    let user;
    let userIndex = 0;
    if (data?.users) {
      for (let i = 0; i < data?.users?.length; ++i) {
        if (data.users[i].username === userData?.username) {
          user = data.users[i];
	  userIndex = i;
	  break;
	}
      }
      if (!user?.username) {
        console.log(`Username "${userData?.username}" not found.`);
	return undefined;
      }
      
      if (!user?.services) {
        user.services = [];
      }
      // TODO: check if service already exists
      user.services.push({ name: userData.serviceName, ids: [] });
      data.users[userIndex] = user;
      updateDatabase(jsonPath, data);
    }
  } 
  return undefined;
}

const deleteService = (jsonPath: string, userData: InputUserData) => {
  const data = getData(jsonPath);
  if (data && userData?.username && userData?.serviceName) {
    if (data?.users) {
      for (let i = 0; i < data?.users?.length; ++i) {
        if (data.users[i].username === userData.username) {
          for (let j = 0; j < data.users[i]?.services.length; ++j) {
            if (data.users[i].services[j].name === userData?.serviceName) {
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
}

const createId = (jsonPath: string, userData: InputUserData) => {
  const data = getData(jsonPath);
  if (data && userData?.username && userData?.serviceName && userData?.idName) {
    let userIndex = 0;
    let servicesIndex = 0;

    // check if userData.ids has the mandatory values
    if (!userData?.idName || !userData?.ids?.password) {
      console.log("Missing --id-name and/or --id-password arguments");
    }

    if (data?.users) {
      for (let i = 0; i < data?.users?.length; ++i) {
        if (data.users[i].username === userData?.username) {
	  userIndex = i;
	  for (let j = 0; j < data.users[i]?.services?.length; ++j) {
            if (data.users[i].services[j].name === userData?.serviceName) {
	      servicesIndex = j;
	      // check if optional ids exists
	      let aux = {} as any;

	      if (userData?.idName) {
                aux.id = userData?.idName;
	      }

	      if (userData?.ids?.eu) {
                aux.eu = userData?.ids?.eu;
	      }

	      if (userData?.ids?.password) {
                aux.password = userData.ids.password;
	      }

	      if (userData?.ids?.description) {
                aux.description = userData.ids.description;
	      }

              // check if already exists the idName in the database to avoid create duplicates
	      for (let k in data.users[i].services[j].ids) {
                if (data.users[i].services[j].ids[k].id === userData.idName) {
                  console.log(`id "${userData.idName}" already exists in this service. Delete old one or change new id and try again`);
		  return undefined;
		}
	      }


              data.users[i].services[j].ids.push(aux);
	      updateDatabase(jsonPath, data);
	    }
	  }
	  break;
	}
      }

/*
      if (!user?.username) {
        console.log(`Username "${userData?.username}" not found.`);
	return undefined;
      }

      if (!user?.services) {
        console.log(`Service "${userData?.service}" not found.`);
      }
*/


    }

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


const parseArguments = (): Cli => {
  const cli: Cli = {} as any;
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
        cli.userData = {} as any;
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
        cli.userData = {} as any;
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
        cli.userData = {} as any;
      break;

      case "createService":
      case "createservice":
      case "create-service":
      case "create_service":
      case "--create-service":
        cli.createService = next;
        cli.userData = {} as any;
      break;

      case "deleteService":
      case "deleteservice":
      case "delete-service":
      case "delete_service":
      case "--delete-service":
        cli.deleteService = next;
        cli.userData = {} as any;
      break;

      case "createId":
      case "createid":
      case "createID":
      case "create-id":
      case "create_id":
      case "--create-id":
        cli.createId = next;
        cli.userData = {} as any;
	// @ts-ignore
	cli.userData.ids = {} as any;
      break;

      case "username":
      case "--username":
        if (cli?.userData) {
          cli.userData.username = next;
	}
      break;

      case "serviceName":
      case "--serviceName":
      case "--service-name":
      case "--service_name":
        if (cli?.userData) {
          cli.userData.serviceName = next;
        }
      break;

      case "id":
      case "idName":
      case "--id":
      case "--idName":
      case "--id-name":
      case "--id_name":
        if (cli?.userData) {
          cli.userData.idName = next;
        }
      break;


      case "--id-email":
        if (cli?.userData?.ids) {
          cli.userData.ids.email = next;
        }
      break;

      case "--id-username":
        if (cli?.userData?.ids) {
          cli.userData.ids.username = next;
        }
      break;

      case "--id-password":
        if (cli?.userData?.ids) {
          cli.userData.ids.password = next;
        }
      break;

      case "--id-description":
        if (cli?.userData?.ids) {
          cli.userData.ids.description = next;
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

  USER
getUsers          Show all the users
createUser        Create new users
deleteUser        Delete a user

  SERVICE
getServices       Show all the services for a user
createService     Create a new service for a user
deleteService     Delete a service from a user

  IDS
getId
createId          Create new id for a service
deleteId 
...
...
...


Examples of usage:

pm getUsers 
pm createUser --username StringManolo
pm createService --username StringManolo --service-name Gmail
pm getServices --username StringManolo
pm deleteService --username Stringmanolo --service-name Gmail
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
} else if (cli.deleteUser && cli?.userData?.username) {
  deleteUser(JSON_PATH, cli.userData.username);
} else if (cli.getServices && cli?.userData?.username) {
  showServices(JSON_PATH, cli.userData.username);
} else if (cli?.createService && cli?.userData) {
  createService(JSON_PATH, cli.userData);
} else if (cli?.deleteService && cli?.userData?.username && cli?.userData?.serviceName) {
  deleteService(JSON_PATH, cli.userData);
} else if (cli?.createId && cli?.userData?.username && cli?.userData?.serviceName && cli?.userData?.idName) {
  createId(JSON_PATH, cli.userData);
} else {
  //showUsage();
}



