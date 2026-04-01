import bcrypt from "bcrypt";

// const salt = bcrypt.genSalt(10);
export const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, 10);
};
export const compare = (password, hash) => bcrypt.compare(password, hash);
