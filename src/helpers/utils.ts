export function normalizedPhoneNumber(phoneNumber: string) {
  console.log("this is phoneNumber", phoneNumber);
  return phoneNumber.trim().replace(/^(?:\+855|00855|885)/, "0");
}
