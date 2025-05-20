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
	// Ensure all files in the public directory are included in the build
	output: 'standalone',
	// Explicitly include public directory assets
	publicRuntimeConfig: {
		staticFolder: '/public',
	},
	// Add rewrites for HTML files in public folder
	async rewrites() {
		return [
			{
				source: '/potree.html',
				destination: '/potree.html',
			},
		];
	},
	webpack: (config, { dev, isServer }) => {
		// Keep console.log statements in production builds
		config.optimization.minimize = true;
		if(!dev) {
			for (const minimizer of config.optimization.minimizer) {
				if(minimizer.constructor.name === 'TerserPlugin') {
					minimizer.options.terserOptions.compress.drop_console = false;
				}
			}
		}
		return config;
	},

};

export default config;
