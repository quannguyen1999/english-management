import { Component } from '@angular/core';
import { LineChartComponent } from '../charts/line-chart/line-chart.component';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LineChartComponent,
    PieChartComponent,
    BarChartComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  isExpandedSidebar = false;

  
  constructor(

    private sidebarService: SidebarService
  ) {
   
  }

  ngOnInit(): void {
    this.sidebarService.isExpanded$.subscribe(
      isExpanded => this.isExpandedSidebar = isExpanded
    );
  }
}
