import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../../models/task.model';

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(tasks: Task[], status: string): Task[] {
    if (!tasks) return [];
    return tasks.filter(task => task.status === status);
  }
} 