fetch("http://localhost:3000/api/payments/stripe/webhook", { method: "POST" })
  .then(res => {
    console.log("Status:", res.status);
    console.log("Redirected:", res.redirected);
    console.log("URL:", res.url);
  })
  .catch(console.error);
