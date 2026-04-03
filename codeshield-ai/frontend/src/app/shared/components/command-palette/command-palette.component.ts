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
  templateUrl: './command-palette.component.html',
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
