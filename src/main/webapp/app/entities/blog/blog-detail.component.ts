import { Component, OnInit } from '@angular/core';
import { AccountService } from 'app/core/auth/account.service';
import { ActivatedRoute } from '@angular/router';

import { IBlog } from 'app/shared/model/blog.model';

@Component({
  selector: 'jhi-blog-detail',
  templateUrl: './blog-detail.component.html'
})
export class BlogDetailComponent implements OnInit {
  currentAccount: any;
  blog: IBlog;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit() {
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
    this.activatedRoute.data.subscribe(({ blog }) => {
      this.blog = blog;
    });
  }

  previousState() {
    window.history.back();
  }
}
