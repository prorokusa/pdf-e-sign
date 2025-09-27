import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';

// External libraries are loaded via script tags in index.html and accessed via the `window` object.

interface Position {
  x: number;
  y: number;
}

interface PlacedSignature {
  id: number;
  position: Position;
  page: number;
  width: number;
  height: number;
  aspectRatio: number;
}

@Component({
  selector: 'app-root',
  template: `
<div class="h-screen font-sans bg-gray-50 text-gray-800">
  <header class="fixed top-0 left-0 right-0 z-40 flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Left Group: Logo & Title -->
        <div class="flex items-center space-x-3 flex-shrink-0">
          <svg class="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">PDF e-Sign</h1>
        </div>

        <!-- Middle Group: File Info & Page Nav (visible on larger screens) -->
        @if (pdfFile()) {
        <div class="hidden md:flex items-center gap-4 flex-shrink min-w-0">
          <!-- File Info -->
          <div class="flex items-center gap-2 border-r border-gray-200 pr-4 min-w-0">
            <span class="font-medium text-gray-700 truncate" [title]="fileName()">{{ fileName() }}</span>
            <button (click)="resetApp()" title="Загрузить новый PDF" class="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors flex-shrink-0">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0m0 0-3.182-3.182m0-11.667a8.25 8.25 0 0 0-11.667 0M6.168 5.86l-3.182 3.182" />
              </svg>
            </button>
          </div>
          <!-- Page Nav -->
          @if (totalPages() > 1) {
          <div class="flex items-center gap-2">
            <button (click)="goToPreviousPage()" [disabled]="currentPage() === 1" class="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span class="text-sm font-medium text-gray-800 w-24 text-center">Стр. {{ currentPage() }} / {{ totalPages() }}</span>
            <button (click)="goToNextPage()" [disabled]="currentPage() === totalPages()" class="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          }
        </div>
        }

        <!-- Spacer to push right content -->
        <div class="flex-grow"></div>

        <!-- Right Group: Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          @if(pdfFile()) {
            @if (!signatureDataUrl()) {
              <button (click)="openSignatureModal()" class="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.26 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"></path></svg>
                <span>Создать подпись</span>
              </button>
            } @else {
               <button (click)="openSignatureModal()" title="Изменить подпись" class="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                 <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                 <span class="hidden sm:inline">Изменить</span>
               </button>
               <button (click)="togglePlacementMode()" [class]="isPlacingSignature() ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'" class="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md shadow-sm transition-colors" [title]="isPlacingSignature() ? 'Завершить размещение' : 'Начать размещение подписей'">
                 @if (isPlacingSignature()) {
                   <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                   <span class="hidden sm:inline">Готово</span>
                 } @else {
                   <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                   <span class="hidden sm:inline">Добавить</span>
                 }
               </button>
            }
             <button (click)="applyAndDownload()" [disabled]="placedSignatures().length === 0" class="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
               <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
               <span class="hidden sm:inline">Скачать</span>
             </button>
          }
          <button (click)="openHelpModal()" title="Помощь" class="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
            <svg class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="w-full h-full pt-16">
    @if (!pdfFile()) {
      <div class="h-full flex flex-col items-center justify-center p-4">
        <label for="file-upload" class="flex flex-col items-center justify-center w-full max-w-lg p-8 text-center bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 cursor-pointer">
          <svg class="w-16 h-16 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 class="mt-4 text-xl font-medium text-gray-900">Перетащите PDF сюда</h3>
          <p class="mt-2 text-sm text-gray-500">или нажмите, чтобы выбрать файл</p>
          <span class="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            Выбрать файл
          </span>
        </label>
        <input type="file" id="file-upload" class="hidden" (change)="onFileSelected($event)" accept="application/pdf">
      </div>
    } @else {
      <div class="container mx-auto h-full py-4 lg:py-6">
        <div class="h-full flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="flex-grow p-2 bg-gray-100 overflow-auto relative">
            <div id="pdf-viewer" (click)="placeSignatureOnClick($event)" [class.cursor-copy]="isPlacingSignature()">
              <canvas #pdfCanvas id="pdf-canvas" class="rounded-lg shadow-xl"></canvas>
              @for (sig of placedSignatures(); track sig.id) {
              @if (sig.page === currentPage()) {
              <div class="signature-wrapper" [style.left.px]="sig.position.x" [style.top.px]="sig.position.y" [style.width.px]="sig.width" [style.height.px]="sig.height" (mousedown)="dragStart($event, sig)" (touchstart)="dragStart($event, sig)">
                <img [src]="signatureDataUrl()" alt="Подпись" class="w-full h-full object-contain pointer-events-none">
                <div class="delete-signature-btn" (click)="deleteSignature(sig.id, $event)" title="Удалить подпись">&times;</div>
                <div class="resize-handle" (mousedown)="resizeStart($event, sig)" (touchstart)="resizeStart($event, sig)"></div>
              </div>
              }
              }
            </div>
          </div>
          @if (isPlacingSignature()) {
          <div class="flex-shrink-0 p-2 text-center bg-indigo-100 text-indigo-800 text-sm font-medium animate-pulse">
            Нажмите на документ, чтобы разместить подпись.
          </div>
          }
        </div>
      </div>
       <!-- Mobile-only Page Navigation -->
        @if (totalPages() > 1) {
            <div class="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2 p-2 rounded-full bg-gray-900/60 backdrop-blur-sm shadow-xl">
                <button (click)="goToPreviousPage()" [disabled]="currentPage() === 1" class="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                </button>
                <span class="text-sm font-medium text-white w-20 text-center">Стр. {{ currentPage() }} / {{ totalPages() }}</span>
                <button (click)="goToNextPage()" [disabled]="currentPage() === totalPages()" class="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                </button>
            </div>
        }
    }
  </main>
</div>

@if (isSigning()) {
<div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" (click)="closeSignatureModal()">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden h-[85vh] md:h-auto" (click)="$event.stopPropagation()">
    <div class="flex flex-col md:flex-row h-full">
      <!-- Drawing Area -->
      <div class="flex-grow p-3 sm:p-6 flex flex-col gap-3 sm:gap-4 min-h-0">
        <h3 class="text-base sm:text-xl font-semibold text-gray-800">Создайте вашу подпись</h3>
        <!-- Tabs -->
        <div class="flex border-b border-gray-200">
          <button (click)="signatureMode.set('draw')" [class]="signatureMode() === 'draw' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="flex-1 py-2 sm:py-3 px-1 text-center border-b-2 font-medium text-xs sm:text-sm transition-colors">
            Нарисовать
          </button>
          <button (click)="signatureMode.set('upload')" [class]="signatureMode() === 'upload' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="flex-1 py-2 sm:py-3 px-1 text-center border-b-2 font-medium text-xs sm:text-sm transition-colors">
            Загрузить
          </button>
        </div>

        @if(signatureMode() === 'draw') {
        <div class="relative bg-gray-100 rounded-lg flex-grow w-full min-h-[240px] sm:min-h-[320px]">
          <canvas #signatureCanvas class="absolute top-0 left-0 w-full h-full rounded-lg touch-none"></canvas>
        </div>
        }
        @if(signatureMode() === 'upload') {
        <div class="relative bg-gray-100 rounded-lg flex-grow w-full min-h-[220px] sm:min-h-[256px]">
          <label for="upload-signature-image" class="flex flex-col items-center justify-center w-full h-full p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer">
            <svg class="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-700">Загрузите изображение</h3>
            <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF</p>
          </label>
          <input type="file" id="upload-signature-image" class="hidden" (change)="onSignatureImageSelected($event)" accept="image/*">
        </div>
        }
      </div>

      <!-- Settings & Actions Panel -->
      @if(signatureMode() === 'draw') {
      <div class="w-full md:w-64 flex-shrink-0 bg-gray-50 md:border-l border-t md:border-t-0 border-gray-200 p-3 sm:p-6 flex flex-col">
        <div class="flex-1 space-y-4 sm:space-y-6">
          <h4 class="text-sm sm:text-base font-semibold text-gray-800">Настройки кисти</h4>

          <!-- Thickness -->
          <div>
            <label for="pen-thickness" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Толщина: {{ penThickness().toFixed(1) }}</label>
            <input id="pen-thickness" type="range" [value]="penThickness()" (input)="setPenThickness($event)" min="0.5" max="5" step="0.1" class="w-full h-2 sm:h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
          </div>

          <!-- Color -->
          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Цвет</label>
            <div class="flex items-center justify-between gap-2">
              @for(color of availablePenColors; track color) {
              <button (click)="setPenColor(color)" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-offset-2 ring-indigo-500 transition-all flex items-center justify-center" [class.ring-2]="penColor() === color" [style.backgroundColor]="color">
                @if (penColor() === color) {
                <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                }
              </button>
              }
            </div>
          </div>
        </div>
        
        <div class="space-y-2.5 sm:space-y-3 mt-4 sm:mt-6">
          <button (click)="clearSignature()" class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors">Очистить</button>
          <button (click)="saveSignature()" class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Сохранить подпись</button>
        </div>
      </div>
      }
    </div>
    <button (click)="closeSignatureModal()" class="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
      <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>
}

@if (isCropping()) {
<div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 text-center">
    <h3 class="text-xl font-medium leading-6 text-gray-900 mb-2">Обрежьте изображение</h3>
    <p class="text-sm text-gray-500 mb-4">Выделите мышью область, содержащую только вашу подпись.</p>
    <div class="w-full h-64 md:h-80 bg-gray-200 rounded-lg overflow-hidden flex items-centerjustify-center">
      <canvas #croppingCanvas class="touch-none" (mousedown)="onCropMouseDown($event)" (touchstart)="onCropMouseDown($event)" (mousemove)="onCropMouseMove($event)" (touchmove)="onCropMouseMove($event)" (mouseup)="onCropMouseUp($event)" (touchend)="onCropMouseUp($event)" (mouseleave)="onCropMouseUp($event)"></canvas>
    </div>
    <div class="flex justify-end space-x-3 mt-6">
      <button (click)="cancelCrop()" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors">Отмена</button>
      <button (click)="applyCropAndSave()" class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transition-colors">Применить и сохранить</button>
    </div>
  </div>
</div>
}

@if (isHelpVisible()) {
<div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50" (click)="closeHelpModal()">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 relative" (click)="$event.stopPropagation()">
    <h3 class="text-xl font-semibold text-gray-900 mb-4">Как пользоваться</h3>
    <ol class="list-decimal list-inside space-y-3 text-gray-600">
      <li><span class="font-semibold">Загрузите PDF:</span> Нажмите кнопку "Выбрать файл" и выберите PDF-документ с вашего устройства.</li>
      <li><span class="font-semibold">Создайте подпись:</span> Нажмите "Создать подпись". Вы можете нарисовать её мышью/пальцем или загрузить готовое изображение подписи.</li>
      <li><span class="font-semibold">Разместите подпись:</span> После создания подписи активируется режим добавления. Просто нажмите на любое место в документе, чтобы разместить подпись.</li>
      <li><span class="font-semibold">Редактируйте:</span> Вы можете перемещать подпись по странице, а также изменять её размер, потянув за правый нижний угол.</li>
      <li><span class="font-semibold">Добавьте ещё:</span> Используйте кнопку "Добавить", чтобы снова войти в режим вставки и разместить больше подписей.</li>
      <li><span class="font-semibold">Скачайте документ:</span> Когда всё будет готово, нажмите "Скачать", чтобы сохранить подписанный PDF-файл.</li>
    </ol>
    <button (click)="closeHelpModal()" class="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
      <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>
}

@if (isLoading()) {
<div class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
  <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  <p class="mt-4 text-gray-700 font-medium">{{ loadingMessage() }}</p>
</div>
}
  `,
  styles: [`
    #pdf-canvas {
      width: 100%;
      height: auto;
    }
    .signature-wrapper {
        position: absolute;
        cursor: move;
        border: 2px dashed transparent;
        user-select: none;
        transition: border-color 0.2s ease-in-out;
    }
    .signature-wrapper:hover {
      border-color: #4f46e5; /* indigo-600 */
    }
    .signature-wrapper img {
      display: block; /* remove bottom space from inline image */
    }
    .delete-signature-btn {
      position: absolute;
      top: -12px;
      right: -12px;
      background-color: #4338ca; /* indigo-700 */
      color: white;
      border-radius: 9999px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      font-weight: bold;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      transform: scale(0.8);
      z-index: 10;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    .signature-wrapper:hover .delete-signature-btn {
      opacity: 1;
      transform: scale(1);
    }
    .resize-handle {
      position: absolute;
      bottom: -8px;
      right: -8px;
      width: 16px;
      height: 16px;
      background-color: #4338ca; /* indigo-700 */
      border: 3px solid white;
      border-radius: 6px;
      cursor: se-resize;
      opacity: 0;
      transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      transform: scale(0.8);
      z-index: 10;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
    .signature-wrapper:hover .resize-handle {
      opacity: 1;
      transform: scale(1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:mousemove)': 'onDrag($event)',
    '(window:touchmove)': 'onDrag($event)',
    '(window:mouseup)': 'onEndInteraction($event)',
    '(window:touchend)': 'onEndInteraction($event)',
  },
})
export class AppComponent {
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('croppingCanvas') croppingCanvas!: ElementRef<HTMLCanvasElement>;

  // --- Signals for State Management ---
  fileName = signal<string>('');
  pdfFile = signal<File | null>(null);
  pdfDoc = signal<any>(null); // Holds the loaded PDF document object
  pdfPage = signal<any>(null); // Holds the current PDF page object
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);

  signaturePad: any = null;
  signatureDataUrl = signal<string | null>(null);
  trimmedSignatureSize = signal<{ width: number; height: number; aspectRatio: number } | null>(null);
  placedSignatures = signal<PlacedSignature[]>([]);

  isSigning = signal<boolean>(false);
  signatureMode = signal<'draw' | 'upload'>('draw');
  isCropping = signal<boolean>(false);
  croppingImageUrl = signal<string | null>(null);
  isHelpVisible = signal<boolean>(false);
  isPlacingSignature = signal<boolean>(false);
  
  // --- Signature Settings Signals ---
  penColor = signal<string>('rgb(79, 70, 229)'); // Default Indigo
  penThickness = signal<number>(1.0); // Default thickness
  
  availablePenColors = [
    'rgb(79, 70, 229)',  // Indigo
    'rgb(15, 23, 42)',   // Slate-900 (Black)
    'rgb(220, 38, 38)',  // Red-600
    'rgb(5, 150, 105)'   // Emerald-600
  ];

  isLoading = signal<boolean>(false);
  loadingMessage = signal<string>('');
  
  // --- Interaction State ---
  draggedSignature = signal<{ signature: PlacedSignature; startPos: Position; eventStartPos: Position } | null>(null);
  resizingSignature = signal<{ signature: PlacedSignature; startSize: {width: number, height: number}; eventStartPos: Position } | null>(null);
  private interactionOccurred = false;

  // --- Cropping State ---
  private cropStartPos: Position | null = null;
  private cropEndPos: Position | null = null;
  private isDrawingCrop = false;
  private originalImageForCrop: HTMLImageElement | null = null;
  
  // --- PDF.js Configuration ---
  private static pdfJsInitPromise: Promise<void> | null = null;
  private readonly pdfRenderScale = 1.5;

  constructor() {
    effect(() => {
      const pdf = this.pdfFile();
      if (pdf) {
        this.loadPdf(pdf);
      }
    });

    effect(() => {
      if (this.isCropping() && this.croppingImageUrl()) {
        setTimeout(() => this.initCroppingCanvas(), 0);
      }
    });

    // Effect to update signature pad settings in real-time
    effect(() => {
        if (this.signaturePad) {
            this.signaturePad.penColor = this.penColor();
            this.signaturePad.maxWidth = this.penThickness();
        }
    });

    effect(() => {
      // Re-render the PDF page whenever the current page number changes
      const pageNum = this.currentPage();
      const doc = this.pdfDoc();
      if (pageNum && doc) {
        this.renderCurrentPage();
      }
    });
  }

  private initializePdfJs(): Promise<void> {
    if (AppComponent.pdfJsInitPromise) {
      return AppComponent.pdfJsInitPromise;
    }
    AppComponent.pdfJsInitPromise = new Promise((resolve, reject) => {
      const checkLibrary = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
            resolve();
          } catch (e) {
             console.error('Error setting up pdf.js worker', e);
             reject(e);
          }
        } else {
          setTimeout(checkLibrary, 100); // Check every 100ms
        }
      };
      checkLibrary();
    });
    return AppComponent.pdfJsInitPromise;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      alert('Пожалуйста, выберите PDF файл.');
      return;
    }
    this.resetApp();
    this.pdfFile.set(file);
    this.fileName.set(file.name);
  }
  
  private async loadPdf(file: File) {
    this.isLoading.set(true);
    this.loadingMessage.set('Загрузка PDF...');
    try {
      await this.initializePdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      this.pdfDoc.set(pdf);
      this.totalPages.set(pdf.numPages);
      this.currentPage.set(1); // Triggers effect to render page 1
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Не удалось загрузить PDF файл.');
      this.resetApp();
    } finally {
      this.isLoading.set(false);
    }
  }

  async renderCurrentPage() {
    if (!this.pdfDoc() || !this.pdfCanvas) return;
    this.isLoading.set(true);
    this.loadingMessage.set(`Отрисовка страницы ${this.currentPage()}...`);
    try {
      const page = await this.pdfDoc().getPage(this.currentPage());
      this.pdfPage.set(page);
      const viewport = page.getViewport({ scale: this.pdfRenderScale });
      const canvas = this.pdfCanvas.nativeElement;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get 2D context from canvas.');
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering PDF:', error);
      alert(`Не удалось отобразить страницу ${this.currentPage()}.`);
    } finally {
      this.isLoading.set(false);
    }
  }

  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  openSignatureModal() {
    this.isSigning.set(true);
    setTimeout(() => this.initSignaturePad(), 0);
  }
  
  closeSignatureModal() {
    this.isSigning.set(false);
    this.signaturePad = null;
  }

  initSignaturePad() {
    if (this.signatureCanvas && this.signatureMode() === 'draw') {
        const canvas = this.signatureCanvas.nativeElement;
        // Use a timeout to ensure the modal animation is complete and dimensions are stable.
        setTimeout(() => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const rect = parent.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                console.warn("Signature canvas parent has no dimensions.");
                return;
            }
            
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = rect.width * ratio;
            canvas.height = rect.height * ratio;
            canvas.getContext('2d')?.scale(ratio, ratio);

            this.signaturePad = new (window as any).SignaturePad(canvas, {
                penColor: this.penColor(),
                minWidth: 0.5,
                maxWidth: this.penThickness(),
            });
        }, 100); // 100ms should be safe for animations to finish.
    }
  }

  clearSignature() {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  async saveSignature() {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      alert('Пожалуйста, сначала поставьте подпись.');
      return;
    }
    const dataUrl = this.signaturePad.toDataURL('image/png');
    this.isLoading.set(true);
    this.loadingMessage.set('Обработка подписи...');
    try {
      await this.finalizeSignature(dataUrl);
      this.closeSignatureModal();
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("Не удалось сохранить подпись.");
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSignatureImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (typeof e.target?.result !== 'string') {
        alert('Не удалось прочитать файл изображения.');
        return;
      }
      this.croppingImageUrl.set(e.target.result);
      this.isSigning.set(false);
      this.isCropping.set(true);
      input.value = '';
    };

    reader.onerror = () => {
      alert('Ошибка при чтении файла.');
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  private processSignatureImage(
    dataUrl: string
  ): Promise<{ dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return reject(new Error('Could not get context for processing'));
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        let minX = tempCanvas.width, minY = tempCanvas.height, maxX = -1, maxY = -1;
        for (let y = 0; y < tempCanvas.height; y++) {
          for (let x = 0; x < tempCanvas.width; x++) {
            if (data[(y * tempCanvas.width + x) * 4 + 3] > 0) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }
        if (maxX === -1) {
          resolve({ dataUrl: '', width: 0, height: 0 });
          return;
        }

        const trimmedWidth = maxX - minX + 1;
        const trimmedHeight = maxY - minY + 1;
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = trimmedWidth;
        finalCanvas.height = trimmedHeight;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return reject(new Error('Could not get final context'));
        
        finalCtx.drawImage(tempCanvas, minX, minY, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);
        
        resolve({
          dataUrl: finalCanvas.toDataURL('image/png'),
          width: trimmedWidth,
          height: trimmedHeight,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  private async finalizeSignature(dataUrl: string) {
      const processed = await this.processSignatureImage(dataUrl);
      if (processed.width === 0) {
        throw new Error('Не удалось обработать изображение. Возможно, оно полностью прозрачно.');
      }

      const newAspectRatio = processed.width / processed.height;

      this.signatureDataUrl.set(processed.dataUrl);
      this.trimmedSignatureSize.set({ 
        width: processed.width, 
        height: processed.height,
        aspectRatio: newAspectRatio
      });
      
      this.isPlacingSignature.set(true);

      this.placedSignatures.update(sigs => 
        sigs.map(s => ({
          ...s,
          aspectRatio: newAspectRatio,
          height: s.width / newAspectRatio
        }))
      );
  }

  placeSignatureOnClick(event: MouseEvent) {
    if (this.interactionOccurred) return;
    if ((event.target as HTMLElement).closest('.signature-wrapper, .pdf-controls')) return;

    if (this.isPlacingSignature() && this.signatureDataUrl() && this.trimmedSignatureSize()) {
      const sizeInfo = this.trimmedSignatureSize()!;
      
      const canvasElement = this.pdfCanvas.nativeElement;
      const defaultWidth = canvasElement.offsetWidth * 0.15;
      const defaultHeight = defaultWidth / sizeInfo.aspectRatio;

      const viewer = event.currentTarget as HTMLElement;
      const scrollParent = viewer.parentElement;

      if (!scrollParent) return;

      const rect = viewer.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Use the parent's scroll offsets for accurate positioning
      const finalX = x + scrollParent.scrollLeft;
      const finalY = y + scrollParent.scrollTop;

      const newSignature: PlacedSignature = {
        id: Date.now(),
        page: this.currentPage(),
        position: { x: finalX - defaultWidth / 2, y: finalY - defaultHeight / 2 },
        width: defaultWidth,
        height: defaultHeight,
        aspectRatio: sizeInfo.aspectRatio,
      };
      this.placedSignatures.update(sigs => [...sigs, newSignature]);
    }
  }

  deleteSignature(idToDelete: number, event: MouseEvent) {
    event.stopPropagation();
    this.placedSignatures.update(sigs => sigs.filter(s => s.id !== idToDelete));
  }

  async applyAndDownload() {
    if (!this.pdfFile() || !this.signatureDataUrl() || this.placedSignatures().length === 0) {
        alert("Пожалуйста, создайте и разместите хотя бы одну подпись перед скачиванием.");
        return;
    }
    this.isLoading.set(true);
    this.loadingMessage.set('Применение подписей...');
    try {
        const { PDFDocument } = (window as any).PDFLib;
        const existingPdfBytes = await this.pdfFile()!.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pngImageBytes = await fetch(this.signatureDataUrl()!).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngImageBytes);

        const signaturesByPage = new Map<number, PlacedSignature[]>();
        this.placedSignatures().forEach(sig => {
            if (!signaturesByPage.has(sig.page)) signaturesByPage.set(sig.page, []);
            signaturesByPage.get(sig.page)!.push(sig);
        });
        
        const canvas = this.pdfCanvas.nativeElement;

        for (const [pageNum, signatures] of signaturesByPage.entries()) {
            const pageToSign = pdfDoc.getPages()[pageNum - 1];
            const pdfJsPage = await this.pdfDoc().getPage(pageNum);
            const viewport = pdfJsPage.getViewport({ scale: this.pdfRenderScale });

            const scaleFactor = viewport.width / canvas.offsetWidth;
            const { height: pageHeightInPoints } = pageToSign.getSize();

            for (const sig of signatures) {
                const canvasX = sig.position.x * scaleFactor;
                const canvasY = sig.position.y * scaleFactor;
                const canvasWidth = sig.width * scaleFactor;
                const canvasHeight = sig.height * scaleFactor;

                const pointX = canvasX / this.pdfRenderScale;
                const pointWidth = canvasWidth / this.pdfRenderScale;
                const pointHeight = canvasHeight / this.pdfRenderScale;
                const pointY = pageHeightInPoints - (canvasY / this.pdfRenderScale) - pointHeight;

                pageToSign.drawImage(pngImage, {
                    x: pointX,
                    y: pointY,
                    width: pointWidth,
                    height: pointHeight,
                });
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        const originalName = this.fileName();
        const dotIndex = originalName.lastIndexOf('.');
        const newFileName = dotIndex !== -1
            ? `${originalName.substring(0, dotIndex)}_подписан${originalName.substring(dotIndex)}`
            : `${originalName}_подписан`;

        this.download(pdfBytes, newFileName, 'application/pdf');
    } catch (error) {
        console.error("Error applying signature:", error);
        alert("Не удалось применить подпись к PDF.");
    } finally {
        this.isLoading.set(false);
    }
  }
  
  download(data: Uint8Array, filename: string, type: string) {
      const blob = new Blob([data as any], { type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  }

  // --- Drag and Resize ---
  private getClientCoords(event: MouseEvent | TouchEvent): Position {
    if ('touches' in event) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  dragStart(event: MouseEvent | TouchEvent, signature: PlacedSignature) {
    this.interactionOccurred = true;
    event.preventDefault();
    event.stopPropagation();
    const eventPos = this.getClientCoords(event);
    this.draggedSignature.set({ signature, startPos: { ...signature.position }, eventStartPos: eventPos });
  }

  resizeStart(event: MouseEvent | TouchEvent, signature: PlacedSignature) {
    this.interactionOccurred = true;
    event.preventDefault();
    event.stopPropagation();
    const eventPos = this.getClientCoords(event);
    this.resizingSignature.set({ signature, startSize: { width: signature.width, height: signature.height }, eventStartPos: eventPos });
  }

  onDrag(event: MouseEvent | TouchEvent) {
    const eventPos = this.getClientCoords(event);
    
    const currentDrag = this.draggedSignature();
    if (currentDrag) {
      const dx = eventPos.x - currentDrag.eventStartPos.x;
      const dy = eventPos.y - currentDrag.eventStartPos.y;
      this.placedSignatures.update(signatures => 
        signatures.map(s => 
          s.id === currentDrag.signature.id 
            ? { ...s, position: { x: currentDrag.startPos.x + dx, y: currentDrag.startPos.y + dy } }
            : s
        )
      );
      return;
    }

    const currentResize = this.resizingSignature();
    if (currentResize) {
      const dx = eventPos.x - currentResize.eventStartPos.x;
      const newWidth = Math.max(20, currentResize.startSize.width + dx);
      const newHeight = newWidth / currentResize.signature.aspectRatio;
      this.placedSignatures.update(signatures =>
        signatures.map(s =>
          s.id === currentResize.signature.id
            ? { ...s, width: newWidth, height: newHeight }
            : s
        )
      );
    }
  }

  onEndInteraction(event: MouseEvent | TouchEvent) {
    this.draggedSignature.set(null);
    this.resizingSignature.set(null);
    setTimeout(() => { this.interactionOccurred = false; }, 0);
  }
  
  // --- Signature Settings Methods ---
  setPenColor(color: string) {
    this.penColor.set(color);
  }

  setPenThickness(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.penThickness.set(parseFloat(value));
  }

  // --- Cropping Logic ---
  initCroppingCanvas() {
    if (!this.croppingCanvas) return;
    const img = new Image();
    img.onload = () => {
        this.originalImageForCrop = img;
        const canvas = this.croppingCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const container = canvas.parentElement!;
        const canvasWidth = container.offsetWidth;
        const canvasHeight = container.offsetHeight;

        const hRatio = canvasWidth / img.width;
        const vRatio = canvasHeight / img.height;
        const ratio = Math.min(hRatio, vRatio);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = this.croppingImageUrl()!;
  }

  private getCanvasRelativeCoords(canvasEl: HTMLCanvasElement, event: MouseEvent | TouchEvent): Position {
      const rect = canvasEl.getBoundingClientRect();
      const clientPos = this.getClientCoords(event);
      return {
          x: clientPos.x - rect.left,
          y: clientPos.y - rect.top,
      };
  }
  
  onCropMouseDown(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDrawingCrop = true;
    this.cropStartPos = this.getCanvasRelativeCoords(this.croppingCanvas.nativeElement, event);
    this.cropEndPos = this.cropStartPos;
  }
  
  onCropMouseMove(event: MouseEvent | TouchEvent) {
    if (!this.isDrawingCrop) return;
    event.preventDefault();
    this.cropEndPos = this.getCanvasRelativeCoords(this.croppingCanvas.nativeElement, event);
    this.redrawCroppingCanvas();
  }

  onCropMouseUp(event: MouseEvent | TouchEvent) {
    if (!this.isDrawingCrop) return;
    event.preventDefault();
    this.isDrawingCrop = false;
    this.redrawCroppingCanvas();
  }

  redrawCroppingCanvas() {
      if (!this.croppingCanvas || !this.originalImageForCrop) return;
      const canvas = this.croppingCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.originalImageForCrop, 0, 0, canvas.width, canvas.height);

      if (this.cropStartPos && this.cropEndPos) {
          ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
          ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
          ctx.lineWidth = 2;
          const rectX = Math.min(this.cropStartPos.x, this.cropEndPos.x);
          const rectY = Math.min(this.cropStartPos.y, this.cropEndPos.y);
          const rectW = Math.abs(this.cropStartPos.x - this.cropEndPos.x);
          const rectH = Math.abs(this.cropStartPos.y - this.cropEndPos.y);
          ctx.fillRect(rectX, rectY, rectW, rectH);
          ctx.strokeRect(rectX, rectY, rectW, rectH);
      }
  }

  cancelCrop() {
    this.isCropping.set(false);
    this.croppingImageUrl.set(null);
    this.cropStartPos = null;
    this.cropEndPos = null;
    this.originalImageForCrop = null;
    this.isDrawingCrop = false;
  }

  async applyCropAndSave() {
    if (!this.cropStartPos || !this.cropEndPos || !this.originalImageForCrop) {
        alert('Пожалуйста, выделите область с подписью.');
        return;
    }
    this.isLoading.set(true);
    this.loadingMessage.set('Обработка подписи...');

    setTimeout(async () => {
        try {
            const canvas = this.croppingCanvas.nativeElement;
            const scaleRatio = this.originalImageForCrop!.width / canvas.width;

            const cropX = Math.min(this.cropStartPos!.x, this.cropEndPos!.x) * scaleRatio;
            const cropY = Math.min(this.cropStartPos!.y, this.cropEndPos!.y) * scaleRatio;
            const cropW = Math.abs(this.cropStartPos!.x - this.cropEndPos!.x) * scaleRatio;
            const cropH = Math.abs(this.cropStartPos!.y - this.cropEndPos!.y) * scaleRatio;

            if (cropW < 10 || cropH < 10) {
                alert('Выделенная область слишком мала. Пожалуйста, выделите большую область.');
                return;
            }
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropW;
            tempCanvas.height = cropH;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) throw new Error('Could not create temporary canvas context');

            tempCtx.drawImage(this.originalImageForCrop!, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            
            const croppedDataUrl = tempCanvas.toDataURL('image/png');
            
            const cleanedDataUrl = await this._removeBackgroundAlgorithmically(croppedDataUrl);
            
            await this.finalizeSignature(cleanedDataUrl);
            this.cancelCrop();
        } catch(error) {
            console.error("Error processing signature:", error);
            alert(`Не удалось обработать подпись: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            this.isLoading.set(false);
        }
    }, 10);
  }

  private _removeBackgroundAlgorithmically(base64ImageDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          return reject(new Error('Could not get canvas context for background removal'));
        }
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          const getPixel = (x: number, y: number) => {
            const i = (y * canvas.width + x) * 4;
            return { r: data[i], g: data[i + 1], b: data[i + 2] };
          };
          
          const cornerPixels = [
              getPixel(0, 0),
              getPixel(canvas.width - 1, 0),
              getPixel(0, canvas.height - 1),
              getPixel(canvas.width - 1, canvas.height - 1)
          ];

          const avgBackground = cornerPixels.reduce((acc, p) => ({
              r: acc.r + p.r / cornerPixels.length,
              g: acc.g + p.g / cornerPixels.length,
              b: acc.b + p.b / cornerPixels.length,
          }), { r: 0, g: 0, b: 0 });
          
          const outputImageData = ctx.createImageData(canvas.width, canvas.height);
          const outputData = outputImageData.data;
          
          const colorDistanceThreshold = 80;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) {
                outputData[i] = 0; outputData[i+1] = 0; outputData[i+2] = 0; outputData[i+3] = 0;
                continue;
            }

            const distance = Math.sqrt(
              Math.pow(r - avgBackground.r, 2) +
              Math.pow(g - avgBackground.g, 2) +
              Math.pow(b - avgBackground.b, 2)
            );

            if (distance > colorDistanceThreshold) {
              // Signature pixel: preserve original color and alpha for smooth edges
              outputData[i] = r;
              outputData[i + 1] = g;
              outputData[i + 2] = b;
              outputData[i + 3] = a;
            } else {
              // Background pixel: make fully transparent
              outputData[i] = 0; outputData[i+1] = 0; outputData[i+2] = 0; outputData[i+3] = 0;
            }
          }
          
          const resultCanvas = document.createElement('canvas');
          resultCanvas.width = canvas.width;
          resultCanvas.height = canvas.height;
          const resultCtx = resultCanvas.getContext('2d');
          if (!resultCtx) return reject(new Error('Could not get final canvas context'));
          
          resultCtx.putImageData(outputImageData, 0, 0);
          resolve(resultCanvas.toDataURL('image/png'));

        } catch (e) {
          console.error('Error during algorithmic background removal:', e);
          resolve(base64ImageDataUrl);
        }
      };
      img.onerror = () => {
          reject(new Error('Failed to load image for background removal'));
      };
      img.src = base64ImageDataUrl;
    });
  }

  // --- Help Modal Methods ---
  openHelpModal() {
    this.isHelpVisible.set(true);
  }

  closeHelpModal() {
    this.isHelpVisible.set(false);
  }

  // --- App State Methods ---
  resetApp() {
    this.pdfFile.set(null);
    this.fileName.set('');
    this.pdfDoc.set(null);
    this.pdfPage.set(null);
    this.currentPage.set(1);
    this.totalPages.set(0);
    this.signatureDataUrl.set(null);
    this.placedSignatures.set([]);
    this.trimmedSignatureSize.set(null);
    this.isPlacingSignature.set(false);
  }

  togglePlacementMode() {
    if (this.signatureDataUrl()) {
      this.isPlacingSignature.update(v => !v);
    }
  }
}
