import {Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {catchError, map, reduce} from 'rxjs/operators';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';

import {Employee} from '../employee';
import { EmployeeAction } from '../employee-action';
import {EmployeeService} from '../employee.service';

enum CrudAction {
  Edit = 1,
  Delete = 2   
}

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  errorMessage: string;

  constructor(private employeeService: EmployeeService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getAllEmployees();
  }
  
  private getAllEmployees() {
    this.employeeService.getAll()
    .pipe(
      reduce((emps, e: Employee) => emps.concat(e), []),
      map(emps => this.employees = emps),
      catchError(this.handleError.bind(this))
    ).subscribe();
  }

  private handleError(e: Error | any): string {
    console.error(e);
    return this.errorMessage = e.message || 'Unable to retrieve employees';
  }

  // Handle the event created by the child component employee
  handleEventAction(eventData: EmployeeAction) {

    switch(eventData.action) {
      
      case CrudAction.Edit:
        let editDialogRef = this.dialog.open(EditDialogComponent, { 
          data: { name: eventData.employee.firstName + ' ' + eventData.employee.lastName,
                  position: eventData.employee.position, 
                  comp: eventData.employee.compensation }
        });
        editDialogRef.afterClosed().subscribe(result => {
          if (result) eventData.employee.compensation = result;
          this.employeeService.save(eventData.employee).subscribe(updatedEmployee => console.log('Updated Employee', updatedEmployee));
        });
        break;

      case CrudAction.Delete:
        let deleteDialogRef = this.dialog.open(DeleteDialogComponent, { 
          data: { name: eventData.employee.firstName + ' ' + eventData.employee.lastName }
        });
        // DeleteDialogComponent will return either true, false, or undefined. Delete if true.
        deleteDialogRef.afterClosed().subscribe(deleteConfirmed => {
          if (deleteConfirmed) {
            this.employeeService.remove(eventData.employee).subscribe(() => {
              console.log('Successfully Deleted', eventData.employee.firstName, eventData.employee.lastName);
              this.updateDirectReports(eventData.employee.id);
            });
          } 
        });
        break;

      default:
        console.error('Invalid Employee Action called.');
        break;
    }
  }

  // Handle Direct Report Updates
  updateDirectReports(deletedId: number) {
    // Update direct report arrays for every employee that contains deleted employee id.
    this.employees.forEach(emp => {
      let foundIndex = -1;
      if (emp.directReports !== undefined) foundIndex = emp.directReports?.indexOf(deletedId);
      
      if (foundIndex != -1) {
        emp.directReports.splice(foundIndex, 1);
        this.employeeService.save(emp).subscribe(() => {
          this.getAllEmployees();
        });
      }
    });
  }

}
