import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {
  chart: any;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.createChart();
    });
  }

  createChart() {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: this.translationService.getTranslation('CHART_TASKS_COMPLETED'),
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: this.translationService.getTranslation('CHART_TASKS_IN_PROGRESS'),
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.translationService.getTranslation('CHART_TASK_PROGRESS')
          }
        },
        scales: {
          y: {
            beginAtZero: true
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
