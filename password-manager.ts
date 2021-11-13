// Show Users || Create Users || Delete Users

// Show Services || Create Services || Delete Services

// Show ID || Create ID || Delete ID

// Show ID Fields || Add ID Fields || Edit ID Field ||  Remove ID Fields

// Set Master Key || Encrypt fields

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
import * as crypto from "crypto";


/* TYPESCRIPT INTERFACES */
interface DatabaseUsersServicesIds {
  id: string,
  eu: string, // email/username
  password: string,
  description: string,
  email: string,
  username: string,
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
  iv?: string,
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
  description?: string,
  all?: boolean
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
  setMasterKey?: boolean,

  getUsers?: boolean,
  createUser?: string,
  deleteUser?: string,

  getServices?: boolean,
  createService?: string,
  deleteService?: string,

  getIds?: true | false,
  createId?: string,
  deleteId?: string,

  getFields?: boolean,

  verbose?: boolean,
  coloredOutput?: boolean,

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

const getColor = (color: string) => {
  switch(color) {
    case "red":
    case "RED":
    case "Red":
      return "\x1b[31m";

    case "yellow":
    case "YELLOW":
    case "Yellow":
      return "\x1b[33m";

    case "blue":
    case "BLUE":
    case "Blue":
      return "\x1b[34m";

    case "green":
    case "GREEB":
    case "Green":
      return "\x1b[32m";

    case "reset":
    case "RESET":
    case "Reset":
    case "none":
    case "NONE":
    case "None":
      return "\x1b[0m";

    default:
      return "\x1b[0m";
  }
}

const verbose = (text: string, enable: boolean | undefined, coloredOutput: boolean | undefined) => {
  if (enable) {
    if (coloredOutput) {
      text = getColor("green") + text + getColor("reset");
    }
    console.log(text);
  }
}

const exit = (output: string) => {
  console.log(output);
  process.exit();
}

/* PROGRAM FUNCTIONS */
const createDatabase = (dbPath: string) => {
  if (!fs.existsSync(dbPath)) {
    const db: Database = {
      users: [], 
      masterKey: "",
      masterTestKey: "jdjdusjdjddj",
      expectedTest: "key is fine",
      iv: "Not Encrypted",
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
/*    console.log(`DATABASE UPDATED TO:
${JSON.stringify(db, null, 2)}
`); */
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
  if (!users || typeof users === "string") {
    console.log("No users to show");
    return undefined;
  }

  console.log("USERS:");
  for (let i = 0; i < users.length; ++i) {
    console.log(`  ${+i + 1} - ${users[i].username}`);
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
	  console.log(`\nUser "${user.username}" already exists`);
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
    console.log("No users to show");
    return undefined;
  }

  for (let i = 0; i < users.length; ++i) {
    if (users[i]?.username === username) {
      // show services for this username
      if (users[i].services?.length) {
        console.log("SERVICES:");
        for (let j in users[i].services) {
          console.log(`  ${+j + 1} - ${users[i].services[j].name}`);
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
      for (let j in data.users[userIndex].services) {
        if (data.users[userIndex].services[j].name === userData.serviceName) {
          console.log(`\nService "${userData.serviceName}" already exists`);
	  return undefined;
	}
      }

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

const showIds = (jsonPath: string, username: string, serviceName: string) => {
  const users = getUsers(jsonPath);
  if (!users) {
    console.log("No users to show");
    return undefined;
  }

  for (let i = 0; i < users.length; ++i) {
    if (users[i]?.username === username) {
      if (users[i].services?.length) {
        for (let j in users[i].services) {
          if (users[i].services[j]?.name === serviceName) {
            if (users[i].services[j]?.ids?.length) {
	      console.log("IDS:");
              for (let k in users[i].services[j].ids) {
                console.log(`  ${+k + 1} - ${users[i].services[j].ids[k]?.id}`);
		if (users[i].services[j].ids[k]?.description) {
                  console.log(users[i].services[j].ids[k]?.description);
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

              // You can make this checks shorter by looping trought userData.ids keys 
	      if (userData?.idName) {
                aux.id = userData?.idName;
	      }

	      if (userData?.ids?.eu) {
                aux.eu = userData?.ids?.eu;
	      }

	      if (userData?.ids?.password) {
                aux.password = userData.ids.password;
	      }

              if (userData?.ids?.email) {
                aux.email = userData.ids.email;
	      }

              if (userData?.ids?.username) {
                aux.username = userData.ids.username;
	      }

	      if (userData?.ids?.description) {
                aux.description = userData.ids.description;
	      }

              // check if already exists the idName in the database to avoid create duplicates
	      for (let k in data.users[i].services[j].ids) {
                if (data.users[i].services[j].ids[k].id === userData.idName) {
                  console.log(`\nId "${userData.idName}" already exists`);
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
}

const deleteId = (jsonPath: string, userData: InputUserData) => {
  const data = getData(jsonPath);
  if (data && userData?.username && userData?.serviceName && userData?.idName) {
    if (data?.users) {
      for (let i = 0; i < data?.users?.length; ++i) {
        if (data.users[i].username === userData.username) {
          for (let j = 0; j < data.users[i]?.services?.length; ++j) {
            if (data.users[i].services[j].name === userData?.serviceName) {
              for (let k = 0; k < data.users[i].services[k]?.ids.length; ++k) {
                if (data.users[i].services[j].ids[k].id === userData?.idName) {
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
}

const showIdFields = (jsonPath: string, userData: InputUserData) => {
  const users = getUsers(jsonPath);
  if (!users) {
    console.log("No users to show");
    return undefined;
  }

  for (let i = 0; i < users.length; ++i) {
    if (users[i]?.username === userData?.username) {
      if (users[i].services?.length) {
        for (let j in users[i].services) {
          if (users[i].services[j]?.name === userData?.serviceName) {
            if (users[i].services[j]?.ids?.length) {
              for (let k in users[i].services[j].ids) {
                if (users[i].services[j].ids[k].id === userData?.idName) {
                  const current = users[i].services[j].ids[k];
                  let aux = {} as any;

                  if (userData?.idName || userData?.ids?.all) {
                    if (current?.id) {
                      console.log(`id: ${current.id}`);
                    } else {
                      // console.log("id not found");
                    }
                  }

                  if (userData?.ids?.eu || userData?.ids?.all) {
                    if (current?.eu) {
                      console.log(`eu: ${current.eu}`);
                    } else {
                      // console.log("eu not found");
                    }
                  }

                  if (userData?.ids?.password || userData?.ids?.all) {
                    if (current?.password) {
                      console.log(`password: ${current.password}`);
                    } else {
                      // console.log("password not found");
                    }
                  }

                  if (userData?.ids?.email || userData?.ids?.all) {
                    if (current?.email) {
                      console.log(`email: ${current.email}`);
                    } else {
                      // console.log("email not found");
                    }
                  }

                  if (userData?.ids?.username || userData?.ids?.all) {
                    if (current?.username) {
                      console.log(`username: ${current.username}`);
                    } else {
                      // console.log("username not found");
                    }
                  }

                  if (userData?.ids?.description || userData?.ids?.all) {
                    if (current?.description) {
                      console.log(`description: ${current.description}`);
                    } else {
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
}

const encrypt = (text: string, key: string) => {
  return new Promise<string>( (resolve, reject) => {
    const algorithm = "aes-192-cbc";
    crypto.scrypt(key, "salt", 24, (err, key) => {
      if (err) {
        reject(err);
      }

      crypto.randomFill(new Uint8Array(16), (err, iv) => {
        if (err) {
          reject(err);
	}

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, "utf-8", "hex");
        encrypted += cipher.final("hex");
        resolve(`${Buffer.from(iv).toString("hex")}:${encrypted}`);
      });
    });
  });
}

const decrypt = (text: string, key: string) => {
  return new Promise<string>( (resolve, reject) => {
    (async () => {
      /*
      let canDecrypt;
      try {
        canDecrypt = await testDecryptionKey(JSON_PATH, key);
      } catch (err) {
        reject(err);
      }
    
      if (!canDecrypt) {
	console.log("Key is wrong");
        reject("false");
      }
      */

      const algorithm = "aes-192-cbc";
      crypto.scrypt(key, "salt", 24, (err, key) => {
        if (err) {
          reject(err);
        }
      
        const iv = Buffer.from(text.split(":")[0], "hex");
        const encryptedText = text.split(":")[1];
  
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
	try {
          decrypted += decipher.final("utf8");
	} catch(err) {
          reject(err);
	}
        resolve(decrypted);
      });
    })();
  });
}

const encryptDatabase = (jsonPath: string, key: string) => {
  return new Promise<boolean>( (resolve, reject) => {
    let data = getData(jsonPath);
    if (!data || !data?.users) {
      reject("Database not found");
    }

    /*
    if (typeof data?.users === "string") {
      console.log("Database already encrypted");
      reject("Database already encrypted");
    }
    */

    (async () => {
      // @ts-ignore
      const aux = await encrypt(JSON.stringify(data.users), key);
      // @ts-ignore
      data.iv = aux.split(":")[0];
      // @ts-ignore
      data.users = aux.split(":")[1];
      if (data?.config) {
        data.config.useMasterKey = true;
      } 
console.log("Database encrypted");
      // @ts-ignore
      updateDatabase(jsonPath, data);
      resolve(true);
    })();
  });
}

const decryptDatabase = (jsonPath: string, key: string) => {
  return new Promise<boolean>( (resolve, reject) => {
    let data = getData(jsonPath);
    if (!data || !data?.users) {
      reject("Database not found");
    }

    (async () => {
      try {
      // @ts-ignore
      const aux = await decrypt(`${data.iv}:${data.users}`, key);
      } catch (err) {
        exit("Master Key is wrong"); 
      }
      // @ts-ignore
      data.users = JSON.parse(aux);
      if (data?.config?.useMasterKey) {
        data.config.useMasterKey = false;
      }

      if (data?.iv) {
        data.iv = "Not Encrypted";
      }
console.log("Database decrypted");
// TODO: Check if key used was right before update the database. NEED to add a check field into users array
      // @ts-ignore
      updateDatabase(jsonPath, data);
      resolve(true);
    })();
  });
}

// TODO: masterKey should be private in prod. Here is clear for development/debug purpouses only. IV should be public. 
const setMasterKey = (jsonPath: string, key: string) => {
  const data = getData(jsonPath);

  if (!data) {
    return undefined;
  }

  data.masterKey = key; // The key is visible only for debug/development will be removed in prod.

  // cipher the expected test
  (async () => {
    // @ts-ignore
    data.masterTestKey = await encrypt(data.expectedTest, data.masterKey);
    // @ts-ignore
    const decrypted = await decrypt(data.masterTestKey, data.masterKey);

    if (data.expectedTest !== decrypted) {
      console.log(`expectedTest "${data.expectedTest}" not matching decrypted "${decrypted}". This means the masterKey is wrong or the cipher suite has a bug`);
      return undefined;
    } 

    // encrypt database using key
    encryptDatabase(jsonPath, key);
    // updateDatabase(jsonPath, data); encryptDatabase already updates
    return undefined;
  })();

  return undefined;
}

/* decrypt/encrypt database if key is provided */
const decryptEncryptAtStart = (cli: Cli) => {
  // TODO: Change <any> for an interface
  return  new Promise<any>( (resolve) => {
  (async () => {
    const data = getData(JSON_PATH);
    if (typeof data?.users === "string") { /* Database is encrypted */
      if (cli.setMasterKey) { // Do not encrypt again
        exit("Database is already encrypted");
      }

      if (data?.config?.useMasterKey) { /* Database config confirm db is encrypted */
        if (!cli?.userData?.key) { // db is encrypted but key for decryption is not provided.
          if (!cli?.userData) { // if userData not exists
          cli.userData = {} as any; // create userData before defininf key field
          }
          if (cli?.userData) {
            cli.userData.key = ask("The database is encrypted using masterKey. Please provide master key\n-> "); // prompt user for key
          }
        }
        if (cli?.userData?.key) {
          await decryptDatabase(JSON_PATH, cli.userData.key); // decrypt database with key
	  resolve([ false, data.config.useMasterKey, cli.userData.key]);
        }
      }
    } else { /* database is not encrypted */
      if (Array.isArray(data?.users) && data?.config?.useMasterKey) { /* if there is data without encryption AND database config says to use encryption */
        if (!cli?.userData) {
          cli.userData = {} as any;
        }

        if (!cli?.userData?.key) {
          if (cli?.userData) {
            cli.userData.key = ask("The database is not encrypted using masterKey. Please provide the master key for encryption\n-> ");
	  }
        }

        if (cli?.userData?.key) {
          await encryptDatabase(JSON_PATH, cli.userData.key); // encrypt database
          resolve([true]);
        }
      }
    }
    resolve([false]);
  })();
  });
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


const parseArguments = (): Cli => {
  const cli: Cli = {} as any;
  for (let i = 0; i < process.argv.length; ++i) {
    const current = process.argv[i];
    const next = process.argv[+i + 1];
    switch (current) {
      case "setMasterKey":
      case "setmasterkey":
      case "set-master-key":
        cli.setMasterKey = true;
        cli.userData = {} as any;
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

      case "getIds":
      case "getIDs":
      case "get-ids":
      case "get_ids":
      case "--ids":
      case "--get-ids":
        cli.getIds = true;
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

      case "deleteId":
      case "deleteid":
      case "delete-id":
      case "delete_id":
      case "--delete-id":
        cli.deleteId = next;
        cli.userData = {} as any;
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

      case "--service":
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
      case "--email":
        if (cli?.userData?.ids) {
          cli.userData.ids.email = next;
        }
      break;

      case "--id-username":
      case "--account":
        if (cli?.userData?.ids) {
          cli.userData.ids.username = next;
        }
      break;

      case "--id-password":
      case "--password":
        if (cli?.userData?.ids) {
          cli.userData.ids.password = next;
        }
      break;

      case "--id-description":
      case "--description":
        if (cli?.userData?.ids) {
          cli.userData.ids.description = next;
        }
      break;

      case "--id-all":
      case "--all":
        if (cli?.userData?.ids) {
          cli.userData.ids.all = true;
        }
      break;

      case "key":
      case "--key":
        if (!cli?.userData) {
	  cli.userData = {} as any;
	}
        
	// @ts-ignore
	cli.userData.key = next;
      break;
      // case "interactive input: ? maybe

      case "-v":
      case "--verbose":
        cli.verbose = true;
      break;

      case "-c":
      case "--colored":
      case "--color":
      case "--colored-output":
        cli.coloredOutput = true;
      break;

      case "h":
      case "help":
      case "Help":
      case "-h":
      case "--help":
        console.log(`Help Menú:

  KEY
setMasterKey      Key to access the database
		    
  USER
getUsers          Show all the users
createUser        Create new users
deleteUser        Delete a user

  SERVICE
getServices       Show all the services for a user
createService     Create a new service for a user
deleteService     Delete a service from a user

  ID
getIds            Show all the ids from a user's service
createId          Create new id for a service
deleteId          Delete an id from a user's service

  FIELD
getFields         Show selected fields from an id

...
...
...


Usage:
  pm [mainAction] [--mandatory-argument value] {--optional-argument value}


mainAction list:

setMasterKey
getUsers
createUser
deleteUser
getServices 
createService
deleteService
getIds
createId
deleteId
getFields


arguments list
--key
--username
--service-name
--id-name
--id-email
--id-username
--id-password
--id-description
--id-all


Available arguments for each action:
setMasterKey --key abc123

getUsers

createUser --username StringManolo

deleteUser --username StringManolo

getServices --username StringManolo

createService --username StringManolo --service-name gmail

deleteService --username StringManolo --service-name gmail

getIds --username StringManolo --service-name gmail 

createId --username StringManolo --service-name gmail --id-name 'dev account' --id-email 'stringmanolo@gmail.com' --id-password 'abc123456' --id-description 'Gmail account for development'

deleteId --username StringManolo --service-name gmail --id-name 'dev account'

getFields --username StringManolo --service-name gmail --id-name 'dev account' --id-password true


Remember to use single quotes ' for values that have spaces or may end or modify the shell input like: createUser --username 'My Name Is ;Jhon' 

`);
        exit(""); 
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
let JSON_PATH = `${PROGRAM_FOLDER_PATH}/pm.json`;



/* PROGRAM INSTRUCTIONS */
(async () => {
  try { // catch permissions error
    createProgramFolder(PROGRAM_FOLDER_PATH); // create folder structure
  } catch(err) { // unable to create folder
    console.log("Unable to create program folder: " + err); 
  }

  try {
    createDatabase(JSON_PATH); // create json file (database)
  } catch(err) {
    console.log("Unable to create database into " + JSON_PATH + "\n" + err);
  }
  const cli = parseArguments(); // parse arguments from cli
  
  /* decrypt/encrypt database if key is provided */
  verbose("Database decryption/encryption started", cli?.verbose, cli?.coloredOutput);
  const [databaseEncrypted, encryptionEnabled, encryptionKey] = await decryptEncryptAtStart(cli);

  if (cli?.setMasterKey && cli?.userData?.key) {
    verbose("Seting MasterKey...", cli?.verbose, cli?.coloredOutput);
    setMasterKey(JSON_PATH, cli.userData.key);
    verbose("Done", cli?.verbose, cli?.coloredOutput);
  } else if (cli?.getUsers) {
    if (databaseEncrypted === true) {
      console.log("Database is encrypted");
    } else {
      verbose(`Geting Users...`, cli?.verbose, cli?.coloredOutput);
      showUsers(JSON_PATH);
    }
  } else if (cli?.createUser && cli.userData) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Creating User "${cli.userData?.username}"...`, cli?.verbose, cli?.coloredOutput);
      createUser(JSON_PATH, cli.userData);
    }
  } else if (cli?.deleteUser && cli?.userData?.username) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Deleting user "${cli?.userData.username}"...`, cli?.verbose, cli?.coloredOutput);
      deleteUser(JSON_PATH, cli.userData.username);
    }
  } else if (cli?.getServices && cli?.userData?.username) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Showing Services for "${cli.userData.username}"...`, cli?.verbose, cli?.coloredOutput);
      showServices(JSON_PATH, cli.userData.username);
    }
  } else if (cli?.createService && cli?.userData) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Creating Service for "${cli.userData?.username}...`, cli?.verbose, cli?.coloredOutput);
      createService(JSON_PATH, cli.userData);
    }
  } else if (cli?.deleteService && cli?.userData?.username && cli.userData?.serviceName) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Delete Service for "${cli.userData.username}"...`, cli?.verbose, cli?.coloredOutput);
      deleteService(JSON_PATH, cli.userData);
    }
  } else if (cli?.getIds && cli?.userData?.username && cli.userData?.serviceName) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Showing Ids for "${cli.userData.username}/${cli.userData.serviceName}"...`, cli?.verbose, cli?.coloredOutput);
      showIds(JSON_PATH, cli.userData.username, cli.userData.serviceName);
    }
  } else if (cli?.createId && cli?.userData?.username && cli.userData?.serviceName && cli.userData?.idName) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Creating Id "${cli.userData.idName}" for "${cli.userData.username}/${cli.userData.serviceName}"...`, cli?.verbose, cli?.coloredOutput);
      createId(JSON_PATH, cli.userData);
    }
  } else if (cli?.deleteId && cli?.userData?.username && cli.userData?.serviceName && cli.userData?.idName) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Deleting id "${cli.userData.idName}" for ${cli.userData.username}/${cli.userData.serviceName}"...`, cli?.verbose, cli?.coloredOutput);
      deleteId(JSON_PATH, cli.userData);
    }
  } else if (cli?.getFields && cli?.userData?.username && cli.userData?.serviceName && cli.userData?.idName) {
    if (databaseEncrypted) {
      console.log("Database is encrypted");
    } else {
      verbose(`Geting id fields for "${cli.userData.username}/${cli.userData.serviceName}/${cli.userData.idName}"...`, cli?.verbose, cli?.coloredOutput); 
      showIdFields(JSON_PATH, cli.userData);
    }
  } else {
    console.log("No mainAction detected or not enought argumentss provided. Use --help to view commands and their mandatory arguments");
    // detect what command is used
    // showUsage(commandName);
  }

  if (!databaseEncrypted && encryptionEnabled && encryptionKey) {
    verbose("Encrypting database before exit...", cli?.verbose, cli?.coloredOutput);
    encryptDatabase(JSON_PATH, encryptionKey); // encryption key comes from ask the user the key inside encryptDecrypt function (returned by promise)
  }
})();

