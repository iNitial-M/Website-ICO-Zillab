import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export type SnackbarData = {
  content: string;
  icon: string;
  iconCategory: string;
  color: string;
};

@Component({
  selector: 'app-icon-snackbar',
  template: `<span>{{ data.content }}</span>
    <fa-icon
      style="margin-left: 1rem"
      [style.color]="data.color"
      [icon]="[data.iconCategory, data.icon]"
    ></fa-icon>`,
})
export class IconSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
