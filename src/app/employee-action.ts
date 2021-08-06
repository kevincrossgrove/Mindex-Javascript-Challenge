import { Employee } from "./employee";

export interface EmployeeAction {
    employee: Employee,
    action: number
}