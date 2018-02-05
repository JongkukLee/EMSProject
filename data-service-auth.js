let VERBOSE = false;

const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// define the content schema
const userSchema = new Schema({
  "user": {
      type: String,
      "unique": true
  },
  "password": String
});

// to be defined on new connection  
let User; 

// create new connection
// we are able to connect to our MongoDB instance 
module.exports.initialize = function () 
{
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://jlee465:Vkvkdi0^@ds129053.mlab.com:29053/web322_a71");
        db.on('error', (err)=>
        { 
            reject(err); // reject the promise with the provided error 
        }); 
        
        db.once('open', ()=>
        { 
           User = db.model("users", userSchema);            
           resolve();
        }); 
    }); 
}; 
// register user's id, password
module.exports.registerUser = function (userData) 
{
    return new Promise(function (resolve, reject) {
        // .password and .password2 do not match
        if(userData.password !== userData.password2)
        {
            reject("Passwords do not match");
        }
        else
        {
            let newUser = new User(userData);
            newUser.save( (err) => 
            {
                if(err) 
                {
                    if (VERBOSE) console.log("data-service-auth::registerUser():::fail!" + err);
                    // err.code is 11000 (duplicate key), reject 
                    if(err.code === 11000)
                        reject("User Name already taken");
                    // err.code is not 11000, reject 
                    else
                        reject("There was an error creating the user: " + err);
                } 
                else 
                {
                    if (VERBOSE) console.log("data-service-auth::registerUser():::successful!");
                    resolve();
                }
            });
        }

    });
};

// check validation of user's id, password
module.exports.checkUser = function (userData) 
{
    return new Promise(function (resolve, reject) 
    {
        User.find({user:userData.user})
        .exec()
        .then((user) => 
        {
            //  comments will be an array of objects.
            // Each object will represent a document that matched the query
            if (VERBOSE) console.log("data-service-auth:: checkUser():::successful!"); 
            // if users is an empty array, reject 
            if(user.length == 0)
                reject("Unable to find user: " + userData.user);
            // passwords does not match
            if(user[0].password != userData.password)
                reject("Incorrect Password for user: " + userData.user);
            // passwords match
            else
                resolve();
        }).catch( (err)=> {

            // return promise and pass the error that was "caught" 
            // during the Comment.find() operation
            if (VERBOSE) console.log("data-service-auth:: checkUser():::fail!" + err);                
            reject("Unable to find user: " + userData.user);
        });

    });
};





