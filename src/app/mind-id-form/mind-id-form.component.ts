import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MindServicesService } from './../services/mind-services.service';

@Component({
  selector: "app-mind-id-form",
  templateUrl: "./mind-id-form.component.html",
  styleUrls: ["./mind-id-form.component.scss"]
})
export class MindIdFormComponent implements OnInit {
  @Output() mindDetails: EventEmitter<any> = new EventEmitter<any>();
  public midForm: FormGroup;

  constructor(private mindService: MindServicesService) {
    this.midForm = new FormGroup({
      mid: new FormControl("", Validators.required)
    });
  }

  ngOnInit() { }

  public searchMindWithMid(): void {
    console.log(this.midForm.value);

    const mid = this.midForm.get('mid').value.toUpperCase();

    const name = this.mindService.mindsData[mid.slice(1)];

    let mindData: any = '';

    if (name) {

      mindData = {
        mid,
        name,
        mindImageUrl: "https://picsum.photos/id/1/200/200",
        phase: "3"
      };

    }

    this.mindDetails.emit(mindData);

  }
}
