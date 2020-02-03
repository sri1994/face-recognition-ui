import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";

import { NgxSpinnerService } from "ngx-spinner";
import { MindDetailsModalComponent } from "./mind-details-modal/mind-details-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { DeviceDetectorService } from "ngx-device-detector";
import { FileSaverService } from "ngx-filesaver";
import { MindServicesService } from "./services/mind-services.service";
import { HttpErrorResponse } from "@angular/common/http";

export interface DialogData {
  type: string;
  status: string;
  errorMessage: string;
  mindDetails: {
    mid: string;
    name: string;
    mindImageUrl: string;
  };
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit {
  @ViewChild("video", { static: false }) public video: ElementRef;
  @ViewChild("canvas", { static: false }) public canvas: ElementRef;

  public captures: Array<any>;
  public imageUrl: any = "";
  public deviceInfo: any;
  public isMobile: boolean;
  public isDesktop: boolean;
  public isTablet: boolean;
  public isSmallScreen: boolean;
  public isCameraFrontFacing: boolean;
  public mediaStream: MediaStream;

  // Temp variables
  public simulateFailureScenario: boolean;
  public sampleDialogData: DialogData;

  // public tracking: any;
  public constructor(
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private deviceService: DeviceDetectorService,
    private fileSaverService: FileSaverService,
    private mindServices: MindServicesService
  ) {
    this.captures = [];
    this.simulateFailureScenario = false;
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
    this.isSmallScreen = this.isMobile || this.isTablet ? true : false;
    this.isCameraFrontFacing = false;
    this.mindServices.getMindsData();
  }

  // public ngOnInit() {
  //   this.mindServices.getXlData();
  // }

  public ngAfterViewInit() {
    this.initializeTheWebCam();
  }

  public capture() {
    console.log('INSIDE CAPTURE :', this.mindServices.mindsData);
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(this.video.nativeElement, 0, 0, 300, 260);

    // ********************************//

    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        value: (callback, type, quality) => {
          setTimeout(() => {
            const binStr = atob(
              this.canvas.nativeElement.toDataURL(type, quality).split(",")[1]
            );
            const len = binStr.length;
            const uintArray = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              uintArray[i] = binStr.charCodeAt(i);
            }
            callback(new Blob([uintArray], { type: type || "image/png" }));
          });
        }
      });
    }

    // *******************************//
    this.canvas.nativeElement.toBlob((blob: Blob) => {
      this.fileSaverService.save(
        blob,
        "MT_MIND_" + new Date().getMilliseconds().toString()
      );
    });
    this.captures.push(this.canvas.nativeElement.toDataURL("jpg/png"));
    console.log(this.captures);
    sessionStorage.setItem("item1", this.captures[0]);
    this.spinner.show();
    this.mindServices.getMindDetails(this.captures[0]).subscribe(
      (imageData: any) => {
        console.log("ImageData :", imageData);
        if (
          imageData &&
          !imageData.errorMessage &&
          imageData.MID !== "Not recognized by the system"
        ) {
          this.sampleDialogData = {
            type: "check-in",
            status: "success",
            errorMessage: "",
            mindDetails: {
              mid: imageData && imageData.MID ? imageData.MID : "-",
              name: imageData && imageData.MID ? this.mindServices.mindsData[imageData.MID.slice(1)] : "-",
              mindImageUrl: sessionStorage.getItem("item1")
            }
          };
        } else {
          let errorMessage: string;

          if (imageData && imageData.errorMessage) {
            errorMessage = imageData.errorMessage;
          } else if (
            imageData &&
            imageData.MID === "Not recognized by the system"
          ) {
            errorMessage = imageData.MID;
          }
          this.sampleDialogData = {
            type: "check-in",
            status: "failure",
            mindDetails: null,
            errorMessage
          };
        }
        this.spinner.hide();
        this.openDialog('failure');
      },
      (error: HttpErrorResponse) => {
        console.log("Error :", error);
        this.sampleDialogData = {
          type: "check-in",
          status: "failure",
          mindDetails: null,
          errorMessage: error.error + "" + error.message
        };
        this.spinner.hide();
        this.openDialog('failure');
      }
    );

    // setTimeout(() => {
    //   this.spinner.hide();
    //   this.openDialog();
    // }, 2000);
  }

  // "https://picsum.photos/id/1/70/70",

  public openDialog(status: any): void {
    // mindDetails: {
    //   mid: "M1055236",
    //   name: "Srinivas Prasad H R",
    //   mindImageUrl: "https://picsum.photos/id/1/200/200",
    //   phase: "3"
    // }

    // https://picsum.photos/id/218/300/

    let panelClass = '';

    if (status !== 'generate-id') {

      if (this.sampleDialogData.status === 'success') {
        panelClass = 'custom-modal-success';
      } else if (this.sampleDialogData.errorMessage !== 'Not recognized by the system') {
        if (this.sampleDialogData.errorMessage.includes('no face')) {
          panelClass = 'custom-modal-no-face';
        } else {
          panelClass = 'custom-modal-general-error';
        }
      } else {
        panelClass = 'custom-modal-not-mind';
      }

    } else {
      panelClass = '';
      this.sampleDialogData.status = 'generate-id';
    }

    const dialogRef = this.dialog.open(MindDetailsModalComponent, {
      width: "600px",
      data: this.sampleDialogData,
      panelClass
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'generate-id') {
        console.log('RESULT :', result);
        this.openDialog(result);
      } else {
        this.captures = [];
        this.initializeTheWebCam();
      }
    });
  }

  public changeCameraFacing(type: string): void {
    this.video.nativeElement.pause();
    this.video.nativeElement.srcObject = null;
    // if (!this.mediaStream) {
    //   this.mediaStream.
    //   this.mediaStream.getTracks().forEach(t => {
    //     t.stop();
    //   });
    // }
    if (type === "front") {
      this.isCameraFrontFacing = true;
    } else if (type === "back") {
      this.isCameraFrontFacing = false;
    }
    this.initializeTheWebCam();
  }

  public initializeTheWebCam(): void {
    const mode: any = "user";
    // if (this.isSmallScreen && this.isCameraFrontFacing) {
    //   mode = "user";
    // } else if (this.isSmallScreen && !this.isCameraFrontFacing) {
    //   mode = "environment";
    // } else if (!this.isSmallScreen) {
    //   mode = "user";
    // }

    console.log('trackig ;', tracking);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("Mode :", mode);
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { exact: mode } } })
        .then(stream => {
          this.mediaStream = stream;
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
        });
    }

    // const context = this.canvas.nativeElement.getContext('2d');
    // const canvas = document.getElementById('canvas');
    const context = this.canvas.nativeElement
      .getContext("2d");

    const tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    tracking.track(document.getElementById('video'), tracker, { camera: true });

    tracker.on('track', (event) => {
      // console.log('event', event);
      context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      event.data.forEach((rect: any) => {
        context.strokeStyle = '#8A0051';

        // const gradient = context.createLinearGradient(0, 0, 170, 0);
        // gradient.addColorStop("0", "magenta");
        // gradient.addColorStop("0.5", "blue");
        // gradient.addColorStop("1.0", "red");

        // Fill with gradient
        // context.strokeStyle = gradient;
        context.lineWidth = 3;
        // context.strokeRect(20, 20, 150, 100);
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.font = '11px Helvetica';
        context.fillStyle = "#fff";
        context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
      });
      // console.log(context);
    });
    console.log('tracker :', tracker);
  }

  public reset(): void {
    console.log(this.captures);
    this.captures = [];
    this.initializeTheWebCam();
  }

  public dataURItoBlob(dataURI: any): Blob {
    console.log("DataURI :", dataURI);
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: "image/jpeg" });
    console.log("Blob :", blob);
    return blob;
  }
}
