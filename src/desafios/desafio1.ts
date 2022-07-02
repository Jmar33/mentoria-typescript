// Refatorando para um arquivo do tipo ts

interface Employee{
    code: number,
    name: string
}

let employee = {} as Employee;
employee.code = 10;
employee.name = "John";