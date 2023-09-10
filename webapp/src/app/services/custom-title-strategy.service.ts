import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';
import { SubPageTitleService } from './sub-page-title.service';


@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  websiteTitle = 'RWT';
  constructor(private readonly title: Title, private readonly subPageTitle: SubPageTitleService ) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.buildTitle(routerState);
    this.subPageTitle.setTitle(title);
    if (title !== undefined) {
      this.title.setTitle(`${this.websiteTitle} - ${title}`);
    } else {
      this.title.setTitle(this.websiteTitle);
    }
  }
}
