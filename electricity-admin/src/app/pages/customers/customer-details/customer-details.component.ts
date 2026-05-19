import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit {

  customer: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fetchCustomerDetails(id);
    }
  }

  fetchCustomerDetails(id: string): void {

    this.isLoading = true;

    const payload = {
      adminId: this.authService.getUserId(),
      id: Number(id)
    };

    this.api.post('admin/fetch-customer-details', payload).subscribe({

      next: (res: any) => {

        this.customer = res?.data || null;
        console.log(this.customer);        
        this.isLoading = false;
      },

      error: () => {

        this.errorMessage = 'Fehler beim Laden der Kundendetails';

        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

}