const pad = (n) => n.toString().padStart(2, "0");
export default function date_created() {
  const date = new Date();
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const time = date.toTimeString().split(" ")[0];
  return `${year}-${month}-${day} ${time}`;
}
