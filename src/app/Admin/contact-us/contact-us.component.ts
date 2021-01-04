import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ContactusService } from 'src/app/Service/contactus.service';
import { LocalStorageService } from 'src/app/Service/local-storage.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  lstData: any = [];
  displayedColumns: string[] = ['firstName', 'lastName', 'phoneNo', 'email', 'message', 'createdDate'];
  dataSource = new MatTableDataSource<any>(this.lstData);
  constructor(
    private _LocalStorage: LocalStorageService,
    private spinner: NgxSpinnerService,
    private _toasterService: ToastrService,
    private _ContactusService: ContactusService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this._ContactusService.GetContactUs()
      .subscribe(res => {
        this.dataSource = new MatTableDataSource<any>(res);
        this.spinner.hide();
      });
  }

}
