let VERBOSE = false;

const Sequelize = require('sequelize');

// set the connection information
var sequelize = new Sequelize
(
    'd8ghuf9fem0i35', // Database
    'gfwkmyoqvcvbsv', // User
    '0991b7a16d61a653283cd41361a3aec9980d26895e34f1b569355f515543ee3f', // Password
    { 
        host: 'ec2-107-22-229-213.compute-1.amazonaws.com', 
        dialect: 'postgres', 
        port: 5432, 
        dialectOptions: { ssl: true } 
    }
); 

// Define models: Employee
var Employee = sequelize.define('Employee', {
    employeeNum:{
        type:Sequelize.INTEGER,
            primaryKey: true, // use "employeeNum" as a primary key
            autoIncrement: true // automatically increment the value
    },
    firstName:Sequelize.STRING,
    last_name:Sequelize.STRING,
    email:Sequelize.STRING,
    SSN:Sequelize.STRING,
    addressStreet:Sequelize.STRING,
    addresCity:Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal:Sequelize.STRING,
    maritalStatus:Sequelize.STRING,
    isManager:Sequelize.BOOLEAN,
    employeeManagerNum:Sequelize.INTEGER,
    status:Sequelize.STRING,
    department:Sequelize.INTEGER,
    hireDate:Sequelize.STRING
});
// Define models: Department
var Department  = sequelize.define('Department', {
    departmentId:{
        type:Sequelize.INTEGER,
            primaryKey: true, // use "departmentId" as a primary key
            autoIncrement: true // automatically increment the value
    },
    departmentName:Sequelize.STRING
});

// synchronize the Database with our models and automatically add the 
// table if it does not exist
module.exports.initialize = () =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {
                 resolve();
        });
    });
};

// provide the full "employee" objects 
module.exports.getAllEmployees = () =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Employee.findAll({ 
                //attributes: ['firstName']
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getAllEmployees():::successful!");
                resolve(data);
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getAllEmployees():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}

// provide an "employee" objects whose status property matches 
module.exports.getEmployeesByStatus = (status) =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Employee.findAll({ 
                // retrieve employees with status ('Part Time', 'Full Time')
                where: { status: status } 
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getEmployeesByStatus():::successful!");
                resolve(data);
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getEmployeesByStatus():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}

// provide an "employee" objects whose department property matches 
module.exports.getEmployeesByDepartment = (department) =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Employee.findAll({ 
                // retrieve employees with department code
                where: { department: department } 
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getEmployeesByDepartment():::successful!");
                resolve(data);
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getEmployeesByDepartment():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}
// provide an "employee" objects whose employeeManagerNum property matches 
module.exports.getEmployeesByManager = (manager) =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Employee.findAll({ 
                // retrieve employees with manager number
                where: { employeeManagerNum: manager } 
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getEmployeesByManager():::successful!");
                resolve(data);
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getEmployeesByManager():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}

// provide an "employee" object whose employeeNum property matches 
module.exports.getEmployeeByNum = (num) =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Employee.findAll({ 
                // retrieve an employee with employee number
                where: { employeeNum: num } 
            }).then(function(data){
                if (VERBOSE)  console.log("data-service::\
                        getEmployeeByNum():::successful!");
                // only provide the first object
                resolve(data[0]); 
            }).catch(function (error) {
                if (VERBOSE)  console.log("data-service::\
                        getEmployeeByNum():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}

// provide an "employee" objects whose isManager property is true 
module.exports.getManagers = () =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Employee.findAll({ 
                // retrieve employees with isManager property
                where: { isManager: true } 
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getManagers():::successful!");
                resolve(data);
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getManagers():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}
// provide the full array of "department"
module.exports.getDepartments = function()
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return all fields
            Department.findAll({ 
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getDepartments():::successful!");
                resolve(data);
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getDepartments():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}

// add an employee information
module.exports.addEmploye = (employeeData) =>
{ 
    return new Promise( (resolve, reject) =>
    { 
        // any blank values ("") for properties are set to null
        for (var prop in employeeData)
        {
            if (VERBOSE) console.log("data-service::\
                    addEmploye():::-->" + employeeData[prop]+ "<--");          
            if(employeeData[prop] == "") employeeData[prop] = null;
        }

        // isManager is explicitly set (true or false)
        employeeData.isManager = (employeeData.isManager) ? true : false;

        sequelize.sync().then(function () {
            Employee.create({
                employeeNum: employeeData.employeeNum,
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            }).then(function() { 
                if (VERBOSE) console.log("data-service::\
                        addEmploye():::successful!");                
                resolve();                
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        addEmploye():::something went wrong!::::" + error);
                reject("unable to create employee");
            });
        });  
    });
}

// update an employee information
module.exports.updateEmployee = (employeeData) =>
{
    return new Promise( (resolve, reject) =>
    {
        // any blank values ("") for properties are set to null
        for (var prop in employeeData)
        {
            if (VERBOSE) console.log("data-service::\
                    updateEmployee():::-->" + employeeData[prop]+ "<--");          
            if(employeeData[prop] == "") employeeData[prop] = null;
        }

        // isManager is explicitly set (true or false)
        employeeData.isManager = (employeeData.isManager) ? true : false;

        sequelize.sync().then(function () {
            Employee.update({
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            },{
                // only update user information with employee number
                where: { employeeNum: employeeData.employeeNum } 
            }).then(function() { 
                if (VERBOSE) console.log("data-service::\
                        updateEmployee():::successful!");                
                resolve();
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        updateEmployee():::something went wrong!" + error);
                reject("unable to update employee");
            });
        });  
    });
}

// add a department information
module.exports.addDepartment = (departmentData) =>
{
    return new Promise( (resolve, reject) =>
    {
        // any blank values ("") for properties are set to null
        for (var prop in departmentData) 
            if(prop == "") departmentData.prop = null;

        sequelize.sync().then(function () {
            Department.create({
                departmentId: departmentData.departmentId,
                departmentName: departmentData.departmentName
            }).then(function() { 
                if (VERBOSE) console.log("data-service::\
                        addDepartment():::successful!");
                resolve();
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        addDepartment():::something went wrong!" + error);
                reject("unable to create department");
            });
        });  
    });
}

// update a department information
module.exports.updateDepartment = (departmentData) =>
{
    return new Promise( (resolve, reject) =>
    {
        // any blank values ("") for properties are set to null
        for (var prop in departmentData) 
            if(prop == "") departmentData.prop = null;

        sequelize.sync().then(function () {
            Department.update({
                departmentId: departmentData.departmentId,
                departmentName: departmentData.departmentName
            }, {
                // only update department information with department id
                where: { departmentId: departmentData.departmentId } 
            }).then(function() { 
                if (VERBOSE) console.log("data-service::\
                        updateDepartment():::successful!");                
                resolve();
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        updateDepartment():::something went wrong!" + error);
                reject("unable to update department");
            });
        });  
    });
}

// provide a "department" object whose department id property matches 
module.exports.getDepartmentById = (id) =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {        
            // return fields
            Department.findAll({ 
                // retrieve an department with department id
                where: { departmentId: id } 
            }).then(function(data){
                if (VERBOSE) console.log("data-service::\
                        getDepartmentById():::successful!");
                // only provide the first object
                resolve(data[0]); 
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        getDepartmentById():::something went wrong!" + error);
                reject("no results returned");
            });
        });
    });
}

// delete an employee information
module.exports.deleteEmployeeByNum = (empNum) =>
{
    return new Promise( (resolve, reject) =>
    {
        sequelize.sync().then(function () {

            // remove an employee from the database
            Employee.destroy({
                // only remove employee with employee number
                where: { employeeNum: empNum } 
            }).then(function () { 
                if (VERBOSE) console.log("data-service::\
                        deleteEmployeeByNum():::successful!");
                resolve();
            }).catch(function (error) {
                if (VERBOSE) console.log("data-service::\
                        deleteEmployeeByNum():::something went wrong!" + error);
                reject("unable to remove employee");
            });
        });
    });
}