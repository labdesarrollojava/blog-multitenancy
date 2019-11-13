import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiAlertService } from 'ng-jhipster';
import { IBlog, Blog } from 'app/shared/model/blog.model';
import { BlogService } from './blog.service';
import { ICompany } from 'app/shared/model/company.model';
import { CompanyService } from 'app/entities/company/company.service';

@Component({
  selector: 'jhi-blog-update',
  templateUrl: './blog-update.component.html'
})
export class BlogUpdateComponent implements OnInit {
  currentAccount: any;

  isSaving: boolean;

  companies: ICompany[];

  editForm = this.fb.group({
    id: [],
    name: [null, [Validators.required, Validators.minLength(3)]],
    handle: [null, [Validators.required, Validators.minLength(2)]],
    company: [null, Validators.required]
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected blogService: BlogService,
    protected companyService: CompanyService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private accountService: AccountService
  ) {
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
  }

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ blog }) => {
      if (this.currentAccount.company) {
        blog.company = this.currentAccount.company;
      }
      this.updateForm(blog);
    });
    if (this.currentAccount.company) {
      return;
    }

    this.companyService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<ICompany[]>) => mayBeOk.ok),
        map((response: HttpResponse<ICompany[]>) => response.body)
      )
      .subscribe((res: ICompany[]) => (this.companies = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(blog: IBlog) {
    this.editForm.patchValue({
      id: blog.id,
      name: blog.name,
      handle: blog.handle,
      company: blog.company
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const blog = this.createFromForm();
    if (blog.id !== undefined) {
      this.subscribeToSaveResponse(this.blogService.update(blog));
    } else {
      this.subscribeToSaveResponse(this.blogService.create(blog));
    }
  }

  private createFromForm(): IBlog {
    return {
      ...new Blog(),
      id: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      handle: this.editForm.get(['handle']).value,
      company: this.editForm.get(['company']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBlog>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackCompanyById(index: number, item: ICompany) {
    return item.id;
  }
}
