// Test pentru verificarea TEST_USER_ID
const TEST_USER_ID = "test_" + Date.now();
const orderId = `emblem_cautatorul_lumina_${TEST_USER_ID}_${Date.now()}`;
const parts = orderId.split("_");

console.log("TEST_USER_ID:", TEST_USER_ID);
console.log("OrderID:", orderId);
console.log("Parts:", parts);
console.log("Length:", parts.length);
