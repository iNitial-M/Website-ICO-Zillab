import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { faTelegram} from "@fortawesome/free-brands-svg-icons";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  faTelegram = faTelegram;
  environment = environment;

  constructor() { }

  ngOnInit(): void {
  }

}
