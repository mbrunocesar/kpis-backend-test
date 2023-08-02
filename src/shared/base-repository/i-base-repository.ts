import {
  IFindManyOptions,
  IPaginateHelper,
} from './helpers/paginate-helper/i-paginate';

export interface IBaseRepository<T> extends IPaginateHelper<T> {
  findAndCount(options?: IFindManyOptions): Promise<[T[], number]>;
}
