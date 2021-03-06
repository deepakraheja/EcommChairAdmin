import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LocalStorageService } from 'src/app/Service/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/Service/Product.service';
import { LookupService } from 'src/app/Service/lookup.service';

@Component({
  selector: 'app-accessory',
  templateUrl: './accessory.component.html',
  styleUrls: ['./accessory.component.css']
})
export class AccessoryComponent implements OnInit {
  public APIURL = environment.APIURL;
  AccessoryForm: FormGroup;
  lstData: any = [];
  LoggedInUserId: string;
  LoggedInUserType: string;
  //displayedColumns: string[] = ['Image', 'accessoryCategoryName', 'name', 'price', 'isAddPrice', 'description', 'active', 'Edit'];
  displayedColumns: string[] = ['Image', 'accessoryCategoryName', 'name', 'price', 'isAddPrice', 'active', 'Edit'];
  dataSource = new MatTableDataSource<any>(this.lstData);
  lstAccessory: any;
  title: string = "Add Module";
  SelectaccessoryId = new FormControl('1');
  SelectMainaccessoryId = new FormControl('1');
  lstMainAccessory: any = [];
  DecimalMask = null;
  showMask = false;
  lstAccessoryCategory: any = [];
  constructor(
    private formBuilder: FormBuilder,
    private _LocalStorage: LocalStorageService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private _toasterService: ToastrService,
    private _ProductService: ProductService,
    private _lookupService: LookupService
  ) {
    this.LoggedInUserId = this._LocalStorage.getValueOnLocalStorage("LoggedInUserId");
    this.AccessoryForm = this.formBuilder.group({
      accessoryId: [0, Validators.required],
      accessoryCategoryId: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      active: [true],
      createdBy: Number(this.LoggedInUserId),
      fileName: ['', Validators.required],
      isAddPrice: ['1', Validators.required]
    });
    this._lookupService.GetAccessoryCategory().subscribe(res => {
      this.lstAccessoryCategory = res;
    });
    this.LoadData("");
  }

  ngOnInit(): void {
    //this.fnGetMainAccessory();
  }

  addMask(obj: Object) {
    this.DecimalMask = "0*.00";
    this.showMask = false;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  LoadData(event: any) {
    debugger
    this.spinner.show();
    this._ProductService.GetAllAccessory().subscribe(res => {
      this.spinner.hide();
      this.dataSource = new MatTableDataSource<any>(res);
    });
  }

  onAddNew(template: TemplateRef<any>, lst) {
    this.AccessoryForm = this.formBuilder.group({
      accessoryId: [0, Validators.required],
      accessoryCategoryId: ['', Validators.required],
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: [''],
      active: [false],
      fileName: [''],
      isAddPrice: ['0', Validators.required]
    });
    const dialogRef = this.dialog.open(template, {
      width: '70vw',
      data: this.AccessoryForm
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  Edit(template: TemplateRef<any>, lst) {
    debugger
    this.AccessoryForm = this.formBuilder.group({
      accessoryId: [lst.accessoryId, Validators.required],
      accessoryCategoryId: [lst.accessoryCategoryId, Validators.required],
      name: [lst.name, Validators.required],
      price: [lst.price, Validators.required],
      description: [lst.description],
      active: [lst.active],
      fileName: [lst.fileName],
      isAddPrice: [lst.isAddPrice, Validators.required]
    });
    const dialogRef = this.dialog.open(template, {
      width: '70vw',
      data: this.AccessoryForm
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  Save() {
    debugger
    if (this.AccessoryForm.invalid) {
      this.AccessoryForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      return;
    }

    else if (this.AccessoryForm.value.fileName == null || this.AccessoryForm.value.fileName == "") {
      this.AccessoryForm.markAllAsTouched();
      this._toasterService.error("Please select the image for upload.");
      return;
    }
    else {
      this.spinner.show();
      let obj = {
        accessoryId: Number(this.AccessoryForm.value.accessoryId),
        accessoryCategoryId: Number(this.AccessoryForm.value.accessoryCategoryId),
        name: this.AccessoryForm.value.name,
        price: Number(this.AccessoryForm.value.price),
        description: this.AccessoryForm.value.description,
        active: this.AccessoryForm.value.active,
        fileName: this.AccessoryForm.value.fileName == null ? [] : this.AccessoryForm.value.fileName,
        isAddPrice: Number(this.AccessoryForm.value.isAddPrice)
      };
      this._ProductService.SaveAccessory(obj).subscribe(res => {
        this.spinner.hide();
        if (res > 0) {
          this._toasterService.success("Record has been saved successfully.");
          this.dialog.closeAll();
          this.LoadData("");
        }
        else if (res == -1) {
          this._toasterService.error("Accessory name already exists.");
        }
        else {
          this._toasterService.error("Server error, Please try again after some time.");
        }
      });
    }
  }
  ImageUpload(event) {
    var images = [];
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          debugger
          images.push(event.target.result);
          // this.previewUrl = event.target.result;
          this.AccessoryForm.patchValue({
            fileName: images
          });
          this.AccessoryForm.updateValueAndValidity();
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

}

