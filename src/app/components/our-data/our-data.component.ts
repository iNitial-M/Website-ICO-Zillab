import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-our-data',
  templateUrl: './our-data.component.html',
  styleUrls: ['./our-data.component.css']
})
export class OurDataComponent implements OnInit {

  public environment = environment;
  constructor() { }

  ngOnInit(): void {
  }

}
