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
import { ConfirmBoxComponent } from 'src/app/confirm-box/confirm-box.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CategoryService } from 'src/app/Service/category.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  public ImagePath = environment.ImagePath;
  ProductForm: FormGroup;
  EditProductDetailForm: FormGroup;
  lstData: any = [];
  LoggedInUserId: string;
  LoggedInUserType: string;
  lstSupplier: any = [];
  // displayedColumns: string[] = ['productName', 'brandName', 'subcategoryName', 'stockQty', 'price', 'salePrice', 'active', 'Edit'];
  displayedColumns: string[] = ['frontImage', 'productName', 'brandName', 'subcategoryName', 'supplierName', 'moq', 'warranty', 'review', 'stock', 'active', 'Edit'];
  dataSource = new MatTableDataSource<any>(this.lstData);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  SelectsupplierID = new FormControl('');
  SelectStatus = new FormControl('');
  SelectSubCategoryID = new FormControl('');
  SelectedProductName: string = "";
  SelectedProductId: number = 0;
  ReviewForm: FormGroup;
  submitted = false;
  displayedColumnsReview: string[] = ['titles', 'rating', 'name', 'city', 'notes', 'Delete'];
  dataSourceReview = new MatTableDataSource<any>(this.lstData);
  showMask = false;
  DecimalMask = null;
  StockDecimalMask = null;
  OneNumberMask = null;
  PinCodeMark = null;
  NumberMask = null;
  bsModalRef: BsModalRef;
  lstDataProductStock: any = [];
  displayedProductStockColumns: string[] = ['color', 'qty', 'price', 'shippingPrice', 'gst', 'salePrice', 'businessDiscount', 'businessPrice', 'availableColors', 'Edit', 'Delete'];
  dataSourceProductStock = new MatTableDataSource<any>(this.lstDataProductStock);
  lstSubCategory: any = [];
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
    private _reviewService: ReviewService,
    private modalService: BsModalService,
    private _CategoryService: CategoryService,
  ) {
    this.LoggedInUserId = this._LocalStorage.getValueOnLocalStorage("LoggedInUserId");
    this.ReviewForm = this.formBuilder.group({
      reviewId: [0],
      productID: [0],
      titles: ['', Validators.required],
      rating: ['', Validators.required],
      notes: ['', Validators.required],
      name: ['', Validators.required],
      pinCode: ['', Validators.required],
      state: [''],
      city: ['', Validators.required],
      postOffice: ['', Validators.required],
      createdDate: this._datePipe.transform(new Date().toString(), 'yyyy-MM-dd HH:mm:ss'),
      createdBy: Number(this.LoggedInUserId),
    });

    this.LoadData("");
    this.LoadSupplier();
    this.LoadSubCategory();
  }

  ngOnInit(): void {
  }
  get f() { return this.ReviewForm.controls; }
  get f2() { return this.EditProductDetailForm.controls; }
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
    this.PinCodeMark = "000000";
    this.NumberMask = "0*";
    this.OneNumberMask = "0";
    this.showMask = false;
    this.StockDecimalMask = "0*.00";
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

  LoadSubCategory() {
    debugger

    let obj = {
      categoryID: 1,//Number(this.ProductForm.value.categoryID),
      Active: true
    }
    this.spinner.show();
    this._CategoryService.GetAllSubCategory(obj).subscribe(res => {
      this.spinner.hide();
      this.lstSubCategory = res;
    });

  }
  LoadData(event: any) {
    debugger
    if (this.SelectStatus.value == "") {
      let obj = {
        SupplierID: this.SelectsupplierID.value == "" ? 0 : Number(this.SelectsupplierID.value)
      }
      this.spinner.show();
      this._ProductService.GetAllProductBySupplierId(obj).subscribe(res => {
        this.spinner.hide();
        if (this.SelectSubCategoryID.value == "")
          this.dataSource = new MatTableDataSource<any>(res);
        else {
          var filterdata = res.filter(a => a.subCategoryID == Number(this.SelectSubCategoryID.value));
          this.dataSource = new MatTableDataSource<any>(filterdata);
        }
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    }
    else {
      let obj = {
        SupplierID: this.SelectsupplierID.value == "" ? 0 : Number(this.SelectsupplierID.value),
        Active: this.SelectStatus.value == "1" ? true : false,
      }
      this.spinner.show();
      this._ProductService.GetAllProductByStatusSupplierId(obj).subscribe(res => {
        this.spinner.hide();
        if (this.SelectSubCategoryID.value == "")
          this.dataSource = new MatTableDataSource<any>(res);
        else {
          var filterdata = res.filter(a => a.subCategoryID == Number(this.SelectSubCategoryID.value));
          this.dataSource = new MatTableDataSource<any>(filterdata);
        }
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    }
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
      name: ['', Validators.required],
      pinCode: ['', Validators.required],
      state: [''],
      city: ['', Validators.required],
      postOffice: ['', Validators.required],
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
        width: '90vw',
        height: '90vh',
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
        name: ['', Validators.required],
        pinCode: ['', Validators.required],
        state: [''],
        city: ['', Validators.required],
        postOffice: ['', Validators.required],
        createdDate: this._datePipe.transform(new Date().toString(), 'yyyy-MM-dd HH:mm:ss'),
        createdBy: Number(this.LoggedInUserId),
      });
      //this.dialog.closeAll();
      this._toasterService.success("Product review has been saved successfully.");
    });
  }
  DeleteReview(element) {
    debugger
    const initialState = {
      title: "Confirmation",
      message: "Do you want to delete this record?",
    };
    this.bsModalRef = this.modalService.show(ConfirmBoxComponent, { ignoreBackdropClick: true, keyboard: true, class: 'modal-sm', initialState });
    this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.onClose.subscribe(result => {
      //console.log(`Dialog result: ${result}`);
      if (result) {
        let obj = {
          ReviewId: element.reviewId,
          ProductID: Number(this.SelectedProductId)
        };
        this.spinner.show();
        this._reviewService.DeleteReview(obj).subscribe(res => {
          this.spinner.hide();
          this.dataSourceReview = new MatTableDataSource<any>(res);
          this._toasterService.success("Record has been deleted successfully.");
        });
      }
    });
  }

  OpenStockPopUp(template: TemplateRef<any>, lst) {
    debugger
    this.SelectedProductName = lst.productName;
    this.SelectedProductId = lst.productID;
    let obj = {
      ProductId: Number(this.SelectedProductId)
    };
    this._ProductService.GetProductSizeColorById(obj).subscribe(res => {
      //this.spinner.hide();
      this.lstDataProductStock = res;
      this.dataSourceProductStock = new MatTableDataSource<any>(res);
      this.spinner.hide();
      const dialogRef = this.dialog.open(template, {
        width: '90vw',
        height: '90vh',
        data: this.lstDataProductStock
      });
      dialogRef.disableClose = true;
      dialogRef.afterClosed().subscribe(result => {
        this.SelectedProductName = "";
        this.SelectedProductId = 0;
        // this.LoadProductDetail();
      });
    });
  }

  EditStock(element) {
    debugger
    //this.images = [];
    this.lstDataProductStock.forEach(element => {
      element.isEdit = false;
    });
    element.isEdit = true;
    this.EditProductDetailForm = this.formBuilder.group({
      productSizeColorId: [element.productSizeColorId],
      productSizeId: [element.productSizeId],
      productId: [element.productId],
      qty: [element.qty, Validators.required],
      price: [element.price, Validators.required],
      salePrice: [element.salePrice, Validators.required],
      availableSize: [element.availableSize],
      availableColors: [element.availableColors],
      size: [element.size],
      sizeId: [element.sizeId, Validators.required],
      setNo: [element.setNo],
      lookupColorId: [element.lookupColorId, Validators.required],
      discount: [element.discount, Validators.required],
      discountAvailable: [element.discountAvailable],
      shippingPrice: [element.shippingPrice, Validators.required],
      businessPrice: [element.businessPrice, Validators.required],
      businessDiscount: [element.businessDiscount, Validators.required],
      //productImg: [element.productImg, [Validators.required]],
    });

  }

  Close(element) {
    element.isEdit = false;
  }
  Delete(element) {
    debugger
    const initialState = {
      title: "Confirmation",
      message: "Do you want to delete this record?",
    };
    this.bsModalRef = this.modalService.show(ConfirmBoxComponent, { ignoreBackdropClick: true, keyboard: true, class: 'modal-sm', initialState });
    this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.onClose.subscribe(result => {
      //console.log(`Dialog result: ${result}`);
      if (result) {
        let obj = {
          ProductSizeColorId: element.productSizeColorId,
          ProductSizeId: element.productSizeId,
          ProductId: Number(this.SelectedProductId),
          SetNo: Number(element.setNo)
        };
        this.spinner.show();
        this._ProductService.DeleteProductSizeColor(obj).subscribe(res => {
          this.spinner.hide();
          if (res == -1) {
            this._toasterService.error("This item can not deleted because it is either in cart or already purchased.");
          }
          else {
            this.LoadProductDetail();
            this._toasterService.success("Record has been deleted successfully.");
          }
        });
      }
    });
  }

  LoadProductDetail() {
    this.spinner.show();
    let obj = {
      ProductId: this.SelectedProductId
    };
    this._ProductService.GetProductSizeColorById(obj).subscribe(res => {
      //this.spinner.hide();
      this.lstDataProductStock = res;
      this.dataSourceProductStock = new MatTableDataSource<any>(res);
      this.spinner.hide();
    });
  }

  UpdateProductDetails() {
    this.submitted = true;
    debugger
    if (this.EditProductDetailForm.invalid) {
      this.EditProductDetailForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      return;
    }
    else {
      this.spinner.show();
      let obj = {
        productSizeColorId: Number(this.EditProductDetailForm.value.productSizeColorId),
        productSizeId: Number(this.EditProductDetailForm.value.productSizeId),
        productId: Number(this.SelectedProductId),
        qty: Number(this.EditProductDetailForm.value.qty),
        price: Number(this.EditProductDetailForm.value.price),
        salePrice: Number(this.EditProductDetailForm.value.salePrice),
        availableSize: this.EditProductDetailForm.value.availableSize,
        availableColors: this.EditProductDetailForm.value.availableColors,
        size: this.EditProductDetailForm.value.size,
        sizeId: this.EditProductDetailForm.value.sizeId,
        setNo: Number(this.EditProductDetailForm.value.setNo),
        lookupColorId: Number(this.EditProductDetailForm.value.lookupColorId),
        discount: Number(this.EditProductDetailForm.value.discount),
        discountAvailable: Number(this.EditProductDetailForm.value.discount) > 0 ? true : false,//this.EditProductDetailForm.value.discountAvailable,
        shippingPrice: Number(this.EditProductDetailForm.value.shippingPrice),
        businessPrice: Number(this.EditProductDetailForm.value.businessPrice),
        businessDiscount: Number(this.EditProductDetailForm.value.businessDiscount),
        CreatedBy: Number(this.LoggedInUserId),
        Modifiedby: Number(this.LoggedInUserId),
      };
      this._ProductService.SaveProductSizeColor(obj).subscribe(res => {
        //this.spinner.hide();
        if (res > 0) {
          this.LoadProductDetail();
          this._toasterService.success("Record has been saved successfully.");
        }
        else {
          this._toasterService.error("Server error, Please try again after some time.");
        }
      });
    }
  }

  UpdateSalePrice(event: any) {
    debugger
    const salePrice = this.EditProductDetailForm.get('salePrice');
    const businessPrice = this.EditProductDetailForm.get('businessPrice');

    if (this.EditProductDetailForm.value.price != '') {
      let val = Number(this.EditProductDetailForm.value.price) + Number(this.EditProductDetailForm.value.shippingPrice) + ((Number(this.EditProductDetailForm.value.price) + Number(this.EditProductDetailForm.value.shippingPrice)) * 18 / 100)
      salePrice.setValue(Number(val));
      salePrice.updateValueAndValidity();
      businessPrice.setValue(Number(this.EditProductDetailForm.value.price));
      businessPrice.updateValueAndValidity();
    }
    else {
      salePrice.setValue(0);
      salePrice.updateValueAndValidity();
      businessPrice.setValue(Number(this.EditProductDetailForm.value.price));
      businessPrice.updateValueAndValidity();
    }
    this.UpdateDiscount('');
  }

  UpdateDiscount(event: any) {
    debugger
    const businessPrice = this.EditProductDetailForm.get('businessPrice');
    const businessDiscount = this.EditProductDetailForm.get('businessDiscount');

    if (this.EditProductDetailForm.value.businessDiscount != '') {
      if (Number(this.EditProductDetailForm.value.price) < Number(this.EditProductDetailForm.value.businessDiscount)) {
        businessDiscount.setValue(0);
        businessDiscount.updateValueAndValidity();
        businessPrice.setValue(Number(this.EditProductDetailForm.value.price));
        businessPrice.updateValueAndValidity();
        this.EditProductDetailForm.markAllAsTouched();
        this._toasterService.error("Product ex-factory price should be greater than the business Discount.");
      }
      else {
        var Decrease = (Number(this.EditProductDetailForm.value.price) - Number(this.EditProductDetailForm.value.businessDiscount));
        businessPrice.setValue(Number(Decrease));
        businessPrice.updateValueAndValidity();
      }
    }
    else {
      businessPrice.setValue(Number(this.EditProductDetailForm.value.price));
      businessPrice.updateValueAndValidity();
    }
  }

}

