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

export interface DialogData {
  type: string;
  status: string;
  mindDetails: {
    mid: string;
    name: string;
    phase: string;
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

  // Temp variables
  public simulateFailureScenario: boolean;
  public sampleDialogData: DialogData;

  public constructor(
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) {
    this.captures = [];
    this.simulateFailureScenario = false;
  }

  public ngOnInit() {}

  public ngAfterViewInit() {
    this.initializeTheWebCam();
  }

  public capture() {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(this.video.nativeElement, 0, 0, 300, 260);
    this.captures.push(this.canvas.nativeElement.toDataURL("jpg/png"));
    console.log(this.captures);
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
      this.openDialog();
    }, 4000);
  }

  public openDialog(): void {
    if (this.simulateFailureScenario) {
      this.sampleDialogData = {
        type: "check-in",
        status: "failure",
        mindDetails: null
      };
    } else {
      this.sampleDialogData = {
        type: "check-in",
        status: "success",
        mindDetails: {
          mid: "M1055236",
          name: "Srinivas Prasad H R",
          mindImageUrl: "https://picsum.photos/id/1/200/200",
          phase: "3"
        }
      };
    }

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

  public initializeTheWebCam(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
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
}
