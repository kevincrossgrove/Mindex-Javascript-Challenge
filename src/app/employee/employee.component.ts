import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Employee} from '../employee';
import { EmployeeAction } from '../employee-action';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {
  @Input() employee: Employee;
  directReportEmployees: Array<Employee> = [];

  @Output() btnClick: EventEmitter<EmployeeAction> = new EventEmitter();

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.getDirectEmployees();
  }

  // Get employees direct employees. Return immediately if they have none.
  getDirectEmployees(): void {
    if (!this.employee.directReports?.length) return;

    this.employee.directReports.forEach(id => {
      this.employeeService.get(id).subscribe(newEmployee => {
        this.directReportEmployees.push(newEmployee);
      })
    });
  }

  // Emit edit event
  onEdit(selectedEmployee: Employee) {
    this.btnClick.emit({employee: selectedEmployee, action: 1});
  }

  // Emit delete event
  onDelete(selectedEmployee: Employee) {
    this.btnClick.emit({employee: selectedEmployee, action: 2});
  }
}
