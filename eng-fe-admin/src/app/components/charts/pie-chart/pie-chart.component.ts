import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
  chart: any;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.createChart();
    });
  }

  createChart() {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: [
          this.translationService.getTranslation('CHART_COMPLETED'),
          this.translationService.getTranslation('CHART_IN_PROGRESS'),
          this.translationService.getTranslation('CHART_PENDING')
        ],
        datasets: [{
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(255, 99, 132)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.translationService.getTranslation('CHART_TASK_DISTRIBUTION')
          }
        }
      }
    };

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(canvas, config);
  }
}
