import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/Service/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from 'src/app/Service/brand.service';
import { CategoryService } from 'src/app/Service/category.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ProductService } from 'src/app/Service/Product.service';
import { ConfirmBoxComponent } from 'src/app/confirm-box/confirm-box.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SupplierService } from 'src/app/Service/supplier.service';
import { MatTableDataSource } from '@angular/material/table';
import { LookupService } from 'src/app/Service/lookup.service';
import { FabricService } from 'src/app/Service/Fabric.service';
import { TagService } from 'src/app/Service/tag.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
declare var $;
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  ImagePath = environment.ImagePath;
  APIURL = environment.APIURL;
  ProductForm: FormGroup;
  ProductDetailForm: FormGroup;
  EditProductDetailForm: FormGroup;
  LoggedInUserId: string;
  lstBrand: any = [];
  lstMainCategory: any = [];

  product: any = [];

  lstCategory: any = [];
  lstSubCategory: any = [];
  lstSupplier: any = [];
  lstHSN: any = [];
  lstTag: any = [];
  lstFabric: any = [];
  lstFabricType: any = [];
  ProductId: any = 0;
  lstColor: any = [];
  lstSize: any = [];
  images = [];
  BannerImage = [];
  SmallImage = [];
  public previewUrl: any;
  bsModalRef: BsModalRef;
  submitted = false;
  DecimalMask = null;
  showMask = false;
  NumberMask = null;
  lstData = [];
  displayedImagesColumns: string[] = ['Upload', 'color', 'View'];
  ImagesdataSource = new MatTableDataSource<any>(this.lstData);

  displayedColumns: string[] = ['color', 'setNo', 'qty', 'price', 'shippingPrice', 'gst', 'salePrice', 'businessDiscount', 'businessPrice', 'availableColors', 'Edit', 'Delete'];
  dataSource = new MatTableDataSource<any>(this.lstData);

  displayedSetImagesColumns: string[] = ['Upload', 'setNo', 'totalqty', 'View'];
  SetImagesdataSource = new MatTableDataSource<any>(this.lstData);

  PopUpProductImg = [];
  public SelectedProductSizeColorId: Number = 0;
  public SelectedProductSizeId: Number = 0;
  public PopUpPreviewUrl: any;
  public IsShow: boolean = false;
  public IsDisabled: boolean = false;
  SelectedSetNo: Number = 0;
  public SelectedProductImages = [];
  public Currency = { name: 'Rupees', currency: 'INR', price: 1 } // Default Currency
  constructor(
    private formBuilder: FormBuilder,
    private _LocalStorage: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private _toasterService: ToastrService,
    private _BrandService: BrandService,
    private _CategoryService: CategoryService,
    private _productService: ProductService,
    private modalService: BsModalService,
    private _supplierService: SupplierService,
    private _lookupService: LookupService,
    private _FabricService: FabricService,
    private _TagService: TagService
  ) {

    this.ProductForm = this.formBuilder.group({
      productID: [0],
      productName: ['', Validators.required],
      shortDetails: ['', Validators.required],
      //description: [''],
      supplierID: ['', Validators.required],
      mainCategoryID: [1, Validators.required],
      categoryID: [1, Validators.required],
      subCategoryID: ['', Validators.required],
      brandId: ['', Validators.required],

      productAvailable: [false],
      CreatedBy: Number(this.LoggedInUserId),
      // CreatedDate:[''],
      Modifiedby: Number(this.LoggedInUserId),
      // ModifiedDate:[''],
      featured: [false],
      latest: [false],
      onSale: [false],
      topSelling: [false],
      hotOffer: [false],
      active: [true],
      bannerImg: [''],
      smallImg: ['', [Validators.required]],
      title: [''],
      subTitle: [''],
      lookupHSNId: ['1'],
      tagId: [0],
      articalNo: [''],
      fabricId: ['0'],
      fabricTypeId: ['0'],
      setType: [1],
      minimum: [''],
      videoURL: [''],
      seatingHeight: [''],
      backSize: [''],
      totalHeight: [''],
      width: [''],
      depth: [''],
      overallDimension: [''],
      assemblyType: [''],
      warranty: [''],
      moq: [''],
      guaranteeNotes: ['<p></p><b><ul><li><b>WARRANTY &amp; SUPPORT&nbsp;</b></li></ul></b><blockquote><span>The Alibaba chair product is warranted against defects in material and workmanship for one year. The warranty covers all major components including pneumatic cylinder, control mechanism, base and casters. In case of a defect, we will repair or replace parts without charge within a reasonable amount of time.<br></span><span>To make a claim, simply email us with your purchase invoice, along with name, phone and address.<br></span><span>Note that natural markings such as scars, grain variations, etc.&nbsp; Will be considered normal characteristics and not construed as defects. This warranty will not cover labor, freight or damage from misuse, negligence, accident, vandalism, rusting or acts of nature.</span></blockquote><b><ul><li><b>&nbsp;Customer Service</b></li></ul></b><blockquote><span>Our quality standards are among the highest in the highest in the industry. Sometimes, no matter how hard we try, there are times when parts are missing or damaged during shipping we will do everything possible to promptly remedy the problem.</span><br><span>Phone - 9811585898&nbsp;<br></span><span>Email - care@alibabachair.com</span></blockquote>'],
      deliveryInformationNotes: ['<ul><li><font face="Arial">If the selected product is available then it would be delivered within 3 to 4 working days.</font></li><li><font face="Arial">The delivery would be till the door of your suggested address.</font></li><li><font face="Arial">No Assembly required -&nbsp;Product is delivered pre-assembled and does not require any assembly at the specified order destination.</font></li><li><font face="Arial">All care would be taken of during transportation that the goods do not get damaged.</font></li><li><font face="Arial">Product would be delivered by our company is experience logistic and transport team.</font></li><li><font face="Arial">Please check the product at the time of delivery. If it is not to your liking or is damaged/defective, you can return it on the spot.</font></li><li><font face="Arial">In case you have any questions or need any clarifications do not hesitate to call our Customer Support Team.</font></li></ul><div><font face="Arial"><b><u><br></u></b></font></div><div><font face="Arial"><b><u>Our Delivery Partner&nbsp;</u></b></font></div><div><font face="Arial"><b><u><br></u></b></font></div><div><ul><li><font face="Arial">BLUE DART</font></li><li><font face="Arial">DHL</font></li><li><font face="Arial">DELHIVERY</font></li><li><font face="Arial">ECOM - EXPRESS</font></li><li><font face="Arial">EKART - LOGISTIC</font></li><li><font face="Arial">GATI</font></li><li><font face="Arial">INDIA POST</font></li><li><font face="Arial">X- PRESS BESS&nbsp; &nbsp; &nbsp;</font></li><li><font face="Arial">FED EX - EXPRESS&nbsp;&nbsp;</font></li><li><font face="Arial">DTDC</font></li><li><font face="Arial">ARAMEX DELIVERY UNLIMITED</font></li><li><font face="Arial">FLIGHT COURIER LIMITED</font></li><li><font face="Arial">TNT EXPRESS&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</font></li></ul></div>'],
      suggestionNotes: ['<ul class="tablularcontent"><li><font face="Arial">On Average, we spend about Six to Eight hours sitting at our desks during a typical workday.<br></font></li><li><font face="Arial">Keep in mind that office chairs are very subjective. Everyone is a little different, and what makes one person comfortable and happy may not work for another person. With that said, there are patterns of general customer happiness when it comes to office chairs.<br></font></li></ul><font face="Arial">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<span>Below are the suggestions based on customer satisfaction.</span><br></font><ul class="tablularcontent"><ol><li><font face="Arial">For Workstation/Computer/Staff it should be Medium Back and High Back Chair. Preferably Mesh Back &amp; Cushion Seat Ergonomic Chair.</font></li><li><font face="Arial">For Executive &amp; Manager it should be High Back Chair Leather Chair.</font></li><li><font face="Arial">For Visitor/ Guest it should be Fixed Four Leg Chair.</font></li><li><font face="Arial">For the Waiting Area it should be Fixed Two or Three Seat Steel Chair.</font></li><li><font face="Arial">For Conference Room it should be Sleek Ergonomic Chair.</font></li></ol><li><font face="Arial">Also for any type of revolving chair insist on Base / Stand = Metal or Steel | Bolt (used below seat) : Heavy Weight | Wheels: Nylon | Gas Lift: Class 4; etc for long life of chairs.<br></font></li><li><font face="Arial">Make it sure that all chair parts are covered under free replacement in Guarantee period.</font></li></ul>'],
      sku: ['', Validators.required],
      wheel: ['', Validators.required],
      armrest: ['', Validators.required],
      base: ['', Validators.required],
      mechanism: ['', Validators.required]
    });

    this.ProductDetailForm = this.formBuilder.group({
      productSizeColorId: [0],
      productId: [this.ProductId],
      qty: ['', Validators.required],
      price: ['', Validators.required],
      salePrice: ['', Validators.required],
      availableSize: [true],
      availableColors: [true],
      arraySize: [[1]],
      arrayColor: ['', Validators.required],
      discount: ['0', Validators.required],
      // discountAvailable: [false],
      //productImg: ['', [Validators.required]],
      shippingPrice: ['', Validators.required],
      businessPrice: ['', Validators.required],
      businessDiscount: ['', Validators.required]
    });

    this.EditProductDetailForm = this.formBuilder.group({
      productSizeColorId: [0],
      productId: [this.ProductId],
      qty: ['', Validators.required],
      price: ['', Validators.required],
      salePrice: ['', Validators.required],
      availableSize: [false],
      availableColors: [false],
      size: [''],
      sizeId: ['', Validators.required],
      setNo: this.ProductForm.value.setType != 2 ? [''] : ['', Validators.required],
      lookupColorId: ['', Validators.required],
      discount: ['0', Validators.required],
      discountAvailable: [false],
      shippingPrice: ['', Validators.required],
      businessPrice: ['', Validators.required],
      businessDiscount: ['', Validators.required]
      //productImg: ['', [Validators.required]],
    });

    //this.fnGetMainCategory();
    this.LoadSubCategory("");
    this.LoadBrand();
    //this.LoadCategory("");
    this.LoadSupplier();
    //this.LoadTag();
    this.LoadFabric();

    this.LoggedInUserId = this._LocalStorage.getValueOnLocalStorage("LoggedInUserId");
    this.route.paramMap.subscribe((params: ParamMap) => {
      debugger
      this.ProductId = Number(params.get('productId'));
      if (this.ProductId > 0)
        this.LoadProduct();
    });
  }
  ResetProductDetails() {
    this.ProductDetailForm = this.formBuilder.group({
      productSizeColorId: [0],
      productId: [this.ProductId],
      qty: ['', Validators.required],
      price: ['', Validators.required],
      salePrice: ['', Validators.required],
      availableSize: [true],
      availableColors: [true],
      arraySize: [[1]],
      arrayColor: ['', Validators.required],
      discount: ['0', Validators.required],
      shippingPrice: ['', Validators.required],
      businessPrice: ['', Validators.required],
      businessDiscount: ['', Validators.required]
      // discountAvailable: [false],
      //productImg: ['', [Validators.required]],
    });
  }

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '15rem',
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

  ngOnInit(): void {
    //this.LoadProductDetail();
    this._lookupService.GetHSN().subscribe(res => {
      this.lstHSN = res;
    });
    this._lookupService.GetActiveColor().subscribe(res => {
      this.lstColor = res;
    });
    this._lookupService.GetActiveSize().subscribe(res => {
      this.lstSize = res;
    });

  }
  get f() { return this.ProductForm.controls; }
  get f1() { return this.ProductDetailForm.controls; }
  get f2() { return this.EditProductDetailForm.controls; }

  addMask(obj: Object) {
    this.DecimalMask = "0*.00";
    this.NumberMask = "0*";
    this.showMask = false;
  }

  LoadProductDetail() {
    this.spinner.show();
    let obj = {
      ProductId: this.ProductId
    };
    this._productService.GetProductSizeColorById(obj).subscribe(res => {
      //this.spinner.hide();
      this.lstData = res;
      this.dataSource = new MatTableDataSource<any>(res);
      if (res.length > 0) {
        this.IsDisabled = true;
      }
      else {
        this.IsDisabled = false;
      }
      var resArr = [];
      debugger
      if (this.ProductForm.value.setType != 2) {
        // Color Images Grid
        res.forEach(function (item) {
          var i = resArr.findIndex(x => x.color == item.color);
          if (i <= -1) {
            resArr.push({ productSizeColorId: item.productSizeColorId, color: item.color, productImg: item.productImg });
          }
        });
        this.ImagesdataSource = new MatTableDataSource<any>(resArr);
      }
      // Set Images Grid
      if (this.ProductForm.value.setType == 2) {
        res.forEach(function (item) {
          var i = resArr.findIndex(x => x.setNo == item.setNo);
          if (i <= -1) {
            if (item.setNo > 0)
              resArr.push({ productSizeColorId: item.productSizeColorId, setNo: item.setNo, productImg: item.productImg });
          }
        });
        this.SetImagesdataSource = new MatTableDataSource<any>(resArr);
      }
      this.spinner.hide();
    });
  }

  GetTotalPics(setNo) {
    var TotalPcsBySetNo = 0;
    (this.lstData).forEach(element => {
      if (element.setNo == setNo) {
        TotalPcsBySetNo += element.qty;
      }
    });
    return TotalPcsBySetNo;
  }

  LoadBrand() {
    let obj = {
      Active: true
    }
    this.spinner.show();
    this._BrandService.GetAllBrand(obj).subscribe(res => {
      //this.spinner.hide();
      this.lstBrand = res;
    });
  }

  // fnGetMainCategory() {
  //   let obj = { Active: true };
  //   this.spinner.show();
  //   this._CategoryService.GetMainCategory(obj)
  //     .subscribe(res => {
  //       this.lstMainCategory = res
  //       //this.spinner.hide();
  //       // setTimeout(() => {
  //       //   this.LoadCategory("");
  //       // }, 2000);

  //     });
  // }

  // LoadCategory(event: any) {

  //   if (this.ProductForm.value.mainCategoryID != "") {
  //     let obj = {
  //       MainCategoryID: Number(this.ProductForm.value.mainCategoryID),
  //       Active: true
  //     }
  //     debugger;
  //     this.spinner.show();

  //     this._CategoryService.GetAllCategory(obj).subscribe(res => {
  //       //this.spinner.hide();
  //       setTimeout(() => {
  //         debugger
  //         this.lstCategory = res;
  //         if (event != "") {
  //           const categoryID = this.ProductForm.get('categoryID');
  //           categoryID.setValue('');
  //           categoryID.updateValueAndValidity();
  //         }
  //       }, 500);

  //       debugger;
  //       this.LoadSubCategory("");
  //     });
  //   }
  //   else {
  //     this.lstCategory = [];
  //     const categoryID = this.ProductForm.get('categoryID');
  //     categoryID.setValue('');
  //     categoryID.updateValueAndValidity();
  //     this.spinner.hide();
  //   }
  // }

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

  // LoadTag() {
  //   let obj = {
  //     Active: true
  //   }
  //   this.spinner.show();
  //   this._TagService.GetTag(obj).subscribe(res => {
  //     this.lstTag = res;
  //   });
  // }

  LoadFabric() {
    let obj = {
      IsActive: true
    }
    this.spinner.show();
    this._FabricService.GetFabric(obj).subscribe(res => {
      this.lstFabric = res;
      this.LoadFabricType("");
    });
  }

  LoadFabricType(event: any) {
    debugger
    // if (this.ProductForm.value.fabricId != "" && this.ProductForm.value.fabricId != "0") {
    let obj = {
      //FabricId: Number(this.ProductForm.value.fabricId),
      Active: true
    }
    this.spinner.show();
    this._FabricService.GetAllFabricType(obj).subscribe(res => {
      this.spinner.hide();
      this.lstFabricType = res;
    });
    // }
    // else {
    //   this.lstFabricType = [];
    //   const fabricTypeId = this.ProductForm.get('fabricTypeId');
    //   fabricTypeId.setValue(0);
    //   fabricTypeId.updateValueAndValidity();
    //   this.spinner.hide();
    // }
  }

  LoadSubCategory(event: any) {

    debugger
    if (this.ProductForm.value.categoryID != "") {
      let obj = {
        categoryID: 1,//Number(this.ProductForm.value.categoryID),
        Active: true
      }
      this.spinner.show();
      this._CategoryService.GetAllSubCategory(obj).subscribe(res => {
        this.spinner.hide();
        this.lstSubCategory = res;
        if (event != "") {
          const subCategoryID = this.ProductForm.get('subCategoryID');
          subCategoryID.setValue('');
          subCategoryID.updateValueAndValidity();
        }
      });
    }
    else {
      this.lstSubCategory = [];
      const subCategoryID = this.ProductForm.get('subCategoryID');
      subCategoryID.setValue('');
      subCategoryID.updateValueAndValidity();
      this.spinner.hide();
    }
  }

  LoadProduct() {
    let objmain = { Active: true };


    this.images = [];
    this.BannerImage = [];
    this.SmallImage = [];
    this.spinner.show();
    let obj = {
      ProductID: this.ProductId
    };
    debugger

    let maincategory = this._CategoryService.GetMainCategory(objmain);
    let product = this._productService.GetProductById(obj);

    forkJoin([product]).subscribe(res => {
      debugger
      // this._productService.GetProductById(obj).subscribe(res => {
      //this.lstMainCategory = res[1];
      this.product = res[0][0];
      setTimeout(() => {
        this.ProductForm = this.formBuilder.group({
          productID: [this.product.productID],
          productName: [this.product.productName, [Validators.required]],
          shortDetails: [this.product.shortDetails, Validators.required],
          //description: [this.product.description],
          supplierID: [this.product.supplierID, Validators.required],
          mainCategoryID: [Number(this.product.mainCategoryID), Validators.required],
          categoryID: [Number(this.product.categoryID), Validators.required],
          subCategoryID: [this.product.subCategoryID, Validators.required],
          brandId: [this.product.brandId, Validators.required],
          productAvailable: [this.product.productAvailable],
          CreatedBy: Number(this.LoggedInUserId),
          // CreatedDate:[res[0].productName],
          Modifiedby: Number(this.LoggedInUserId),
          // ModifiedDate:[res[0].productName],
          featured: [this.product.featured],
          latest: [this.product.latest],
          onSale: [this.product.onSale],
          topSelling: [this.product.topSelling],
          hotOffer: [this.product.hotOffer],
          active: [this.product.active],
          bannerImg: [this.product.bannerImg],
          smallImg: [[this.product.frontImage], [Validators.required]],
          title: [this.product.title],
          subTitle: [this.product.subTitle],
          lookupHSNId: [this.product.lookupHSNId],
          tagId: [Number(this.product.tagId)],
          articalNo: [this.product.articalNo],
          fabricId: [this.product.fabricId],
          fabricTypeId: [this.product.fabricTypeId],
          setType: [this.product.setType],
          minimum: [this.product.minimum],
          videoURL: [this.product.videoURL],
          seatingHeight: [this.product.seatingHeight],
          backSize: [this.product.backSize],
          totalHeight: [this.product.totalHeight],
          width: [this.product.width],
          depth: [this.product.depth],
          overallDimension: [this.product.overallDimension],
          assemblyType: [this.product.assemblyType],
          warranty: [this.product.warranty],
          moq: [this.product.moq],
          guaranteeNotes: [this.product.guaranteeNotes],
          deliveryInformationNotes: [this.product.deliveryInformationNotes],
          suggestionNotes: [this.product.suggestionNotes],
          sku: [this.product.sku],
          wheel: [this.product.wheel, Validators.required],
          armrest: [this.product.armrest, Validators.required],
          base: [this.product.base, Validators.required],
          mechanism: [this.product.mechanism, Validators.required]
        });

        debugger
        if (this.product.frontImage == null || this.product.frontImage == "")
          this.SmallImage = [];
        else {
          //for (let index = 0; index < this.product.frontImage.length; index++) {
          this.SmallImage.push(this.ImagePath + '/' + this.ProductForm.value.productID + '/frontImage/' + this.product.frontImage);
          this.previewUrl = this.SmallImage[0];
          //}
        }
        //bannerImg
        if (this.product.bannerImg == null) {
          //this.previewUrl = null;
        }
        else {
          this.previewUrl = this.product.bannerImg[0];
          for (let index = 0; index < this.product.bannerImg.length; index++) {
            this.BannerImage.push(this.ImagePath + '/' + this.ProductForm.value.productID + '/bannerImage/' + this.product.bannerImg[index]);
          }
          this.previewUrl = this.BannerImage[0];
        }
        this.LoadProductDetail();
        setTimeout(() => {
          this.LoadSubCategory("");
        }, 1000);

        this.LoadFabricType("");
        setTimeout(() => {
          this.route.paramMap.subscribe((params: ParamMap) => {
            debugger
            if (params.get('productId') == null || params.get('productId') == undefined)
              document.getElementById('tab4').click();
          });
        }, 1500);
      }, 500);


      //bannerImg
      // if (res[0].bannerImg == null)
      //   this.previewUrl = null;
      // else {
      //   this.previewUrl = res[0].bannerImg[0];
      //   for (let index = 0; index < res[0].bannerImg.length; index++) {
      //     this.BannerImage.push(res[0].bannerImg[index]);
      //   }
      // }
      //smallImage

      // //ProductImages
      // if (res[0].bannerImg == null)
      //   this.previewUrl = null;
      // else {
      //   //this.previewUrl = res[0].productImg[0];
      //   for (let index = 0; index < res[0].productImg.length; index++) {
      //     this.images.push(res[0].productImg[index]);
      //   }
      // }
      //this.LoadSubCategory("");


    });
  }

  Save() {
    this.submitted = true;
    debugger
    if (this.ProductForm.invalid ||
      this.ProductForm.value.smallImg.length == 0) {
      this.ProductForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      //$('#productName').focus();
      if (this.ProductForm.value.productName == '' ||
        this.ProductForm.value.brandId == '' ||
        this.ProductForm.value.mainCategoryID == '' ||
        this.ProductForm.value.categoryID == '' ||
        this.ProductForm.value.subCategoryID == '' ||
        this.ProductForm.value.supplierID == '') {
        document.getElementById('tab1').click();
      }
      else if (this.ProductForm.value.smallImg.length == 0) {
        document.getElementById('tab5').click();
      }
      else if (this.ProductForm.value.shortDetails == '') {
        //this.ProductForm.value.description == '') {
        document.getElementById('tab2').click();
        //$('#shortDetails').focus();
      }
      return;
    }
    else {
      this.spinner.show();
      let obj = {
        productID: Number(this.ProductForm.value.productID),
        productName: this.ProductForm.value.productName,
        shortDetails: this.ProductForm.value.shortDetails,
        //description: this.ProductForm.value.description,
        supplierID: Number(this.ProductForm.value.supplierID),
        subCategoryID: Number(this.ProductForm.value.subCategoryID),
        brandId: Number(this.ProductForm.value.brandId),
        productAvailable: this.ProductForm.value.productAvailable,
        CreatedBy: Number(this.LoggedInUserId),
        Modifiedby: Number(this.LoggedInUserId),
        featured: this.ProductForm.value.featured,
        latest: this.ProductForm.value.latest,
        onSale: this.ProductForm.value.onSale,
        topSelling: this.ProductForm.value.topSelling,
        hotOffer: this.ProductForm.value.hotOffer,
        active: this.ProductForm.value.active,
        bannerImg: this.ProductForm.value.bannerImg == "" ? [''] : this.ProductForm.value.bannerImg,

        smallImg: this.ProductForm.value.smallImg,
        title: this.ProductForm.value.title,
        subTitle: this.ProductForm.value.subTitle,
        lookupHSNId: Number(this.ProductForm.value.lookupHSNId),
        tagId: Number(this.ProductForm.value.tagId),
        articalNo: this.ProductForm.value.articalNo,
        fabricId: Number(this.ProductForm.value.fabricId),
        fabricTypeId: Number(this.ProductForm.value.fabricTypeId),
        setType: Number(this.ProductForm.value.setType),
        minimum: this.ProductForm.value.setType == "3" ? Number(this.ProductForm.value.minimum) : 0,
        videoURL: this.ProductForm.value.videoURL,
        seatingHeight: this.ProductForm.value.seatingHeight,
        backSize: this.ProductForm.value.backSize,
        totalHeight: this.ProductForm.value.totalHeight,
        width: this.ProductForm.value.width,
        depth: this.ProductForm.value.depth,
        overallDimension: this.ProductForm.value.overallDimension,
        assemblyType: this.ProductForm.value.assemblyType,
        warranty: this.ProductForm.value.warranty,
        moq: this.ProductForm.value.moq,
        guaranteeNotes: this.ProductForm.value.guaranteeNotes,
        deliveryInformationNotes: this.ProductForm.value.deliveryInformationNotes,
        suggestionNotes: this.ProductForm.value.suggestionNotes,
        sku: this.ProductForm.value.sku,
        wheel: this.ProductForm.value.wheel,
        armrest: this.ProductForm.value.armrest,
        base: this.ProductForm.value.base,
        mechanism: this.ProductForm.value.mechanism
      };
      this._productService.SaveProduct(obj).subscribe(res => {
        this.spinner.hide();
        if (res > 0) {
          this.ProductId = res;
          this.LoadProduct();
          debugger
          // this.route.paramMap.subscribe((params: ParamMap) => {
          //   debugger
          //   if (params.get('productId') == null || params.get('productId') == undefined)
          //     $('#tab4').click();
          // });
          this._toasterService.success("Record has been saved successfully.");
        }
        else {
          this._toasterService.error("Server error, Please try again after some time.");
        }
      });
    }
  }

  SaveProductDetails() {
    this.submitted = true;
    debugger
    if (this.ProductDetailForm.invalid) {
      this.ProductDetailForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      return;
    }
    // else if (Number(this.ProductDetailForm.value.salePrice) > Number(this.ProductDetailForm.value.price)) {
    //   this.ProductDetailForm.markAllAsTouched();
    //   this._toasterService.error("Product sale price should be greater than or equal to the price.");
    //   return;
    // }
    else {
      this.spinner.show();
      let obj = {
        productSizeColorId: Number(this.ProductDetailForm.value.productSizeColorId),
        productId: Number(this.ProductId),
        qty: Number(this.ProductDetailForm.value.qty),
        price: Number(this.ProductDetailForm.value.price),
        salePrice: Number(this.ProductDetailForm.value.salePrice),
        availableSize: this.ProductDetailForm.value.availableSize,
        availableColors: this.ProductDetailForm.value.availableColors,
        arraySize: this.ProductDetailForm.value.arraySize,
        arrayColor: this.ProductDetailForm.value.arrayColor,
        discount: Number(this.ProductDetailForm.value.discount),
        discountAvailable: Number(this.ProductDetailForm.value.discount) > 0 ? true : false,
        shippingPrice: Number(this.ProductDetailForm.value.shippingPrice),
        businessPrice: Number(this.ProductDetailForm.value.businessPrice),
        businessDiscount: Number(this.ProductDetailForm.value.businessDiscount),
        // productImg: this.ProductDetailForm.value.productImg,
        CreatedBy: Number(this.LoggedInUserId),
        // CreatedDate:this.ProductForm.value.productName],
        Modifiedby: Number(this.LoggedInUserId),
        // ModifiedDate:this.ProductForm.value.productName],
        SetNo: Number(this.ProductForm.value.setType) == 2 ? (this.dataSource.filteredData.length == 0 ? 1 : 0) : 0
      };
      this._productService.SaveProductSizeColor(obj).subscribe(res => {
        this.spinner.hide();
        if (res > 0) {
          this.IsShow = false;
          this.images = [];
          this.LoadProductDetail();
          this.ResetProductDetails();
          this._toasterService.success("Record has been saved successfully.");
        }
        else {
          this._toasterService.error("Server error, Please try again after some time.");
        }
      });
    }
  }

  UpdateProductDetails() {
    this.submitted = true;
    debugger
    if (this.EditProductDetailForm.invalid) {
      this.EditProductDetailForm.markAllAsTouched();
      this._toasterService.error("All the * marked fields are mandatory");
      return;
    }
    // else if (Number(this.EditProductDetailForm.value.salePrice) > Number(this.EditProductDetailForm.value.price)) {
    //   this.EditProductDetailForm.markAllAsTouched();
    //   this._toasterService.error("Product sale price should be greater than or equal to the price.");
    //   return;
    // }
    else {
      this.spinner.show();
      let obj = {
        productSizeColorId: Number(this.EditProductDetailForm.value.productSizeColorId),
        productSizeId: Number(this.EditProductDetailForm.value.productSizeId),
        productId: Number(this.ProductId),
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
      this._productService.SaveProductSizeColor(obj).subscribe(res => {
        //this.spinner.hide();
        if (res > 0) {
          this.images = [];
          this.LoadProductDetail();
          //this.ResetProductDetails();
          this._toasterService.success("Record has been saved successfully.");
        }
        else {
          this._toasterService.error("Server error, Please try again after some time.");
        }
      });
    }
  }

  SaveProductColorSizeImages() {
    let obj = {
      ProductId: Number(this.ProductId),
      ProductSizeColorId: this.SelectedProductSizeColorId,
      ProductSizeId: this.SelectedProductSizeId,
      productImg: this.PopUpProductImg,
      SetNo: this.SelectedSetNo
    };
    this.spinner.show();
    this._productService.SaveProductSizeColorImages(obj).subscribe(res => {
      this.spinner.hide();
      this.dialog.closeAll();
      this._toasterService.success("Images has been uploaded successfully.");
    });
  }

  onBack() {
    this.router.navigate(['/product']);
  }

  UploadBannerImg(event) {
    debugger
    this.BannerImage = [];
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      // if (event.target.files[0].size / 1024 > 500) {
      //   this._toasterService.error('Photo should be less then 500kb.');
      //   return;
      // }
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          debugger
          //console.log(event.target.result);
          this.BannerImage.push(event.target.result);
          this.previewUrl = event.target.result;
          this.ProductForm.updateValueAndValidity();
          this.ProductForm.patchValue({
            bannerImg: this.BannerImage
          });
          this.ProductForm.updateValueAndValidity();
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  UploadSmallImg(event) {
    debugger
    this.SmallImage = [];
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      debugger
      // if (event.target.files[0].size / 1024 > 500) {
      //   this._toasterService.error('Photo should be less then 500kb.');
      //   return;
      // }
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          debugger
          //console.log(event.target.result);
          this.SmallImage.push(event.target.result);
          this.previewUrl = event.target.result;
          this.ProductForm.updateValueAndValidity();
          this.ProductForm.patchValue({
            smallImg: this.SmallImage
          });
          this.ProductForm.updateValueAndValidity();
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  UploadProductImages(event) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          debugger
          //console.log(event.target.result);
          // if (event.total / 1024 > 500) {
          //   this._toasterService.error('Photo should be less then 500kb.');
          //   return;
          // }
          this.PopUpProductImg.push(event.target.result);
          this.PopUpPreviewUrl = event.target.result;
          // this.EditProductDetailForm.updateValueAndValidity();
          // this.EditProductDetailForm.patchValue({
          //   productImg: this.images
          // });
          // this.EditProductDetailForm.updateValueAndValidity();
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
      if (result) {
        debugger

        // if (type == 'banner') {
        //   this.BannerImage.splice(index, 1);
        //   const bannerImg = this.ProductForm.value.bannerImg;
        //   bannerImg.splice(index, 1);
        //   this.ProductForm.updateValueAndValidity();
        //   this._toasterService.success("Image has been deleted successfully.");
        // }
        if (type == 'banner') {

          let obj = {
            ProductID: Number(this.ProductForm.value.productID),
            ImagePath: (this.BannerImage[index]).split(this.APIURL)[1],
            type: 'banner'
          };
          this._productService.DeleteProductImage(obj).subscribe(a => {
            debugger
            if (type == 'banner') {
              this.BannerImage.splice(index, 1);
              const bannerImg = this.ProductForm.get('bannerImg');
              bannerImg.setValue([]);
              bannerImg.updateValueAndValidity();
              this.previewUrl = "";
            }
            this._toasterService.success("Image has been deleted successfully.");
          });


          //this._toasterService.warning("Please, click on the Save button for permanent remove image from server.");
        }
        if (type == 'small') {

          let obj = {
            ProductID: Number(this.ProductForm.value.productID),
            ImagePath: (this.SmallImage[index]).split(this.APIURL)[1],
            type: 'small'
          };
          this._productService.DeleteProductImage(obj).subscribe(a => {
            debugger
            if (type == 'small') {
              this.SmallImage.splice(index, 1);
              const smallImg = this.ProductForm.get('smallImg');
              smallImg.setValue([]);
              smallImg.updateValueAndValidity();
              this.previewUrl = "";
            }
            this._toasterService.success("Image has been deleted successfully.");
          });
          //this._toasterService.warning("Please, click on the Save button for permanent remove image from server.");
        }
        if (type == 'product') {
          debugger
          //var ProductLst=this.PopUpProductImg;

          //this.PopUpProductImg=ProductLst;
          // const productImg = this.EditProductDetailForm.value.productImg;
          // productImg.splice(index, 1);
          // this.EditProductDetailForm.updateValueAndValidity();
          let obj = {
            ProductID: 0,
            ImagePath: (this.PopUpProductImg[index]).split(this.APIURL)[1]
          };
          this._productService.DeleteProductImage(obj).subscribe(a => {
            this.PopUpProductImg.splice(index, 1);
            this._toasterService.success("Image has been deleted successfully.");
          });
          //this._toasterService.warning("Please, click on the Save button for permanent remove image from server.");
        }
      }
    });
  }

  ShowImage(val) {
    this.previewUrl = val;
  }

  ShowPopUpImage(val) {
    this.PopUpPreviewUrl = val;
  }
  Edit(element) {
    debugger
    //this.images = [];
    this.lstData.forEach(element => {
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
      setNo: this.ProductForm.value.setType != 2 ? [element.setNo] : [element.setNo, Validators.required],
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
          ProductId: Number(this.ProductId),
          SetNo: Number(element.setNo)
        };
        this.spinner.show();
        this._productService.DeleteProductSizeColor(obj).subscribe(res => {
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


  OpenImagePopUp(template: TemplateRef<any>, lst) {
    debugger
    this.PopUpProductImg = [];
    this.SelectedProductSizeColorId = lst.productSizeColorId;
    //this.SelectedProductSizeId = lst.productSizeId;
    //this.PopUpProductImg = lst.productImg;
    this.SelectedSetNo = lst.setNo;
    //ImagePath+'/'+f.productID.value+'/productColorImage/'+SelectedProductSizeColorId+'/'+url
    //ImagePath+'/'+f.productID.value+'/productSetImage/'+SelectedSetNo+'/'+url

    lst.productImg.forEach(element => {
      if (lst.setNo == 0 || lst.setNo == undefined) {
        //this.PopUpPreviewUrl = this.ImagePath + '/' + this.ProductForm.value.productID + '/productColorImage/' + this.SelectedProductSizeColorId + '/' + lst.productImg[0];
        this.PopUpProductImg.push(this.ImagePath + '/' + this.ProductForm.value.productID + '/productColorImage/' + this.SelectedProductSizeColorId + '/' + element);
      }
      else {
        //this.PopUpPreviewUrl = this.ImagePath + '/' + this.ProductForm.value.productID + '/productSetImage/' + this.SelectedSetNo + '/' + lst.productImg[0];
        this.PopUpProductImg.push(this.ImagePath + '/' + this.ProductForm.value.productID + '/productSetImage/' + this.SelectedSetNo + '/' + element);
      }
    });


    // if (lst.setNo == 0) {
    //   this.PopUpPreviewUrl = this.ImagePath + '/' + this.ProductForm.value.productID + '/productColorImage/' + this.SelectedProductSizeColorId + '/' + lst.productImg[0];
    // }
    // else {
    //   this.PopUpPreviewUrl = this.ImagePath + '/' + this.ProductForm.value.productID + '/productSetImage/' + this.SelectedSetNo + '/' + lst.productImg[0];
    // }


    //SelectedProductImages
    this.PopUpPreviewUrl = this.PopUpProductImg[0];

    const dialogRef = this.dialog.open(template, {
      width: '60vw',
      height: '80vh',
      data: lst
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => {
      this.SelectedProductSizeColorId = 0;
      this.SelectedSetNo = 0;
      //this.SelectedProductSizeId = 0;
      this.LoadProductDetail();
    });
  }

  CalculateSalePrice(event: any) {
    debugger
    const salePrice = this.ProductDetailForm.get('salePrice');
    const businessPrice = this.ProductDetailForm.get('businessPrice');

    if (this.ProductDetailForm.value.price != '') {
      let val = Number(this.ProductDetailForm.value.price) + Number(this.ProductDetailForm.value.shippingPrice) + ((Number(this.ProductDetailForm.value.price) + Number(this.ProductDetailForm.value.shippingPrice)) * 18 / 100)
      salePrice.setValue(Number(val));
      salePrice.updateValueAndValidity();
      businessPrice.setValue(Number(this.ProductDetailForm.value.price));
      businessPrice.updateValueAndValidity();
    }
    else {
      salePrice.setValue(0);
      salePrice.updateValueAndValidity();
      businessPrice.setValue(Number(this.ProductDetailForm.value.price));
      businessPrice.updateValueAndValidity();
    }
    this.CalculateDiscount('');
  }

  CalculateDiscount(event: any) {
    debugger
    const businessPrice = this.ProductDetailForm.get('businessPrice');
    const businessDiscount = this.ProductDetailForm.get('businessDiscount');

    if (this.ProductDetailForm.value.businessDiscount != '') {
      if (Number(this.ProductDetailForm.value.price) < Number(this.ProductDetailForm.value.businessDiscount)) {
        businessDiscount.setValue(0);
        businessDiscount.updateValueAndValidity();
        businessPrice.setValue(Number(this.ProductDetailForm.value.price));
        businessPrice.updateValueAndValidity();
        this.ProductDetailForm.markAllAsTouched();
        this._toasterService.error("Product ex-factory price should be greater than the business Discount.");
      }
      else {
        var Decrease = (Number(this.ProductDetailForm.value.price) - Number(this.ProductDetailForm.value.businessDiscount));
        businessPrice.setValue(Number(Decrease));
        businessPrice.updateValueAndValidity();
      }
    }
    else {
      businessPrice.setValue(Number(this.ProductDetailForm.value.price));
      businessPrice.updateValueAndValidity();
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
