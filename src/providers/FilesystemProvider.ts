import fs from "fs";
import IProvider from "IProvider";
import path from "path";
import mkdirp from "mkdirp";

export default class FilesystemAdapter implements IProvider {
	basePath: string;

	constructor(basePath: string) {
		this.basePath = basePath;
	}

	async write(wpath: string, data: Buffer): Promise<void> {
		return new Promise((resolve, reject)=>{
			mkdirp(path.join(this.basePath, wpath, "..")).then(()=>{
				if (data.length == 0) {
					fs.promises.rm(path.join(this.basePath, wpath)).then(()=>{
						resolve();
					}).catch(()=>{
						reject();
					});
					return;
				}
				fs.promises.writeFile(path.join(this.basePath, wpath), data).then(()=>{
					resolve();
				}).catch(()=>{
					reject();
				});
			});
		});
	}

	async read(rpath: string): Promise<Buffer> {
		return new Promise((resolve, reject)=>{
			fs.promises.readFile(path.join(this.basePath, rpath)).then((data)=>{
				resolve(data);
			}).catch(()=>{
				reject();
			});
		});
	}
}