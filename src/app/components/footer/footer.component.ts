import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import {ContactService} from "../../services/contact.service";
import {SnackbarService} from "../shared/snackbar.service";
import {ReCaptchaV3Service} from "ng-recaptcha";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  public loading: boolean = false;
  public environment = environment;
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
        this.contactService.subscribeUser(data.email).subscribe(
          data => {
            if (data.message == 'success') {
              this.snackbar.warn('Thank you! We added you to the subscriber list.', '')
            } else {
              this.snackbar.error('An error occurred, please try again later!', '');
            }
            this.loading = false;

          }, error => {
            console.log(error);
          }
        );
      }, e => {
        console.log(e);
      });

  }
}
