import { Component, HostListener, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  action: () => void;
  category: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
           (click)="close()"
           style="animation: fadeIn 0.15s ease-out;"></div>

      <!-- Palette -->
      <div class="fixed z-[101] top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg"
           style="animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="mx-4 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 glass-card border border-gray-200/50 dark:border-slate-700/50">
          <!-- Search input -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text"
                   [(ngModel)]="query"
                   placeholder="Type a command..."
                   class="flex-1 bg-transparent text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
                   (keydown.escape)="close()"
                   (keydown.enter)="executeFirst()"
                   (keydown.arrowDown)="moveSelection(1)"
                   (keydown.arrowUp)="moveSelection(-1)"
                   #searchInput>
            <kbd class="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-mono text-gray-400 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-72 overflow-y-auto py-2">
            @for (cmd of filteredCommands(); track cmd.id; let i = $index) {
              <button (click)="execute(cmd)"
                      class="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                      [class]="selectedIndex() === i ? 'bg-primary/8 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'">
                <span class="text-lg shrink-0">{{ cmd.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ cmd.label }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ cmd.category }}</p>
                </div>
                @if (cmd.shortcut) {
                  <kbd class="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-mono text-gray-400 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shrink-0">{{ cmd.shortcut }}</kbd>
                }
              </button>
            }
            @if (filteredCommands().length === 0) {
              <div class="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No commands found
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translate(-50%, -10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `]
})
export class CommandPaletteComponent {
  isOpen = signal(false);
  query = '';
  selectedIndex = signal(0);

  private commands: Command[] = [];
  filteredCommands = signal<Command[]>([]);

  constructor(private router: Router) {
    this.commands = [
      { id: 'review', label: 'Review Code', shortcut: 'Ctrl+Enter', icon: '\u26A1', category: 'Actions', action: () => this.router.navigate(['/reviewer']) },
      { id: 'dashboard', label: 'Open Dashboard', icon: '\uD83D\uDCCA', category: 'Navigation', action: () => this.router.navigate(['/dashboard']) },
      { id: 'home', label: 'Go Home', icon: '\uD83C\uDFE0', category: 'Navigation', action: () => this.router.navigate(['/']) },
      { id: 'theme', label: 'Toggle Theme', icon: '\uD83C\uDF19', category: 'Settings', action: () => document.body.classList.toggle('dark') },
      { id: 'github', label: 'View on GitHub', icon: '\uD83D\uDC19', category: 'Links', action: () => window.open('https://github.com/rutik/codeshield-ai', '_blank') },
    ];
    this.filteredCommands.set(this.commands);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.query = '';
    this.selectedIndex.set(0);
    this.filteredCommands.set(this.commands);
    this.isOpen.set(true);
    setTimeout(() => {
      const input = document.querySelector('app-command-palette input') as HTMLInputElement;
      input?.focus();
    });
  }

  close(): void {
    this.isOpen.set(false);
  }

  execute(cmd: Command): void {
    this.close();
    cmd.action();
  }

  executeFirst(): void {
    const cmds = this.filteredCommands();
    if (cmds.length > 0) {
      this.execute(cmds[this.selectedIndex()]);
    }
  }

  moveSelection(delta: number): void {
    const cmds = this.filteredCommands();
    if (!cmds.length) return;
    const next = (this.selectedIndex() + delta + cmds.length) % cmds.length;
    this.selectedIndex.set(next);
  }

  onQueryChange(): void {
    const q = this.query.toLowerCase();
    if (!q) {
      this.filteredCommands.set(this.commands);
    } else {
      this.filteredCommands.set(this.commands.filter(c =>
        c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      ));
    }
    this.selectedIndex.set(0);
  }
}
