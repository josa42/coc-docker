import path from 'path'
import fs from 'fs'
import { TransportKind, ExtensionContext, LanguageClient, ServerOptions, commands, window, workspace, services, LanguageClientOptions } from 'coc.nvim'

interface DockerConfig {
  enable: boolean
}

export async function activate(context: ExtensionContext): Promise<void> {

  const config = workspace.getConfiguration().get('docker', {}) as DockerConfig
  if (config.enable === false) {
    return
  }

  const serverModule = require.resolve('dockerfile-language-server-nodejs/lib/server.js')

  const serverOptions: ServerOptions = {
    module: serverModule,
    transport: TransportKind.ipc,
    args: ["--node-ipc"]
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: ['Dockerfile', 'dockerfile']
  }

  const client = new LanguageClient("docker", "dockerfile-language-server-nodejs", serverOptions, clientOptions)

  context.subscriptions.push(
    services.registLanguageClient(client),
    commands.registerCommand("docker.version", async () => {
      const v = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8')).version
      window.showInformationMessage(`Version: ${v}`)
    })
  )
}
