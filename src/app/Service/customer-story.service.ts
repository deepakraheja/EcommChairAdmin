import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerStoryService {
  private BASE_API_URL = environment.BASE_API_URL;
  private _controllerName: string = "CustomerStory/";
  private _url: string = this.BASE_API_URL + this._controllerName;
  private _methodName: string = "";
  private _param: {};

  constructor(private _http: HttpClient) { }

  SaveCustomerStory(_Obj: any): Observable<number> {
    this._methodName = "SaveCustomerStory";
    this._param = _Obj;
    return this._http.post<number>(
      this._url + this._methodName, this._param
    );
  }

  
  GetCustomerStories(): Observable<any> {
    this._methodName = "GetCustomerStories/";
    this._param = {};
    return this._http.post<any>(
      this._url + this._methodName, this._param
    );
  }
}
