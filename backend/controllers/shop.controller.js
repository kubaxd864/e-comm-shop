import { promisePool } from "../config/db.js";
import { buildCategoryTree } from "../functions/shop.functions.js";
import { fetchStores } from "../functions/product.functions.js";
import { transporter } from "../config/mail.js";
import dotenv from "dotenv";
dotenv.config();

export const getStores = async (req, res) => {
  const stores = await fetchStores();
  const [categories] = await promisePool.query(
    "SELECT id, name, parent_id, is_active FROM categories",
  );
  const tree = buildCategoryTree(categories);
  res.json({ stores, categories: tree });
};

export const contact = async (req, res) => {
  try {
    const { name, email, shopId, subject, message } = req.body;
    await transporter.sendMail({
      from: `"Formularz kontaktowy" <jakubsobczyk2004@wp.pl>`,
      to: process.env.CONTACT_MAIL,
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      text: `Imię: ${name} E-mail: ${email}\n\n${message}`,
    });
    res.status(200).json({ message: "Wysłano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Błąd Wysyłania",
    });
  }
};
