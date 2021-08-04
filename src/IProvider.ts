export default interface IProvider {
    /**
     * Read data from the specified path.
     * @param path A unix-style path.
     */
    read(path: string): Promise<Buffer>;
    /**
     * Write data to the specified path.
     * @param path A unix-style path.
     * @param content A buffer of content.
     */
    write(path: string, content: Buffer): Promise<void>;
}