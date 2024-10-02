import IPaymentRepository from "../interfaces/repositories/IPaymentRepository";
import IStripePayment from "../interfaces/utils/IStripePayment";
import { ScheduledBookingModel } from "../infrastructure/database/bookingModel";
import { ProviderSlotModel } from "../infrastructure/database/slotModel";
import { logger } from "../infrastructure/utils/combine_log";

class PaymentUseCase {
  constructor(
    private stripePayment: IStripePayment,
    private paymentRepository: IPaymentRepository,
  ) {}

  async makePayment(info: any, previousUrl: string) {
    try {
      if (!info || !info.userId) {
        throw new Error("Invalid payment information or missing user ID");
      }

      logger.info(
        `Initiating payment for user: ${info.userId}, from URL: ${previousUrl}`,
      );

      const response = await this.stripePayment.makePayment(info, previousUrl);
      if (!response) {
        throw new Error("Payment failed");
      }

      logger.info(
        `Payment successful for user: ${info.userId}, Payment ID: ${response.paymentIntentId}`,
      );
      return response;
    } catch (error) {
      logger.error(
        `Error during payment for user: ${info?.userId || "unknown"}: ${error}`,
      );
      throw error;
    }
  }

  async handleSuccessfulPayment(session: any) {
    try {
      logger.info(`Handling successful payment for session ID: ${session.id}`);
      // console.log('hyyy');

      const {
        serviceProviderId,
        to,
        from,
        _id,
        date,
        userId,
        price,
        title,
        description,
        roomId,
      } = session.metadata;

      const paymentIntentId = session.payment_intent;
      if (!paymentIntentId) {
        throw new Error("Payment Intent ID is missing from session data");
      }

      logger.info(
        `Booking slot for provider: ${serviceProviderId}, user: ${userId}`,
      );

      const booking = await this.paymentRepository.bookSlot({
        serviceProviderId,
        to,
        from,
        _id,
        date,
        userId,
        price,
        title,
        description,
        roomId,
        paymentIntentId,
      });
      console.log("booking", booking);

      if (!booking) {
        throw new Error("Failed to book the slot after payment");
      }

      logger.info(
        `Slot booked successfully for user: ${userId}, provider: ${serviceProviderId}`,
      );
    } catch (error) {
      logger.error(`Error handling successful payment: ${error}`);
      throw error;
    }
  }

  async cancelBooking(
    id: string,
    cancellationReason: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!id) {
        return { success: false, message: "Booking ID is required." };
      }
      if (!cancellationReason) {
        return { success: false, message: "Cancellation reason is required." };
      }

      logger.info(
        `Cancelling booking with ID: ${id}, Reason: ${cancellationReason}`,
      );
      return await this.paymentRepository.cancelBooking(id, cancellationReason);
    } catch (error) {
      logger.error(`Error cancelling booking: ${error}`);
      throw error;
    }
  }

  async processRefund(
    id: string,
    price: number,
  ): Promise<{ success: boolean }> {
    const booking = await ScheduledBookingModel.findById(id);
    if (!booking) {
      throw new Error("Booking not found.");
    }

    const { paymentIntentId, serviceProviderId, date, fromTime, toTime } =
      booking;
    if (!paymentIntentId) {
      throw new Error("Payment Intent ID not found for this booking.");
    }

    console.log(
      `Processing refund for payment ID: ${paymentIntentId}, Amount: ${price}`,
    );

    const refund = await this.stripePayment.processRefund(
      paymentIntentId,
      price,
    );
    if (!refund) {
      throw new Error("Refund failed.");
    }

    const updateResult = await this.paymentRepository.processRefund(id);
    if (!updateResult.success) {
      throw new Error("Failed to update booking status.");
    }

    await ProviderSlotModel.updateOne(
      {
        serviceProviderId,
        "slots.date": date,
        "slots.schedule.from": fromTime,
      },
      { $set: { "slots.$.schedule.$[sch].status": "open" } },
      { arrayFilters: [{ "sch.from": fromTime, "sch.to": toTime }] },
    );

    return { success: true };
  }
}

export default PaymentUseCase;
