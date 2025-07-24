import date_created from "../utils/createdAT.js";
import fs from "fs";
import { encrypt } from "../utils/encryption.js";
const vaultfile = "./data/vault.json";

export async function save_credentials(req, res) {
  const user = req.user;
  const credentials = req.body;
  console.log(credentials); // for dev only — remove in production
  if (!user) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const createdAT = date_created();
  const updatedAT = date_created();

  if (
    !credentials?.username ||
    !credentials?.password ||
    !credentials?.note ||
    !credentials?.service
  ) {
    // if any of the required fields are missing
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const vault = JSON.parse(fs.readFileSync(vaultfile, "utf-8"));

    const id = Date.now().toString(); // unique ID using timestamp
    credentials.username = await encrypt(
      credentials.username
    );
    credentials.password = await encrypt(credentials.password);
    credentials.note = await encrypt(credentials.note);
    credentials.service = await encrypt(credentials.service);

    const entry = { id, createdAT, updatedAT, ...credentials };
    vault.push(entry);
    fs.writeFileSync(vaultfile, JSON.stringify(vault, null, 2));

    // render the index page with the updated vault
    res.status(201).json({ message: "Credentials saved", data: entry });
  } catch (error) {
    res.status(500).json({ message: "Server error this", error });
  }
}

export async function update_credentials(req, res) {
  const { id } = req.params;
  const updates = req.body;

  try {
    let vault = JSON.parse(fs.readFileSync(vaultfile, "utf-8"));
    const index = vault.findIndex((item) => item.id === id);
    if (index === -1)
      return res.status(404).json({ message: "Entry not found" });

    if (updates.username)
      updates.username = await encrypt(updates.username);
    if (updates.password) updates.password = await encrypt(updates.password);
    if (updates.note) updates.note = await encrypt(updates.note);
    if (updates.service) updates.service = await encrypt(updates.service);
    vault[index].updatedAT = date_created();

    vault[index] = { ...vault[index], ...updates };
    fs.writeFileSync(vaultfile, JSON.stringify(vault, null, 2));

    res.status(200).json({ message: "Entry updated", data: vault[index] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function delete_credentials(req, res) {
  const { id } = req.params;

  try {
    let vault = JSON.parse(fs.readFileSync(vaultfile, "utf-8"));
    const filteredVault = vault.filter((entry) => entry.id !== id);

    if (vault.length === filteredVault.length) {
      return res.status(404).json({ message: "Entry not found" });
    }

    fs.writeFileSync(vaultfile, JSON.stringify(filteredVault, null, 2));
    res.status(200).json({ message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
