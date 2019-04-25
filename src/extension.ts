import path from 'path'
import { TransportKind, ExtensionContext, LanguageClient, ServerOptions, commands, workspace, services, LanguageClientOptions } from 'coc.nvim'

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context
  const config = workspace.getConfiguration().get('docker', {}) as any
  const enable = config.enable
  if (enable === false) return

  let serverModule = context.asAbsolutePath(path.join('node_modules', 'dockerfile-language-server-nodejs', 'lib', 'server.js'));

  let serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
      args: ["--node-ipc"]
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] }
    }
  };

  let clientOptions: LanguageClientOptions = {
    documentSelector: ['Dockerfile'],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc")
    }
  };

  const client = new LanguageClient(
    "dockerfile-langserver",
    "Dockerfile Language Server",
    serverOptions,
    clientOptions
  );

  subscriptions.push(
    services.registLanguageClient(client)
  )

  subscriptions.push(commands.registerCommand("docker.version", async () => {
    const v = require(path.resolve(__dirname, '..', 'package.json')).version
    workspace.showMessage(`Version: ${v}`, 'more')
  }))
}

