/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    	// build speedup by shittier error messages
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},

	// // rewrite
	// rewrites: async () => [
	// 	{
	// 		source: '/potree/:path*',
	// 		destination: '/potree/:path*',
	// 	},
	// ],
	
};

export default config;
