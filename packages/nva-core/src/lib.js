import HappyPack from 'happypack'
import os from 'os'

export function happypackPlugin(id, loaders,tempDir) {
    const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
    return new HappyPack({
        id,
        tempDir,
        verbose: false,
        threadPool: compilerThreadPool,
        loaders
    })
}