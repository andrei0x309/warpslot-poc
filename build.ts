import type { BunPlugin } from "bun";
import { isolatedDeclaration } from "oxc-transform";

const fixWinPath = (path: string) => {
	if(path.includes(":") && path.startsWith("/")) {
		return path.slice(1).replaceAll("/", "\\");
	}
    return path;
}

function getDtsBunPlugin(): BunPlugin {
	const wroteTrack = new Set<string>();
	return {
		name: "oxc-transform-dts",
		setup(builder) {
			if (builder.config.root && builder.config.outdir) {
				const rootPath = Bun.pathToFileURL(builder.config.root).pathname;
				const outPath = Bun.pathToFileURL(builder.config.outdir).pathname;
				builder.onStart(() => wroteTrack.clear());
				builder.onLoad({ filter: /\.ts$/ }, async (args) => {
					if (args.path.startsWith(fixWinPath(rootPath)) && !wroteTrack.has(args.path)) {
						wroteTrack.add(args.path);
						const { code } = isolatedDeclaration(
							args.path,
							await Bun.file(args.path).text(),
						);

                        console.log(args.path, fixWinPath(rootPath), args.path.startsWith(fixWinPath(rootPath)) && !wroteTrack.has(args.path), 'args');

                        const filePath = args.path.split(fixWinPath(rootPath))[1];
                        const outFilePath = fixWinPath(outPath) + filePath.replace(/\.ts$/, ".d.ts");

						await Bun.write(outFilePath,
							code,
						);
					}
					return undefined;
				});
			}
		},
	};
}

// await Bun.$`rm -rf dist`;
const result = await Bun.build({
	entrypoints: ["src/index.ts", "src/utils.ts"],
	root: "./src",
    target: "node",
	outdir: "./dist",
	minify: true,
	splitting: true,
	plugins: [getDtsBunPlugin()],
});

if (!result.success) {
	for (const log of result.logs) {
		console.error(log);
	}
}
