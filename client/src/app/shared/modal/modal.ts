import {
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  model,
  output,
  viewChild,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private modelRef = viewChild.required<ElementRef<HTMLDialogElement>>('commonModal');
  isOpen = model<boolean>(false);
  title = input<string>('');

  @HostListener('close', ['$event'])
  onNativeClose(event: Event) {
    this.close();
  }

  constructor() {
    effect(() => {
      const dialog = this.modelRef().nativeElement;
      if (this.isOpen()) {
        dialog.showModal();
      } else {
        dialog.close();
        this.close();
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }
}
