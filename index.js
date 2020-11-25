const inquirer = require('inquirer');
const mysql = require('mysql');
const consoleTable = require('console.table');

// Create a database connection
const connection = mysql.createConnection({
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
                'View all Employees by Department',
                'View All Employees by Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee Role',
                'Update Employee Manager',
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
            case 'Update Employee Role':
                updateEmployee();
                break;
            case 'Update Employee Manager':
                updateEmployeeManager();
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
    connection.query('')

}

// Employees by Manager:
employeesByManager = () => {
    // compare employee id to manager_id .. same manager, here ya go
    connection.query('')

}

// Add New Employee
addEmployee = () => {
    connection.query('SELECT * FROM role', (err, response) => {
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
                choices: response.map(({
                    id, title
                }) => ({
                    name: title,
                    value: id
                }))
            }
        ]).then((answer) => {
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: answer.role
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
                name: "choice",
                message: 'Who would you like to remove?',
                type: "rawlist",
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
    // get employees, inquirer asks what employee they want to update, then prompt qs to change .. then update the employee where id = their choice
    connection.query('')

}

// Update Employee Manager:
updateEmployeeManager = () => {
    // get employees where manager_id is null, also get all employees .. inquirer asks which to update, then list what managers you can choose from, MAKE MAGIC HAPPEN!
    connection.query('')

}