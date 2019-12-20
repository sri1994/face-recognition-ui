import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-mind-id-form",
  templateUrl: "./mind-id-form.component.html",
  styleUrls: ["./mind-id-form.component.scss"]
})
export class MindIdFormComponent implements OnInit {
  @Output() mindDetails: EventEmitter<any> = new EventEmitter<any>();
  public midForm: FormGroup;

  constructor() {
    this.midForm = new FormGroup({
      mid: new FormControl("", Validators.required)
    });
  }

  ngOnInit() {}

  public searchMindWithMid(): void {
    console.log(this.midForm.value);
    const mindData: any = {
      mid: "M1055236",
      name: "Srinivas Prasad H R",
      mindImageUrl: "https://picsum.photos/id/1/200/200",
      phase: "3"
    };
    this.mindDetails.emit(mindData);
  }
}
