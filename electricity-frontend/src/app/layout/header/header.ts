import { ChangeDetectorRef, Component, computed, effect, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isLoggedIn = computed(() => !!this.authService.currentUser()?.user_id);

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {
    // This 'effect' runs automatically every time the signal changes
    effect(() => {
      const state = this.isLoggedIn();
      console.log('UI Signal changed to:', state);
      
      // Manually tell Angular: "I don't care what you think, redraw now!"
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.authService.logout();
  }
}
