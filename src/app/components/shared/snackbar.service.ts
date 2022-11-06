import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  SimpleSnackBar,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { IconSnackbarComponent } from './icon-snackbar.component';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(private readonly snackbar: MatSnackBar) {}

  success(text: string, action: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(text, action, {
      panelClass: ['mat-toolbar', 'success-snackbar'],
    });
  }

  warn(text: string, action = ''): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(text, action, {
      panelClass: ['mat-toolbar', 'mat-accent', 'warn-snackbar'],
    });
  }

  error(text: string, action: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(text, action, {
      panelClass: ['mat-toolbar', 'mat-warn'],
    });
  }

  openWithIcon(
    content: string,
    iconCategory: string,
    icon: string,
    color: string
  ): MatSnackBarRef<IconSnackbarComponent> {
    return this.snackbar.openFromComponent(IconSnackbarComponent, {
      panelClass: ['mat-toolbar', 'mat-accent', 'warn-snackbar'],
      data: {
        content,
        icon,
        iconCategory,
        color,
      },
    });
  }
}
