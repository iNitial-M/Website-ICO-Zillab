import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ContactFormInterface} from "../interfaces/contact-form-interface";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    private httpClient: HttpClient
  ) { }

  public sendEmail(name: string, email: string, phone: string, message: string): Observable<any>
  {
    return this.httpClient.post<ContactFormInterface>('http://localhost:8000/api/send-mail', {
      name: name,
      email: email,
      phone: phone,
      message: message
    });
  }

  public subscribeUser(email: string): Observable<any>
  {
    return this.httpClient.post<any>('http://localhost:8000/api/subscribe', {
      email: email
    });
  }
}
