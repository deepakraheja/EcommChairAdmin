import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private BASE_API_URL = environment.BASE_API_URL;
  private _controllerName: string = "Invoice/";
  private _url: string = this.BASE_API_URL + this._controllerName; 
  private _methodName: string = "";
  private _param: {};
 
  constructor(private _http: HttpClient) { } 

  OrderInvoiceByGUID(_Obj: any): Observable<string> {
    this._methodName = "OrderInvoiceByGUID";
    this._param = _Obj; 
    return this._http.post<string>(
      this._url + this._methodName, this._param
    );
  }
}
