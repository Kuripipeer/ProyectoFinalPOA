import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db: SQLiteDBConnection | undefined;
  private sqlite: SQLiteConnection | undefined;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializateDataBase() {
    try {
      const dbname = 'base_db';
      const isWeb = Capacitor.getPlatform() === 'web';
      this.db = await this.sqlite?.createConnection(
        dbname,
        isWeb,
        'no-encryption',
        1,
        false
      );

      if (this.db) {
        await this.db.open();
        console.log('database ------------- created');
      }

      const createTable = `
    CREATE TABLE IF NOT EXISTS events(
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      lugar TEXT NOT NULL,
      imagen TEXT NOT NULL
    );
    `;
      await this.db?.execute(createTable);
      console.log('table ------------- created');
    } catch (e) {
      console.error('******** Error initializing database', e);
    }
  }

  async addEvent(
    titulo: string,
    descripcion: string,
    fecha: string,
    lugar: string,
    imagen: string
  ) {
    try {
      const query = `
      INSERT INTO events(titulo, descripcion, fecha, lugar, imagen) VALUES(?, ?, ?, ?, ?);
      `;
      await this.db?.run(query, [titulo, descripcion, fecha, lugar, imagen]);
      console.log('event ------------- added');
    } catch (e) {
      console.error('******** Error adding event', e);
    }
  }

  async getEvents() {
    try {
      const query = `
      SELECT * FROM events;
      `;
      const result = await this.db?.query(query);
      return result?.values || [];
    } catch (e) {
      console.error('******** Error getting events', e);
      return [];
    }
  }

  async updateEvent(
    id: number,
    titulo: string,
    descripcion: string,
    fecha: string,
    lugar: string,
    imagen: string
  ) {
    try {
      const query = `
      UPDATE events SET titulo = ?, descripcion = ?, fecha = ?, lugar = ?, imagen = ? WHERE id = ?;
      `;
      await this.db?.run(query, [
        titulo,
        descripcion,
        fecha,
        lugar,
        imagen,
        id,
      ]);
      console.log('event ------------- updated');
    } catch (e) {
      console.error('******** Error updating event', e);
    }
  }

  async deleteEvent(id: number) {
    try {
      const query = `DELETE FROM events WHERE id = ?;`;
      await this.db?.run(query, [id]);
    } catch (error) {
      console.error('******** Error deleting event', error);
    }
  }
}
