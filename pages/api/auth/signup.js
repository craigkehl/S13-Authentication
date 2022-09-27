import { hashPassword } from '../../../lib/auth';
import {
  connectDatabase,
  insertDocument,
  findDocument,
} from '../../../lib/db-util.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (
      !email ||
      !email.includes('@') ||
      !password ||
      password.trim() === '' ||
      password.length < 8
    ) {
      res.status(422).json({ message: 'Invalild input.' });
      return;
    }

    let client;
    try {
      client = await connectDatabase();

      const duplicateEmailResult = await findDocument(client, 'users', {
        email: email,
      });
      console.log('duplicate: ');
      console.log(duplicateEmailResult);

      if (duplicateEmailResult) {
        res.status(422).json({ message: 'Email is already used.' });
        throw new Error({
          message: 'Email is already used.',
        });
      }
      const hashedPassword = await hashPassword(password);

      const insertResult = await insertDocument(client, 'users', {
        email,
        hashedPassword,
      });

      if (!insertResult.acknowledged) {
        throw new Error({ message: 'Insert failed' });
      }

      const newUser = {
        email,
        password,
        id: insertResult.insertedId,
      };

      res.status(201).json({ message: 'User created!' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: error.message || 'Something went wrong!' });
    } finally {
      await client.close();
    }
  }
}

export default handler;
