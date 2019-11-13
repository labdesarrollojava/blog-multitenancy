import { ICompany } from 'app/shared/model/company.model';

export interface IBlog {
  id?: number;
  name?: string;
  handle?: string;
  company?: ICompany;
}

export class Blog implements IBlog {
  constructor(public id?: number, public name?: string, public handle?: string, public company?: ICompany) {}
}
