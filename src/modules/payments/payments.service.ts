import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto, VerifyPaymentDto } from './dto/payment.dto';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = this.paymentRepo.create(dto);
    return this.paymentRepo.save(payment);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id }, relations: ['order'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async verify(id: string, dto: VerifyPaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    
    payment.status = dto.status;
    payment.transactionId = dto.transactionId;
    
    return this.paymentRepo.save(payment);
  }
}
