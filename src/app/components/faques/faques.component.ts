import { Component, AfterViewInit } from '@angular/core';
import * as $ from "jquery";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-faques',
  templateUrl: './faques.component.html',
  styleUrls: ['./faques.component.css']
})
export class FaquesComponent implements AfterViewInit {

  public environment = environment;

  public faqs = environment.faq;

  constructor() { }

  ngAfterViewInit() {
    $('.faq-cont:not(.active)').hide();
    $('.faq-title').click(function () {
      if (!$(this).hasClass('active')) {
        $('.faq-title').removeClass('active');
        $(this).addClass('active');
        $('.faq-cont').hide('fast');
        $(this).next('.faq-cont').show('fast');
      } else {
        $(this).removeClass('active');
        $(this).next('.faq-cont').hide('fast');
      }
    });
  }

}

