const inquirer = require('inquirer');
const mysql = require('mysql');
const consoleTable = require('console.table');

// Create a database connection
const connection = mysql.createConnection({
    multipleStatements: true,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employee_trackerDB'
});

// Make the connection and display welcome image
connection.connect(function (err) {
    if (err) throw err;
    console.log(`
    _____                _                       
    |  ___|              | |                      
    | |__ _ __ ___  _ __ | | ___  _   _  ___  ___ 
    |  __| '_ \` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _\\
    | |__| | | | | | |_) | | (_) | |_| |  __/  __/
    \\____/_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|
                   | |             __/ |          
                   |_|            |___/           
     _____              _                         
    |_   _|            | |                        
      | |_ __ __ _  ___| | _____ _ __             
      | | '__/ _\` |/ __| |/ / _ \\ '__|            
      | | | | (_| | (__|   <  __/ |               
      \\_/_|  \\__,_|\\___|_|\\_\\___|_|  
    `)
    start();
});

start = () => {
    inquirer.prompt(
        {
            type: 'list',
            message: 'Would you like to do?',
            name: 'choice',
            choices: [
                'View All Employees',
                'View All Employees by Department',
                'View All Employees by Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee',
                'Exit'
            ]
        },
    ).then(answers => {
        switch (answers.choice) {
            case 'View All Employees':
                viewEmployees();
                break;
            case 'View All Employees by Department':
                employeesByDepartment();
                break;
            case 'View All Employees by Manager':
                employeesByManager();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Update Employee':
                updateEmployee();
                break;
            // Exit
            case 'Exit':
                console.log('Great job!');
                break;
        }
    })
};

// View All Employees
viewEmployees = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })
}

// Employees by Department:
employeesByDepartment = () => {
    // Join employee and department table by department_id and id field
    connection.query('SELECT r.department_id, employee.first_name, employee.last_name, d.name as department_name FROM employee JOIN role r on employee.role_id = r.id JOIN department d on d.id = r.department_id;', (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })

}

// Employees by Manager:
employeesByManager = () => {
    connection.query(`select concat(e.first_name, ' ', e.last_name) as Employee, concat(manager.first_name, ' ', manager.last_name) as Manager from employee e join employee manager ON e.manager_id = manager.id;`, (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    })

}

// Add New Employee
addEmployee = () => {
    connection.query('SELECT * FROM role; SELECT * FROM employee WHERE manager_id IS NULL', (err, response) => {
        const [roles, managers] = response;
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "What is your employee's first name?"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is your employee's last name?"
            },
            {
                type: 'list',
                name: 'role',
                message: "What is your employee's role?",
                choices: roles.map(({
                    id, title
                }) => ({
                    name: title,
                    value: id
                }))
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is this empoloyee's manager?",
                choices: managers.map(({
                    id, first_name, last_name
                }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                })).concat(['none'])
            }
        ]).then((answer) => {
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: answer.role,
                    manager_id: answer.manager === 'none' ? null : answer.manager
                },
                (err) => {
                    if (err) throw err;
                    start();
                }
            );
        });
    })
}

// Remove Employee:
removeEmployee = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'choice',
                message: 'Who would you like to remove?',
                type: 'rawlist',
                choices: function () {
                    let choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].first_name + ' ' + results[i].last_name);
                    }
                    return choiceArray;
                },
            }
        ]).then(answers => {
            let employee = answers.choice.split(' ')
            connection.query('DELETE FROM employee WHERE first_name = ? AND last_name = ?', employee)
            console.log('This employee has been removed!')
            start();
        })
    })
}

// Update Employee:
updateEmployee = () => {
    connection.query('SELECT * FROM employee; SELECT * FROM employee WHERE manager_id IS NULL; SELECT * FROM role', (err, response) => {
        const [employee, managers, roles] = response;
        // console.log(response)
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee would you like to update?",
                choices: employee.map(({
                    id, first_name, last_name
                }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                }))
            },
            {
                type: 'input',
                name: 'firstName',
                message: "What is your employee's first name?"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is your employee's last name?"
            },
            {
                type: 'list',
                name: 'role',
                message: "What is your employee's role?",
                choices: roles.map(({
                    id, title
                }) => ({
                    name: title,
                    value: id
                }))
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is this employee's manager?",
                choices: managers.map(({
                    id, first_name, last_name
                }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                })).concat(['null'])
            }
        ]).then(answers => {
            connection.query(`UPDATE employee SET first_name = '${answers.firstName}', last_name = '${answers.lastName}', role_id = ${answers.role}, manager_id = ${answers.manager} WHERE id = ${answers.employee}`,
                (err) => {
                    if (err) throw err;
                    start();
                });
        })
    })
};