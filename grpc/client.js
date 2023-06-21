const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

// const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// const UserService = protoDescriptor.UserService;

const UserService = grpc.loadPackageDefinition(packageDefinition).UserService;

const client = new UserService(
  "127.0.0.1:3500",
  grpc.credentials.createInsecure()
);

// module.exports = client;

function listUser() {
    client.listUser({}, (error, response) => {
    if (error) {
        console.error(error);
        return;
    }
    else{
        console.log('success fetch data')
        console.log(response)
    }
    //console.log(response.users);
    });
}

function getUser(id) {
    client.GetUser({ id }, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response.user);
    });
}

function addUser(nama, umur) {
    const user = { nama, umur };
    client.AddUser(user, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response.user);
    });
}

function updateUser(id, nama, umur) {
    const user = { id, nama, umur };
    client.UpdateUser(user, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response);
    });
    }
    
    function deleteUser(id) {
    client.DeleteUser({ id }, (error, response) => {
    if (error) {
    console.error(error);
    return;
    }
    console.log(response);
    });
    }
    
    listUser();
    //getUser(1);
    //addUser('evan', 22);
    //updateUser(3, 'su', '30');
    //deleteUser(1);
