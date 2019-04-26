import path from 'path'
import { TransportKind, ExtensionContext, LanguageClient, ServerOptions, commands, workspace, services, LanguageClientOptions } from 'coc.nvim'

export async function activate(context: ExtensionContext): Promise<void> {

  const config = workspace.getConfiguration().get('docker', {}) as any
  if (config.enable === false) {
    return
  }

  let serverModule = context.asAbsolutePath(path.join('node_modules', 'dockerfile-language-server-nodejs', 'lib', 'server.js'));

  let serverOptions: ServerOptions = {
    module: serverModule,
    transport: TransportKind.ipc,
    args: ["--node-ipc"]
  };

  let clientOptions: LanguageClientOptions = {
    documentSelector: ['Dockerfile']
  };

  const client = new LanguageClient("docker", "dockerfile-language-server-nodejs", serverOptions, clientOptions);

  context.subscriptions.push(
    services.registLanguageClient(client),
    commands.registerCommand("docker.version", async () => {
      const v = require(path.resolve(__dirname, '..', 'package.json')).version
      workspace.showMessage(`Version: ${v}`, 'more')
    })
  )
}

