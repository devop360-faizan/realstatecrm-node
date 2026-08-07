const Stripe = require("stripe");
const logger = require("../utils/logger");
const adminSettingsService = require("./adminSettings.service");

class StripeService {
  /**
   * Build a fresh Stripe instance using secret key from DB (adminSettings)
   */
  async _getStripe() {
    const settings = await adminSettingsService.getSystemSettings();
    const secretKey = settings.integrations.stripe.secretKey;

    if (!secretKey) {
      return null;
    }

    return new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }

  /**
   * Create Stripe Product with both Monthly & Yearly Prices
   */
  async createPlanOnStripe({ name, monthlyPrice, yearlyPrice, description }) {
    try {
      const stripe = await this._getStripe();
      if (!stripe) {
        logger.warn("Stripe secret key missing in admin settings. Skipping Stripe sync.");
        return { stripeProductId: null, stripePriceIdMonthly: null, stripePriceIdYearly: null };
      }

      // 1. Create Product on Stripe
      const product = await stripe.products.create({
        name,
        description: description || `Freehold SaaS ${name} Plan`,
      });

      // 2. Create Recurring Monthly Price on Stripe
      const monthlyPriceObject = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(monthlyPrice * 100),
        currency: "usd",
        recurring: { interval: "month" },
      });

      // 3. Create Recurring Yearly Price on Stripe
      const yearlyPriceObject = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(yearlyPrice * 100),
        currency: "usd",
        recurring: { interval: "year" },
      });

      logger.info(`✅ Stripe Product & Prices Created: Product ${product.id} | Monthly ${monthlyPriceObject.id} | Yearly ${yearlyPriceObject.id}`);

      return {
        stripeProductId: product.id,
        stripePriceIdMonthly: monthlyPriceObject.id,
        stripePriceIdYearly: yearlyPriceObject.id,
      };
    } catch (error) {
      logger.error(`❌ Stripe Product Creation Failed: ${error.message}`);
      return { stripeProductId: null, stripePriceIdMonthly: null, stripePriceIdYearly: null };
    }
  }

  /**
   * Update Stripe Product & Prices when Plan is edited
   */
  async updatePlanOnStripe({
    stripeProductId,
    stripePriceIdMonthly,
    stripePriceIdYearly,
    name,
    monthlyPrice,
    yearlyPrice,
    monthlyPriceChanged,
    yearlyPriceChanged,
  }) {
    try {
      const stripe = await this._getStripe();
      if (!stripe || !stripeProductId) {
        return { stripePriceIdMonthly, stripePriceIdYearly };
      }

      // 1. Update Product Name
      await stripe.products.update(stripeProductId, { name });

      let newStripePriceIdMonthly = stripePriceIdMonthly;
      let newStripePriceIdYearly = stripePriceIdYearly;

      // 2. If Monthly Price changed, create new Monthly Price on Stripe
      if (monthlyPriceChanged) {
        const monthlyObj = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(monthlyPrice * 100),
          currency: "usd",
          recurring: { interval: "month" },
        });
        newStripePriceIdMonthly = monthlyObj.id;

        if (stripePriceIdMonthly) {
          await stripe.prices.update(stripePriceIdMonthly, { active: false });
        }
      }

      // 3. If Yearly Price changed, create new Yearly Price on Stripe
      if (yearlyPriceChanged) {
        const yearlyObj = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(yearlyPrice * 100),
          currency: "usd",
          recurring: { interval: "year" },
        });
        newStripePriceIdYearly = yearlyObj.id;

        if (stripePriceIdYearly) {
          await stripe.prices.update(stripePriceIdYearly, { active: false });
        }
      }

      return {
        stripePriceIdMonthly: newStripePriceIdMonthly,
        stripePriceIdYearly: newStripePriceIdYearly,
      };
    } catch (error) {
      logger.error(`❌ Stripe Product Update Failed: ${error.message}`);
      return { stripePriceIdMonthly, stripePriceIdYearly };
    }
  }
}

module.exports = new StripeService();
