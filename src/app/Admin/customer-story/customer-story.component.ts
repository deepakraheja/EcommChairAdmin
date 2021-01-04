import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmBoxComponent } from 'src/app/confirm-box/confirm-box.component';
import { CustomerStoryService } from 'src/app/Service/customer-story.service';
import { LocalStorageService } from 'src/app/Service/local-storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-story',
  templateUrl: './customer-story.component.html',
  styleUrls: ['./customer-story.component.css']
})
export class CustomerStoryComponent implements OnInit {
  public ImagePath = environment.ImagePath;
  APIURL = environment.APIURL;
  CustomerStoryForm: FormGroup;
  lstData: any = [];
  displayedColumns: string[] = ['Image', 'name', 'via', 'notes', 'createdDate', 'Edit'];
  dataSource = new MatTableDataSource<any>(this.lstData);
  ProductImg = [];
  public PreviewUrl: any;
  bsModalRef: BsModalRef;
  submitted: boolean = false;
  constructor(
    private _customerStory: CustomerStoryService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private _LocalStorage: LocalStorageService,
    public dialog: MatDialog,
    private _toasterService: ToastrService,
    private modalService: BsModalService,
  ) {
    this.CustomerStoryForm = this.formBuilder.group({
      customerStoryId: [0],
      name: ['', Validators.required],
      via: ['', Validators.required],
      notes: ['', Validators.required],
      imagePath: ['', Validators.required],
    });
    this.LoadData();
  }

  ngOnInit(): void {

  }

  get f() { return this.CustomerStoryForm.controls; }

  LoadData() {
    this.spinner.show();
    this._customerStory.GetCustomerStories().subscribe(res => {
      this.spinner.hide();
      this.dataSource = new MatTableDataSource<any>(res);
    });
  }

  onAddNew(template: TemplateRef<any>, lst) {
    this.CustomerStoryForm = this.formBuilder.group({
      customerStoryId: [0],
      name: ['', Validators.required],
      via: ['', Validators.required],
      notes: ['', Validators.required],
      imagePath: ['', Validators.required]
    });
    const dialogRef = this.dialog.open(template, {
      width: '90vw',
      data: this.CustomerStoryForm
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  Edit(template: TemplateRef<any>, lst) {
    debugger
    this.ProductImg = [];
    this.CustomerStoryForm = this.formBuilder.group({
      customerStoryId: [lst.customerStoryId],
      name: [lst.name, Validators.required],
      via: [lst.via, Validators.required],
      notes: [lst.notes, Validators.required],
      imagePath: [this.APIURL + '/CustomerStoryImages/' + lst.customerStoryId + '/' + lst.imagePath, Validators.required]
    });
    this.ProductImg.push(this.APIURL + '/CustomerStoryImages/' + lst.customerStoryId + '/' + lst.imagePath);
    this.PreviewUrl = this.APIURL + '/CustomerStoryImages/' + lst.customerStoryId + '/' + lst.imagePath;
    const dialogRef = this.dialog.open(template, {
      width: '90vw',
      data: this.CustomerStoryForm
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  Save() {
    debugger
    const imagePath = this.CustomerStoryForm.get('imagePath');
    imagePath.setValue(this.ProductImg);
    imagePath.updateValueAndValidity();

    this.submitted = true;
    if (this.CustomerStoryForm.invalid) {
      this.CustomerStoryForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      return;
    }
    else {
      this.spinner.show();
      this._customerStory.SaveCustomerStory(this.CustomerStoryForm.value).subscribe(res => {
        this.spinner.hide();
        if (res > 0) {
          this._toasterService.success("Record has been saved successfully.");
          this.dialog.closeAll();
          this.LoadData();
          this.ProductImg = [];
          this.PreviewUrl = "";
        }
        else {
          this._toasterService.error("Server error, Please try again after some time.");
        }
      });
    }
  }

  UploadProductImages(event) {
    this.ProductImg = [];
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          debugger
          this.ProductImg.push(event.target.result);
          this.PreviewUrl = event.target.result;

          const imagePath = this.CustomerStoryForm.get('imagePath');
          imagePath.setValue(this.ProductImg);
          imagePath.updateValueAndValidity();
        }
        reader.readAsDataURL(event.target.files[i]);

      }
    }

  }

  removeImg(index, type) {
    const initialState = {
      title: "Confirmation",
      message: "Do you want to delete " + type + " image?",
    };
    this.bsModalRef = this.modalService.show(ConfirmBoxComponent, { ignoreBackdropClick: true, keyboard: true, class: 'modal-sm', initialState });
    this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.onClose.subscribe(result => {
      //console.log(`Dialog result: ${result}`);
      this.ProductImg = [];
      this.PreviewUrl = "";
      const imagePath = this.CustomerStoryForm.get('imagePath');
      imagePath.setValue(this.ProductImg);
      imagePath.updateValueAndValidity();
      // if (result) {
      //   debugger
      //   if (type == 'product') {
      //     debugger
      //     let obj = {
      //       ProductID: 0,
      //       ImagePath: (this.ProductImg[index]).split(this.APIURL)[1]
      //     };
      //     // this._productService.DeleteProductImage(obj).subscribe(a => {
      //     //   this.ProductImg.splice(index, 1);
      //     //   this._toasterService.success("Image has been deleted successfully.");
      //     // });
      //   }
      // }
    });
  }
}
