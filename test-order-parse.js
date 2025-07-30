// Test pentru parsing orderID
const orderId = "emblem_cautatorul_lumina_test_1234567890";
const parts = orderId.split("_");

console.log("OrderID:", orderId);
console.log("Parts:", parts);
console.log("Length:", parts.length);
console.log("Expected emblemType:", parts[1] + "_" + parts[2]);
console.log("Expected userId:", parts[3]);
