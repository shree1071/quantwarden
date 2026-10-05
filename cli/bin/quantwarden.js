#!/usr/bin/env node

import { runCli } from "../src/index.js";

runCli().catch((err) => {
    console.error("Fatal CLI error:", err);
    process.exit(1);
});
