import Stripe from "stripe";

interface IStripePayment {
  makePayment(data: any, previousUrl: string): Promise<any>;
  processRefund(paymentId: string, price: number): Promise<Stripe.Refund>;
}

export default IStripePayment;
