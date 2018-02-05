/*********************************************************************************
* WEB322 – Assignment 07
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Jongkuk Lee__________ Student ID: _127730158____ Date: _2017-08-04_____
*
* Online (Heroku) Link: __https://afternoon-escarpment-51015.herokuapp.com/______________
********************************************************************************/
let VERBOSE = false;

const express = require("express");
const exphbs = require('express-handlebars');      
const bodyParser = require('body-parser');
const clientSessions = require('client-sessions'); 
var app = express();
var dataService = require("./data-service.js");
var dataServiceComments = require("./data-service-comments.js");
const dataServiceAuth = require("./data-service-auth.js");
var HTTP_PORT = process.env.PORT || 8080;

// set to use static pages or images
app.use(express.static('public'));
// set to use express-handlebars
app.use(bodyParser.urlencoded({ extended: true }));
app.engine(".hbs", exphbs({   extname: ".hbs",   defaultLayout: 'layout', 
  helpers: { 
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3) 
        throw new Error("Handlebars Helper equal needs 2 parameters");
      
      if (lvalue != rvalue) { 
        return options.inverse(this); 
      } else { 
        return options.fn(this);
      }
    } 
  } })); 
app.set("view engine", ".hbs");
// set the path 
var path = require("path");
// use the client-sessions middlewar
app.use(clientSessions({
  cookieName: "session",
  secret: "Web322_Assignment3",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// custom middleware function to ensure that all of 
// your templates will have access to a "session" object 
app.use(function(req, res, next) {  
   res.locals.session = req.session;   
   next(); 
}); 

// helper middleware function that checks if a user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}




// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup route to listen on /
app.get("/", function(req,res){
  res.render("home");
});
// // setup route to listen on /about
// // retrieve all comments from Mongo DB
// app.get("/about", function(req,res){
//   dataServiceComments.getAllComments().then( (dataFromPromise) =>
//   {
//     res.render("about", { data: dataFromPromise });        
//   })
//   .catch( (errorMsg)=> {
//     res.render("about");       
//   });
// });

// setup route to listen on /employees
app.get("/employees", ensureLogin, (req, res) =>{

  // get all employees that match with a status (Part Time, Full Time) 
  if(req.query.status)
  {
    dataService.getEmployeesByStatus(req.query.status).then( (data) =>
    {
      res.render("employeeList", { data: data, title: "Employees" });      
    })
    .catch( (errorMsg)=> {
      res.render("employeeList", { data: {}, title: "Employees" }); 
    });
  }
  // get all employees that match with a manager id
  else if(req.query.manager)
  {
    dataService.getEmployeesByManager(req.query.manager).then( (data) =>
    {
      res.render("employeeList", { data: data, title: "Employees" });        
    })
    .catch( (errorMsg)=> {
      res.render("employeeList", { data: {}, title: "Employees" });       
    });    
  }
  // get all employees that match with department id 
  else if(req.query.department)
  {
    dataService.getEmployeesByDepartment(req.query.department).then( (data) =>
    {
      res.render("employeeList", { data: data, title: "Employees" });  
    })
    .catch( (errorMsg)=> {
      res.render("employeeList", { data: {}, title: "Employees" });       
    });     
  }
  // get all employees 
  else{
    dataService.getAllEmployees().then( (data) =>
    {
      res.render("employeeList", { data: data, title: "Employees" });        
    })
    .catch( (errorMsg)=> {
      res.render("employeeList", { data: {}, title: "Employees" });       
    });
  }

});

// setup route to listen on /employee/value 
app.get("/employee/:empNum", ensureLogin, (req, res) => { 
 
  // initialize an empty object to store the values   
  let viewData = {};
 
  dataService.getEmployeeByNum(req.params.empNum) 
  .then((data) => { 
    if (VERBOSE) console.log("server.js::app.get(/employee/:empNum,\
        (req, res):::getEmployeeByNum:::successful!"); 
    // store employee data in the "viewData" object as "data"
    viewData.data = data;  
  }).catch((e)=>{ 
    if (VERBOSE) console.log("server.js::app.get(/employee/:empNum, \
        (req, res):::getEmployeeByNum:::fail!" + e);    
    viewData.data = null; // set employee to null if there was an error  
  }).then(dataService.getDepartments) 
  .then((data) => { 
    // store department data in the "viewData" object as "departments" 
    viewData.departments = data; 
     
    // loop through viewData.departments and once we have found the 
    // departmentId that matches the employee's "department" value, 
    // add a "selected" property to the matching        
    // viewData.departments object 
    if (VERBOSE) console.log("server.js::app.get(/employee/:empNum, \
        (req, res):::getDeartments:::successful!" + viewData.departments);  
    
    for (let i = 0; i < viewData.departments.length; i++) { 
      if (viewData.departments[i].departmentId == viewData.data.department) {           
          viewData.departments[i].selected = true; 
      } 
    } 
    
    if (VERBOSE) console.log("server.js::app.get(/employee/:empNum, \
        (req, res):::getDeartments:::successful!");  
  }).catch((e)=>{ 
    if (VERBOSE) console.log("server.js::app.get(/employee/:empNum, \
        (req, res):::getDeartments:::fail!" + e);   
    viewData.departments=[]; // set departments to empty if there was an error 
  }).then(()=>{ 
    if(viewData.data == null){ // if no employee - return an error           
        res.status(404).send("Employee Not Found");    
    } else { 
        if (VERBOSE) console.log("server.js::app.get(/employee/:empNum, \
            (req, res):::successful!" + viewData.data.firstName);
        res.render("employee", { viewData: viewData }); // render the "employee" view 
      } 
  }); 
}); 

// setup route to listen on /managers 
app.get("/managers", ensureLogin, (req,res) => {
    dataService.getManagers().then( (data) =>
    {
      res.render("employeeList", { data: data, title: "Employees (Managers)" });      
    })
    .catch( (errorMsg)=> {
      res.render("employeeList", { data: {}, title: "Employees (Managers)" });      
    });
});

// setup route to listen on /departments  
app.get("/departments", ensureLogin, (req,res) => {
    dataService.getDepartments().then( (data) =>
    {
      res.render("departmentList", { data: data, title: "Departments" });
    })
    .catch( (errorMsg)=> {
      res.render("departmentList", { data: {}, title: "Departments" });
    });  
});

// setup route to add new employee
app.get("/employees/add",ensureLogin,  (req,res) => {
    dataService.getDepartments().then( (data) =>
    {
      res.render("addEmployee", {departments: data});
    })
    .catch( (errorMsg)=> {
      res.render("addEmployee", {departments: []});  
    });
});

// setup POST route to add employees and redirect page
app.post("/employees/add", ensureLogin, (req, res) => { 
    if (VERBOSE) console.log(req.body);
    dataService.addEmploye(req.body).then( () =>
    {
      res.redirect("/employees");
    });
}); 

// setup POST route to update employees and redirect page
app.post("/employee/update", ensureLogin, (req, res) => { 
    if (VERBOSE) console.log(req.body); 
    dataService.updateEmployee(req.body).then( () => {
      res.redirect("/employees"); 
    });
});

// setup route to add new department`
app.get("/departments/add", ensureLogin, (req,res) => {     
  res.render("addDepartment"); 
});

// setup POST route to add departments and redirect page
app.post("/departments/add", ensureLogin, (req, res) => { 
    if (VERBOSE) console.log(req.body);
    dataService.addDepartment(req.body).then( () =>
    {
      res.redirect("/departments");
    });
}); 

// setup POST route to update departments and redirect page
app.post("/department/update", ensureLogin, (req, res) => { 
    if (VERBOSE) console.log(req.body); 
    dataService.updateDepartment(req.body).then( () => {
      res.redirect("/departments"); 
    });
});

// setup route to listen on /department/value 
app.get("/department/:departmentId", ensureLogin, (req,res) => {
    dataService.getDepartmentById(req.params.departmentId).then( (data) =>
    {
      if (VERBOSE) console.log("server.js::app.get(/department/:departmentId, \
          (req,res):::" + data.departmentName);
      res.render("department", { data: data });         
    })
    .catch( (errorMsg)=> {
      res.status(404).send("Department Not Found");        
    });
});

// setup route to listen on /employee/delete/value 
app.get("/employee/delete/:empNum", ensureLogin, (req,res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then( () =>
    {
      res.redirect("/employees");      
    })
    .catch( (errorMsg)=> {
      res.status(500).send("Unable to Remove Employee / Employee not found");        
    });
});


// setup POST route to add a comment and redirect the page
app.post("/about/addComment", (req, res) => { 
    if (VERBOSE) console.log(req.body);
    dataServiceComments.addComment(req.body).then( () =>
    {
      res.redirect("/about");
    }).catch((err)=>
    {
      console.log(err);
    });
}); 

// setup POST route to update replies and redirect page
app.post("/about/addReply", (req, res) => { 
    if (VERBOSE) console.log(req.body); 
    dataServiceComments.addReply(req.body).then( () => {
      res.redirect("/about"); 
    }).catch((err)=>
    {
      console.log(err);
    });
});

// setup route to listen on /about
// retrieve all comments from Mongo DB
app.get("/about", function(req,res){
  dataServiceComments.getAllComments().then( (dataFromPromise) =>
  {
    res.render("about", { data: dataFromPromise });        
  })
  .catch( (errorMsg)=> {
    res.render("about");       
  });
});

// login route
app.get("/login", function(req,res){
  res.render("login", {});
});

// register route
app.get("/register", function(req,res){
  res.render("register", {});
});

// register route POST
app.post("/register", function(req,res){

  dataServiceAuth.registerUser(req.body).then( (dataFromPromise) =>
  {
    res.render("register", { successMessage: "User created" });
  })
  .catch( (err)=> {
    res.render("register", { errorMessage: err, user: req.body.user });
  });
});

// create the user session by login
app.post("/login", function(req,res) {

  dataServiceAuth.checkUser(req.body).then(()=>
  {
    req.session.user = {
      username: req.body.user
    }; 
    res.redirect('/employees'); 
  })
  .catch((err)=> {
   
    res.render("login", {errorMessage: err, user: req.body.user});
  });
});

// logout route
app.get("/logout", function(req,res) {
  req.session.reset();
  res.redirect("/");
});

// setup the no matching route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// setup http server to listen on HTTP_PORT
dataService.initialize()
.then( dataServiceComments.initialize )
.then( dataServiceAuth.initialize ) // add dataServiceAuth.initialize to the chain here
.then( () => {
  app.listen(HTTP_PORT, onHttpStart);
})
.catch( (errorMsg) => {
  if (VERBOSE) console.log("server.js::dataService.initialize().then().catch()");
  console.log("unable to start dataService");
});