async function inspectNextJs() {
    try {
        const res = await fetch("https://www.airlinecabz.com");
        const html = await res.text();
        
        // Find all script tags
        const scriptRegex = /src=["'](\/_next\/static\/chunks\/[^"']+)["']/g;
        const scripts = [];
        let m;
        while ((m = scriptRegex.exec(html)) !== null) {
            scripts.push(m[1]);
        }
        console.log("Next.js scripts:", scripts);

        for (const scriptUrl of scripts) {
            const scriptRes = await fetch("https://www.airlinecabz.com" + scriptUrl);
            const scriptText = await scriptRes.text();
            
            // Search for routes inside Next.js bundle
            const routeMatches = scriptText.match(/\"\/[a-zA-Z0-9_\-\/]+\"/g) || [];
            const filtered = routeMatches
                .map(r => r.replace(/\"/g, ''))
                .filter(r => r.length > 2 && !r.includes('/_next') && !r.includes('/node_modules') && !r.includes('webpack') && !r.includes('react'));
            const uniqueRoutes = [...new Set(filtered)];
            if (uniqueRoutes.length > 0) {
                console.log("Discovered internal routes in", scriptUrl, ":", uniqueRoutes.slice(0, 20));
            }
        }

        // Also test common real endpoints on airlinecabz.com
        const testPaths = [
            "/book",
            "/booking",
            "/api/book",
            "/api/booking",
            "/api/fare",
            "/api/payment",
            "/api/rides",
            "/services",
            "/about",
            "/contact",
            "/fleet",
            "/tariff",
            "/airports",
            "/privacy",
            "/terms"
        ];
        console.log("\nTesting candidate paths:");
        for (const p of testPaths) {
            try {
                const r = await fetch("https://www.airlinecabz.com" + p, { method: "HEAD" });
                console.log(p, "-> Status:", r.status);
            } catch (e) {
                console.log(p, "-> Error:", e.message);
            }
        }
    } catch (e) {
        console.error(e);
    }
}
inspectNextJs();
