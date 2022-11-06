import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-statistic',
  templateUrl: './how-to-buy.component.html',
  styleUrls: ['./how-to-buy.component.css']
})
export class HowToBuyComponent implements OnInit {

  public environment = environment;

  constructor() { }

  ngOnInit(): void {
  }

}
