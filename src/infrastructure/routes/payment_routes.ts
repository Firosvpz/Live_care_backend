import express from "express";
const paymentRouter = express.Router();
import PaymentController from "../../adapters/controllers/paymentController";
// import serviceProviderAuth from "infrastructure/middlewares/serviceProviderAuth";
import userAuth from "../../infrastructure/middlewares/userAuth";
import PaymentRepository from "../../infrastructure/repositories/paymentRepository";
import StripePayment from "../../infrastructure/utils/stripePayment";
import PaymentUseCase from "../../usecases/paymentUsecase";
import serviceProviderAuth from "../../infrastructure/middlewares/serviceProviderAuth";

const stripe = new StripePayment();
const paymentRepository = new PaymentRepository();

const useCase = new PaymentUseCase(stripe, paymentRepository);
const controller = new PaymentController(useCase);

paymentRouter.post("/create-payment", userAuth, (req, res, next) =>
  controller.makePayment(req, res, next),
);
paymentRouter.post(
  "/webhook",
  express.raw({
    type: ["application/json", "application/json; charset=utf-8"],
  }),
  (req, res, next) => {
    // Log the request body and headers to check if the webhook is called
    console.log("Webhook received:", {
      headers: req.headers,
      body: req.body.toString(), // Convert Buffer to string for better readability
    });

    // Call the controller's handleWebhook method
    controller.handleWebhook(req, res, next);
  },
);

paymentRouter.post("/cancelBooking/:id", userAuth, (req, res, next) =>
  controller.cancelBooking(req, res, next),
);

paymentRouter.post("/refund/:id", serviceProviderAuth, (req, res, next) =>
  controller.processRefund(req, res, next),
);

export default paymentRouter;
