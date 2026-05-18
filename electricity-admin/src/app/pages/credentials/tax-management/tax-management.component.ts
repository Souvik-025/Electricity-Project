import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-tax-management',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './tax-management.component.html',
  styleUrl: './tax-management.component.css',
})
export class TaxManagementComponent implements OnInit{
   taxValue: string = "";
  successMessage: string = '';
  isError: boolean = false;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.http
      .get<any>('http://localhost:8080/tax-management/latest')
      .subscribe({
        next: (res) => {

          if (res) {
            this.taxValue = res.value.toString();
          }

        },
        error: (err) => {
          console.log(err);
        }
      });

  }

  saveTax() {
    if (!this.taxValue || !this.taxValue.trim()) {
      this.successMessage = 'Field is empty';
      this.isError = true;
      setTimeout(() => {
        this.successMessage = '';
      }, 3000)
      return;
    }
    
    if (isNaN(parseFloat(this.taxValue))) {
      this.successMessage = 'Please enter a valid number';
      this.isError = true;
      setTimeout(() => {
        this.successMessage = '';
      }, 3000)
      return;
    }
    
    const body = {
      value: parseFloat(this.taxValue),
      createdBy: 'Admin'
    };
    this.http.post('http://localhost:8080/tax-management/save', body)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.successMessage = 'Saved Successfully';
          this.isError = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000)
        },
        error: (err) => {
          console.log(err);
          alert('Something went wrong');
        }
      });

  }

  cancelTaxForm() {
    this.taxValue = '';
    this.successMessage = '';
  }
}

