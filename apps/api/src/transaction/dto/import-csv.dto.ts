import { IsString } from 'class-validator';

export class ImportCsvDto {
  @IsString()
  accountId: string;

  // Le CSV sera passé en raw string
  // Le parsing se fait côté service
}