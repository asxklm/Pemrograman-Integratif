const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');

const PROTO_PATH = './mhs.proto';
const options =
{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

console.log(packageDefinition);

const usersProto = grpc.loadPackageDefinition(packageDefinition);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mhs'
});

db.connect((error) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log('Connected to database')
});

const server = new grpc.Server();

server.addService(usersProto.UserService.service, {
  listUser:(call, callback) => {
    db.query('SELECT * FROM mahasiswa', (error, results) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      }
  
      const users = results;
  
      if (!users.length) {
        const error = {
          code: grpc.status.NOT_FOUND,
          details: 'User not found',
        };
        callback(error, null);
        return;
      }
  
      const userList = {
        users: users,
      };
  
      callback(null, userList);
    });
  },
      
  AddUser: (call, callback) => {
    const user = call.request;
    db.query('INSERT INTO mahasiswa SET ?', user, (error, result) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      }
      user.id = result.insertId;
      callback(null, { success: true, user });
    });
  },
  GetUser: (call, callback) => {
    const id = call.request.id;
    db.query('SELECT * FROM mahasiswa WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      }
      const user = results[0];
      if (!user) {
        callback({ code: grpc.status.NOT_FOUND, details: 'User not found' }, null);
        return;
      }
      callback(null, { user });
    });
  },
  UpdateUser: (call, callback) => {
    const user = call.request;
    db.query('UPDATE mahasiswa SET nama = ?, umur = ?, WHERE id = ?', [user.nama, user.umur, user.id], (error) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      }
      callback(null, { success: true });
    });
  },
  DeleteUser: (call, callback) => {
    const id = call.request.id;
    db.query('DELETE FROM mahasiswa WHERE id = ?', [id], (error) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
    }
    callback(null, { success: true });
    });
  }
});



server.bindAsync('127.0.0.1:3500', grpc.ServerCredentials.createInsecure(),
(error, port) => {
  console.log("Server running at http://127.0.0.1:3500");
  server.start();
}
)
