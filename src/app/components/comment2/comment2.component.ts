import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-comment2',
  templateUrl: './comment2.component.html',
  styleUrls: ['./comment2.component.css']
})
export class Comment2Component implements OnInit {

  public environment = environment;

  constructor() { }

  ngOnInit(): void {
  }

}
