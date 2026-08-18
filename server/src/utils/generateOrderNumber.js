function generateOrderNumber() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(10000 + Math.random() * 90000));
  return `IMO-${year}-${seq}`;
}

module.exports = generateOrderNumber;
