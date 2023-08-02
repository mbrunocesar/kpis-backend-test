import { IBaseRepository } from '@shared/base-repository/i-base-repository';
import { PaginateRequestDto } from './dto/paginate-request.dto';
import { IPaginate, IPaginateHelper } from './i-paginate';

export class PaginateHelper<T> implements IPaginateHelper<T> {
  constructor(private repo: IBaseRepository<T>) {}

  async paginate(
    { count, page }: PaginateRequestDto,
    relations?: string[],
  ): Promise<IPaginate<T>> {
    const currentPage = page || 1;
    const take = count || 4;

    const [result, _] = await this.repo.findAndCount({
      relations: relations,
      take,
      skip: (currentPage - 1) * take,
    });

    return <IPaginate<T>>{
      page: currentPage,
      items: result,
    };
  }
}
