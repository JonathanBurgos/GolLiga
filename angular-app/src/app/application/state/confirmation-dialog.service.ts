import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationOptions {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly tone?: 'danger' | 'success';
}

export interface ConfirmationRequest extends ConfirmationOptions {
  readonly resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly requestSubject = new BehaviorSubject<ConfirmationRequest | null>(null);
  readonly request$ = this.requestSubject.asObservable();

  confirm(options: ConfirmationOptions): Promise<boolean> {
    this.requestSubject.value?.resolve(false);
    return new Promise(resolve => this.requestSubject.next({ ...options, resolve }));
  }

  close(confirmed: boolean): void {
    const request = this.requestSubject.value;
    if (!request) return;
    this.requestSubject.next(null);
    request.resolve(confirmed);
  }
}
