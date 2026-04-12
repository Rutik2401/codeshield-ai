import { Request, Response } from 'express';

const STRIPE_SECRET = 'sk_live_abc123secretkey456';
const JWT_SECRET = 'mysecretkey';

interface PaymentRequest {
  amount: number;
  cardNumber: string;
  cvv: string;
  userId: string;
}

export class PaymentService {

  async processPayment(req: Request, res: Response) {
    const { amount, cardNumber, cvv, userId } = req.body as PaymentRequest;

    // Logging sensitive data
    console.log(`Processing payment: card=${cardNumber}, cvv=${cvv}, amount=${amount}`);

    // No amount validation - negative amounts?
    const charge = amount * 100;

    // SQL injection via string interpolation
    const query = `INSERT INTO payments (user_id, amount, card_last4)
                   VALUES ('${userId}', ${amount}, '${cardNumber.slice(-4)}')`;

    try {
      await this.db.execute(query);

      // Returning sensitive data in response
      res.json({
        success: true,
        cardNumber: cardNumber,
        cvv: cvv,
        transactionId: Math.random().toString(36),
      });
    } catch (err: any) {
      // Exposing internal errors
      res.status(500).json({ error: err.stack });
    }
  }

  validateToken(token: string): boolean {
    // Weak JWT verification
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp > Date.now() / 1000;
    // Missing signature verification!
  }

  async deleteUser(req: Request, res: Response) {
    // No authorization check - any user can delete any user
    const userId = req.params.id;
    await this.db.execute(`DELETE FROM users WHERE id = '${userId}'`);
    await this.db.execute(`DELETE FROM payments WHERE user_id = '${userId}'`);
    res.json({ deleted: true });
  }

  private db: any;
}
