import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
})
export class LoaderComponent {
  loader = inject(LoaderService);
}
