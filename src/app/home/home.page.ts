import { Component, OnInit, OnDestroy } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { DatabaseService } from '../service/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  events: any[] = [];
  titulo: string | undefined;
  descripcion: string | undefined;
  fecha: string | undefined;
  lugar: string | undefined;
  photo: string | undefined;
  connectionStatus: string = 'Sin conexión a internet'; // Mensaje inicial
  private syncTimeout: any; // Timeout para ocultar el mensaje de sincronización
  showHeader: boolean = true; // Controla la visibilidad del encabezado
  headerClass: string = 'offline'; // Clase CSS para el encabezado
  syncOnMobileData: boolean = true; // Preferencia del usuario para sincronizar con datos móviles

  constructor(private databaseService: DatabaseService) {
    this.loadEvents();
  }

  async loadEvents() {
    this.events = await this.databaseService.getEvents();
    console.log(this.events);
  }

  async ngOnInit() {
    // Cargar la preferencia del usuario
    try {
      const { value } = await Preferences.get({ key: 'syncOnMobileData' });
      this.syncOnMobileData = value === 'true';
      console.log('Preferencia cargada:', this.syncOnMobileData);
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    }

    this.updateConnectionStatus();

    Network.addListener('networkStatusChange', (status) => {
      this.showHeader = false;
      clearTimeout(this.syncTimeout);
      console.log('Cambio de estado de conexión:', status.connected);
    });
  }

  // Actualiza el mensaje según el estado de conexión
  private async updateConnectionStatus() {
    // Limpiar cualquier timeout previo
    clearTimeout(this.syncTimeout);
    const status = await Network.getStatus();

    if (status.connectionType === 'cellular' && !this.syncOnMobileData) {
      this.connectionStatus = 'Sincronización desactivada con datos';
      this.headerClass = 'offline';
    } else if (
      status.connectionType === 'wifi' ||
      status.connectionType === 'cellular'
    ) {
      this.connectionStatus = 'Sincronizando datos al servidor';
      this.headerClass = 'syncing';
    } else {
      this.connectionStatus = 'No hay conexión a internet';
      this.headerClass = 'offline';
    }

    // Mostrar encabezado y configurar timeout para ocultarlo
    this.showHeader = true;
    console.log('Clase aplicada:', this.headerClass);
    console.log(this.connectionStatus);

    this.syncTimeout = setTimeout(() => {
      this.showHeader = false;
    }, 10000);
  }
  // }
  // Guardar la preferencia del usuario
  async toggleSyncOnMobileData(event: any) {
    this.syncOnMobileData = event.detail.checked;
    console.log('syncOnMobileData actualizado:', this.syncOnMobileData);
    await Preferences.set({
      key: 'syncOnMobileData',
      value: this.syncOnMobileData.toString(),
    });

    this.updateConnectionStatus();
  }

  async syncData() {
    console.log('syncmobiledata:', this.syncOnMobileData);
    this.updateConnectionStatus();
  }

  ngOnDestroy() {
    // Limpia el timeout cuando el componente se destruye
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
  }
}
