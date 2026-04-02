import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="relative border-t border-gray-200/50 dark:border-slate-700/20 mt-auto">
      <div class="absolute inset-0 bg-white/50 dark:bg-[#0A0F1E]/50 backdrop-blur-sm"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.5 3.64v7.36L12 18.82l-6.5-3.64V7.82L12 4.18z"/>
                  <path d="M12 8a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 003 0v-3A1.5 1.5 0 0012 8zm0 7a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
              </div>
              <span class="font-bold text-gray-900 dark:text-white">CodeShield <span class="text-primary">AI</span></span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              AI-powered code reviewer and security auditor. Review. Audit. Protect.
            </p>
          </div>

          <!-- Quick links -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Product</h4>
            <ul class="space-y-3">
              <li><a routerLink="/reviewer" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Code Reviewer</a></li>
              <li><a routerLink="/dashboard" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Dashboard</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Resources</h4>
            <ul class="space-y-3">
              <li><a href="https://github.com/rutik/codeshield-ai" target="_blank" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="mt-12 pt-6 border-t border-gray-200/50 dark:border-slate-700/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-xs text-gray-400 dark:text-gray-500">&copy; 2026 CodeShield AI. Built by Rutik.</p>
          <div class="flex items-center gap-4">
            <a href="https://github.com/rutik/codeshield-ai" target="_blank"
               class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
