import { Component, OnInit } from '@angular/core';
import {ContactService} from "../../services/contact.service";
import {SnackbarService} from "../shared/snackbar.service";
import {ReCaptchaV3Service} from "ng-recaptcha";

@Component({
  selector: 'app-getting-touch',
  templateUrl: './getting-touch.component.html',
  styleUrls: ['./getting-touch.component.css']
})
export class GettingTouchComponent implements OnInit {
  loading = false;
  countryCode = '';
  constructor(
    private contactService: ContactService,
    public readonly snackbar: SnackbarService,
    private recaptchaV3Service: ReCaptchaV3Service
  ) { }

  ngOnInit(): void {
  }

  onClickSubmit(data: any) {
    this.loading = true;
    this.recaptchaV3Service.execute('importantAction')
      .subscribe((token: string) => {
        data.phone = this.countryCode + ' ' + data.phone;
        this.contactService.sendEmail(data.name, data.email, data.phone, data.message).subscribe(
          data => {
            if (data.message == 'success') {
              this.snackbar.warn('Thank you! Your message has been sent!', '')
            } else {
              this.snackbar.error('An error occurred, please try again later!', '');
            }
            this.loading = false;

          }, error => {
            console.log(error);
          }
        );
      });
  }

  public getNumber(event: any) {
    alert(event.dialCode);
  }

  public onCountryChange(event:any) {
    this.countryCode = event.dialCode;
  }

}
