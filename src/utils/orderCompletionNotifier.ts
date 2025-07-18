/**
 * Utilitar pentru trimiterea notificărilor de finalizare comandă
 * Se apelează când o plată Netopia este confirmată
 */

export const sendOrderCompletionNotification = async (
  orderId: string,
  orderData?: any,
  paymentInfo?: any
) => {
  try {
    console.log("🎉 Trimit notificarea de finalizare pentru comanda:", orderId);

    const response = await fetch(
      "/.netlify/functions/process-payment-completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          paymentInfo: paymentInfo || {
            paymentId: "confirmed_via_checkout",
            status: "confirmed",
          },
          orderData: orderData,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Notificare finalizare trimisă cu succes:", result);
      return { success: true, result };
    } else {
      const errorText = await response.text();
      console.warn(
        "⚠️ Nu am putut trimite notificarea de finalizare:",
        errorText
      );
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error("❌ Eroare la trimiterea notificării de finalizare:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Verifică dacă o comandă cu plată Netopia necesită notificare de finalizare
 * și o trimite automat
 */
export const checkAndNotifyOrderCompletion = (
  orderId: string,
  paymentStatus: string,
  orderData?: any
) => {
  if (paymentStatus === "confirmed" || paymentStatus === "success") {
    // Folosim setTimeout pentru a nu bloca UI-ul
    setTimeout(() => {
      sendOrderCompletionNotification(orderId, orderData, {
        paymentId: orderId,
        status: "confirmed",
      });
    }, 1000);
  }
};
