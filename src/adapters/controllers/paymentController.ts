import { Request, Response, NextFunction } from "express";
import { logger } from "../../infrastructure/utils/combine_log";
import PaymentUseCase from "../../usecases/paymentUsecase";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_API_SECRET || "");
class PaymentController {
  constructor(private paymentCase: PaymentUseCase) {}

  // Make Payment
  async makePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, previousUrl } = req.body;
      const userId = req.userId?.toString();
      const { serviceProviderId, slots } = data;
      const { schedule, date } = slots;
      const { title, price, description, to, from, _id } = schedule;
      const roomId = uuidv4();

      const info = {
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
      };

      const response = await this.paymentCase.makePayment(info, previousUrl);
      logger.info("Payment initiated successfully", {
        userId,
        serviceProviderId,
      });
      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      logger.error("Error initiating payment", { error });
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    console.log("gvghvhv");

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!.toString();

    console.log("Received webhook request");
    console.log("Headers:", req.headers);
    console.log("Raw Body:", req.body.toString("utf8")); // Ensure this is a string for logging
    console.log("endpoint: ", endpointSecret);

    const sig: any = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("Webhook signature verified successfully");
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        console.log("Inside checkout.session.completed");
        const session = event.data.object;
        await this.paymentCase.handleSuccessfulPayment(session);
        break;

      case "invoice.payment_succeeded":
        console.log("Inside invoice.payment_succeeded");
        const invoice = event.data.object;

        if (invoice.metadata && invoice.metadata.userId) {
          const userId = invoice.metadata.userId;

          console.log("user id in switch : ", userId);
        } else {
          console.warn("Invoice metadata or userId is missing");
        }
        break;

      default:
      // console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true });
  }

  // Cancel Booking
  async cancelBooking(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      if (!cancellationReason) {
        res.status(400).json({ message: "Cancellation reason is required." });
        return;
      }

      const result = await this.paymentCase.cancelBooking(
        id,
        cancellationReason,
      );

      if (result.success) {
        logger.info("Booking cancelled successfully", { bookingId: id });
        res.status(200).json({ message: "Booking cancelled successfully." });
      } else {
        logger.warn("Booking not found for cancellation", { bookingId: id });
        res.status(404).json({ message: "Booking not found." });
      }
    } catch (error) {
      logger.error("Error while cancelling booking", { error });
      next(error);
    }
  }

  // process refund
  async processRefund(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      console.log("Processing refund with:", { id, amount });

      if (!id) {
        res.status(400).json({ message: "Payment Intent ID is required." });
        return;
      }

      await this.paymentCase.processRefund(id, amount);
      res
        .status(200)
        .json({ success: true, message: "Refund processed successfully." });
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;
