async function testRegister() {
    try {
        console.log("Attempting to register on live server...");
        const response = await fetch('https://fitnesspro-backend-i6oo.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Debug User Node",
                email: `debug_node_${Date.now()}@example.com`,
                password: "TestPassword123!"
            })
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Status: ${status}`);
        try {
            console.log("Body:", JSON.parse(text));
        } catch (e) {
            console.log("Body (Raw):", text);
        }
    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

testRegister();
