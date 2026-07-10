import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base/base.service';
import { ReadDonationDto, WriteDonationDto, UpdateDonationDto } from '../models/donation.models';

@Injectable({ providedIn: 'root' })
export class DonationService extends BaseService<ReadDonationDto, WriteDonationDto, UpdateDonationDto> {
  constructor(http: HttpClient) {
    super(http, 'Donation');
  }
}
