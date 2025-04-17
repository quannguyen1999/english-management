import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  chart: any;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.createChart();
    });
  }

  createChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [
          this.translationService.getTranslation('CHART_MONDAY'),
          this.translationService.getTranslation('CHART_TUESDAY'),
          this.translationService.getTranslation('CHART_WEDNESDAY'),
          this.translationService.getTranslation('CHART_THURSDAY'),
          this.translationService.getTranslation('CHART_FRIDAY')
        ],
        datasets: [{
          label: this.translationService.getTranslation('CHART_HOURS_WORKED'),
          data: [12, 19, 3, 5, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.translationService.getTranslation('CHART_WEEKLY_WORK_HOURS')
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