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
export class AppComponent implements OnInit, AfterViewInit {
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
  }

  public ngOnInit() {}

  public ngAfterViewInit() {
    this.initializeTheWebCam();
  }

  public capture() {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(this.video.nativeElement, 0, 0, 300, 260);
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
              name: imageData && imageData.Name ? imageData.Name : "-",
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
        this.openDialog();
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
        this.openDialog();
      }
    );

    // setTimeout(() => {
    //   this.spinner.hide();
    //   this.openDialog();
    // }, 2000);
  }

  // "https://picsum.photos/id/1/70/70",

  public openDialog(): void {
    // mindDetails: {
    //   mid: "M1055236",
    //   name: "Srinivas Prasad H R",
    //   mindImageUrl: "https://picsum.photos/id/1/200/200",
    //   phase: "3"
    // }

    // https://picsum.photos/id/218/300/300

    const dialogRef = this.dialog.open(MindDetailsModalComponent, {
      width: "600px",
      data: this.sampleDialogData
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.captures = [];
      this.initializeTheWebCam();
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
  }

  public reset(): void {
    console.log(this.captures);
    this.captures = [];
    this.initializeTheWebCam();
  }

  // public someMethod(): void {
  //   Deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');

  // }

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
