import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Página única (navegação por âncoras): o Router foi removido para reduzir o bundle inicial.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
