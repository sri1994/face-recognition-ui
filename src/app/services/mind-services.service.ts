import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";



@Injectable({
  providedIn: "root"
})
export class MindServicesService {
  private AWS_IMAGE_RECOGNITION_URL =
    "https://hcgho2xmq5.execute-api.ap-south-1.amazonaws.com/Prod/resource";

  public mindsData: any;

  constructor(private httpClient: HttpClient) { }

  public getMindDetails(imageDataInBase64: string): Observable<any> {
    console.log("I am in get mind details");
    const jsonObject: any = {
      key1: imageDataInBase64.replace(/^data:image\/\w+;base64,/, "")
    };
    console.log("jsonObject :", jsonObject);
    return this.httpClient.post(this.AWS_IMAGE_RECOGNITION_URL, jsonObject);
  }

  // , { responseType: "text" }

  public getXlData(): void {
    this.httpClient
      .get("assets/mindfaceinfo.xlsx", { responseType: "text" as "json" })
      .subscribe(data => {
        console.log("Data :", data);
      });
  }

  public getMindsData() {
    this.httpClient.get('assets/minds_data.json').subscribe(mindsData => {
      this.mindsData = mindsData;
    });
  }
}
