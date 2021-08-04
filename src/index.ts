
import http from "http";
import IProvider from "IProvider";
import FilesystemAdapter from "providers/FilesystemProvider";
// the provider. change this here if using something else than a filesystem
// for example, an ftp server or a proxy or something.
const currentProvider: IProvider = new FilesystemAdapter(process.cwd()+"/data");
const options = {
	port: 8888
};
const requestListener: http.RequestListener = function (req, res) {
	// catch cases where there is no req.url
	if (!req.url) {
		res.writeHead(400);
		res.end("Need a url");
		return;
	}
	try {
		// handle most url parsing, including ..'s
		const url = new URL(req.url, "http://database.local");

		// handle ..'s just in case, we don't want people going to places they shouldn't
		if (url.pathname.includes("..")) {
			res.writeHead(400);
			res.write(Buffer.from("error: unsupported characters in path"), ()=>{
				res.end();
			});
			return;
		}

		// allow only a-z, A-Z, 0-9, _, -, .
		// done so the server is semi crash proof
		if (url.pathname.match(/[^a-zA-Z0-9/_\-.]/)) {
			res.writeHead(400);
			res.write(Buffer.from("error: unsupported characters in path"), ()=>{
				res.end();
			});
			return;
		}
		
	} catch (e) {
		res.writeHead(400);
		res.write(Buffer.from("error: not a valid url"), ()=>{
			res.end();
		});
		return;
	}
	console.log("req url:" + req.url);
	switch (req.method) {
	case "GET":
		currentProvider.read(req.url).then((value)=>{
			res.write(value, ()=>{
				res.end();
			});
		}).catch(()=>{
			res.writeHead(404);
			res.write(Buffer.from("error: no such file"), ()=>{
				res.end();
			});
		});
		break;
	case "POST": 
		// eslint-disable-next-line no-case-declarations
		const data: Array<Buffer> = [];

		req.on("data", chunk => {
			data.push(Buffer.from(chunk));
		});

		req.on("end", () => {
			if (req.url) {
				currentProvider.write(req.url, Buffer.concat(data)).then(()=>{
					res.write(Buffer.from("success"), ()=>{
						res.end();
					});
				}).catch((e)=>{
					console.error(e);
					res.writeHead(500);
					res.write(Buffer.from("error"), ()=>{
						res.end();
					});
				});
			}
		});

		break;
	case "DELETE":
		currentProvider.write(req.url, Buffer.alloc(0)).then(()=>{
			res.write(Buffer.from("success"), ()=>{
				res.end();
			});
		}).catch((e)=>{
			res.writeHead(500);
			res.write(Buffer.from("error"), ()=>{
				res.end();
			});
		});
		break;
	default:
		res.writeHead(404);
		res.write(Buffer.from("unsupported method"), ()=>{
			res.end();
		});
		break;
	}
};
// you may be asking, why doesn't this have https?
// well, because it doesn't need to. 
// this is assumed to run on your internal network without public access.
// revealing this to the internet is a fool's errand. 
const server = http.createServer(requestListener);
server.listen(options.port);
console.log("Storage server listening on: "+options.port);