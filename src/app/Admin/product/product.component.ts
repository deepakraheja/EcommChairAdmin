import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LocalStorageService } from 'src/app/Service/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/Service/Product.service';
import { Router } from '@angular/router';
import { SupplierService } from 'src/app/Service/supplier.service';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';
import { environment } from 'src/environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { DatePipe } from '@angular/common';
import { ReviewService } from 'src/app/Service/review.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  public ImagePath = environment.ImagePath;
  ProductForm: FormGroup;
  lstData: any = [];
  LoggedInUserId: string;
  LoggedInUserType: string;
  lstSupplier: any = [];
  // displayedColumns: string[] = ['productName', 'brandName', 'subcategoryName', 'stockQty', 'price', 'salePrice', 'active', 'Edit'];
  displayedColumns: string[] = ['frontImage', 'productName', 'brandName', 'subcategoryName', 'supplierName', 'setType', 'review', 'active', 'Edit'];
  dataSource = new MatTableDataSource<any>(this.lstData);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  SelectsupplierID = new FormControl('');
  SelectedProductName: string = "";
  SelectedProductId: number = 0;
  ReviewForm: FormGroup;
  submitted = false;
  displayedColumnsReview: string[] = ['titles', 'rating', 'notes'];
  dataSourceReview = new MatTableDataSource<any>(this.lstData);
  showMask = false;
  DecimalMask = null;
  constructor(
    private formBuilder: FormBuilder,
    private _LocalStorage: LocalStorageService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private _toasterService: ToastrService,
    private _ProductService: ProductService,
    private router: Router,
    private _supplierService: SupplierService,
    private _datePipe: DatePipe,
    private _reviewService: ReviewService
  ) {
    this.LoggedInUserId = this._LocalStorage.getValueOnLocalStorage("LoggedInUserId");
    this.ReviewForm = this.formBuilder.group({
      reviewId: [0],
      productID: [0],
      titles: ['', Validators.required],
      rating: ['', Validators.required],
      notes: ['', Validators.required],
      createdDate: this._datePipe.transform(new Date().toString(), 'yyyy-MM-dd HH:mm:ss'),
      createdBy: Number(this.LoggedInUserId),
    });

    this.LoadData("");
    this.LoadSupplier();
  }

  ngOnInit(): void {
  }
  get f() { return this.ReviewForm.controls; }
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '6rem',
    minHeight: '6rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  }

  addMask(obj: Object) {
    this.DecimalMask = "0.00";
    this.showMask = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  LoadSupplier() {
    let obj = {
      Active: true
    }
    this.spinner.show();
    this._supplierService.GetSupplier(obj).subscribe(res => {
      //this.spinner.hide();
      this.lstSupplier = res;
    });
  }
  LoadData(event: any) {
    let obj = {
      SupplierID: this.SelectsupplierID.value == "" ? 0 : Number(this.SelectsupplierID.value)
    }
    this.spinner.show();
    this._ProductService.GetAllProductBySupplierId(obj).subscribe(res => {
      this.spinner.hide();
      this.dataSource = new MatTableDataSource<any>(res);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  onAddNew() {
    this.router.navigate(['/productdetail']);
  }

  Edit(lst) {
    debugger
    this.router.navigate(['/productdetail/' + lst.productID]);
  }

  OpenReviewPopUp(template: TemplateRef<any>, lst) {
    debugger
    this.SelectedProductName = lst.productName;
    this.SelectedProductId = lst.productID;
    this.ReviewForm = this.formBuilder.group({
      reviewId: [0],
      productID: Number(lst.productID),
      titles: ['', Validators.required],
      rating: ['', Validators.required],
      notes: ['', Validators.required],
      createdDate: this._datePipe.transform(new Date().toString(), 'yyyy-MM-dd HH:mm:ss'),
      createdBy: Number(this.LoggedInUserId),
    });
    let obj = {
      productID: Number(this.ReviewForm.value.productID)
    }
    debugger
    this.spinner.show();
    this._reviewService.GetReview(obj).subscribe(res => {
      debugger
      this.spinner.hide();
      this.dataSourceReview = new MatTableDataSource<any>(res);
      const dialogRef = this.dialog.open(template, {
        width: '60vw',
        height: '80vh',
        data: this.ReviewForm
      });
      dialogRef.disableClose = true;
      dialogRef.afterClosed().subscribe(result => {
        this.SelectedProductName = "";
        this.SelectedProductId = 0;
        // this.LoadProductDetail();
      });
    });


  }

  SaveProductReview() {
    this.submitted = true;
    if (this.ReviewForm.invalid) {
      this.ReviewForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      return;
    }
    this.spinner.show();
    this._reviewService.SaveReview(this.ReviewForm.value).subscribe(res => {
      this.dataSourceReview = new MatTableDataSource<any>(res);
      this.spinner.hide();
      this.ReviewForm = this.formBuilder.group({
        reviewId: [0],
        productID: Number(this.SelectedProductId),
        titles: ['', Validators.required],
        rating: ['', Validators.required],
        notes: ['', Validators.required],
        createdDate: this._datePipe.transform(new Date().toString(), 'yyyy-MM-dd HH:mm:ss'),
        createdBy: Number(this.LoggedInUserId),
      });
      //this.dialog.closeAll();
      this._toasterService.success("Product review has been saved successfully.");
    });
  }

}

