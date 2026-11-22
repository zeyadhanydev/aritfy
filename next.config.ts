import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "r08rhshmgy.ufs.sh",
			},
			{
				protocol: "https",
				hostname: "newapi.kuaitu.cc",
			},
			// unsplash images
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},

			// file upload using uploadthing
			{
				protocol: "https",
				hostname: "utfs.io",
			},
		],
	},
	typedRoutes: true,
	experimental: {
		cpus: 1,
		webpackMemoryOptimizations: true,
	},
};

export default nextConfig;
