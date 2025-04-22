import { NgModule } from '@angular/core';
import { RoughBoxDirective } from '../directives/rough-box.directive';

@NgModule({
  imports: [RoughBoxDirective],
  exports: [RoughBoxDirective]
})
export class RoughModule {} 