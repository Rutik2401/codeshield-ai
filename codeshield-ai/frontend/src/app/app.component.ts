import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommandPaletteComponent } from './shared/components/command-palette/command-palette.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommandPaletteComponent, AuthModalComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  auth = inject(AuthService);
}
