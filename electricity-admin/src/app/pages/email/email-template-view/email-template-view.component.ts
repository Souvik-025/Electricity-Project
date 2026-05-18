import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-template-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-template-view.component.html',
  styleUrl: './email-template-view.component.css'
})
export class EmailTemplateViewComponent {

  emailData: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    this.http.get(
      `http://localhost:8080/email-management/${id}`
    ).subscribe({

      next: (res: any) => {

        this.emailData = res;

        console.log(this.emailData);

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

}