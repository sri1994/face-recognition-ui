import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface DialogData {
  type: string;
  status: string;
  errorMessage: string;
  mindDetails: {
    mid: string;
    name: string;
    phase: string;
    mindImageUrl: string;
  };
}

@Component({
  selector: "app-mind-details-modal",
  templateUrl: "./mind-details-modal.component.html",
  styleUrls: ["./mind-details-modal.component.scss"]
})
export class MindDetailsModalComponent implements OnInit {
  public isShowMidFormComponent: boolean;
  public isGenerateIdCard: boolean;

  constructor(
    public dialogRef: MatDialogRef<MindDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData
  ) {
    this.isShowMidFormComponent = false;
    this.isGenerateIdCard = false;
  }

  ngOnInit() {
    console.log('RSAFSF :', this.dialogData);
    if (this.dialogData.status === 'generate-id') {
      this.isGenerateIdCard = true;
    } else {
      this.isGenerateIdCard = false;
    }
    this.isShowMidFormComponent =
      this.dialogData.status === "failure" ? true : false;
  }

  public onOkClick(): void {
    this.dialogRef.close();
  }

  public setMindDetails(event: any): void {
    console.log("setMindDetails event :", event);
    this.isShowMidFormComponent = false;
    this.dialogData.status = "success";
    this.dialogData.mindDetails = event;
    if (!this.dialogData.mindDetails) {
      this.dialogData.status = 'failure';
      this.dialogData.errorMessage = '';
    }
    console.log('this.dialogData :', this.dialogData);
  }

  public onGenerateIdClick(): void {
    this.dialogRef.close('generate-id');
  }

  public onPrintClick(): void {
    window.print();
  }
}
