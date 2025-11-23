import Auction from "../models/Auction.js";

export async function createAuction(req, res) {
  try {
    const { title, description, starting_price, end_date } = req.body;

    if (!title || !starting_price || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // en attendant le middleware JWT → user_id en dur TEMPORAIRE
    const user_id = 1;

    const data = {
      title,
      description: description || "",
      price: parseFloat(starting_price),
      image_url: null,
      user_id,
      end_date,
    };

    const created = await Auction.createAuction(data);

    res.status(201).json({
      message: "Auction created",
      id: created.id,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listAuctions(req, res) {
  try {
    const rows = await Auction.getAll();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}