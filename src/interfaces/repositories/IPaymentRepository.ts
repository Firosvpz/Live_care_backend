
interface IPaymentRepository {
  bookSlot(data: any): Promise<void | null>;

  cancelBooking(
    id: string,
    cancellationReason: string,
  ): Promise<{ success: boolean; message?: string }>;

  processRefund(id: string): Promise<{ success: boolean; booking?: any }>;
}

export default IPaymentRepository;
