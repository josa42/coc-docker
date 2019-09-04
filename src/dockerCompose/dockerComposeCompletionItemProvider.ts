/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

import { CompletionItemProvider, workspace } from 'coc.nvim'
import { CompletionContext, TextDocument, CompletionItem, CompletionItemKind, Position, CompletionList } from "vscode-languageserver-protocol"
import { CancellationToken } from "vscode-jsonrpc"
import composeVersions from './dockerComposeKeyInfo'
import { KeyInfo } from './types'
import { SuggestSupportHelper } from '../utils/suggestSupportHelper'

export class DockerComposeCompletionItemProvider implements CompletionItemProvider {
  async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context?: CompletionContext): Promise<CompletionItem[] | CompletionList> {

    let yamlSuggestSupport = new SuggestSupportHelper()

    workspace.getLine(document.uri, position.line)

    // Determine the schema version of the current compose file,
    // based on the existence of a top-level "version" property.
    let versionMatch = document.getText().match(/^version:\s*(["'])(\d+(\.\d)?)\1/im)
    let version = versionMatch ? versionMatch[2] : "1"

    // Get the line where intellisense was invoked on (e.g. 'image: u').
    let line = await workspace.getLine(document.uri, position.line)

    if (line.length === 0) {
      // empty line
      return Promise.resolve(this.suggestKeys('', version))
    }

    const word = getWord(line, position.character)
    let textBefore = line.substring(0, position.character)
    if (/^\s*[\w_]*$/.test(textBefore)) {
      // on the first token
      return Promise.resolve(this.suggestKeys(word, version))
    }

    // Matches strings like: 'image: "ubuntu'
    let imageTextWithQuoteMatchYaml = textBefore.match(/^\s*image\s*\:\s*"([^"]*)$/)

    if (imageTextWithQuoteMatchYaml) {
      let imageText = imageTextWithQuoteMatchYaml[1]
      return yamlSuggestSupport.suggestImages(imageText)
    }

    // Matches strings like: 'image: ubuntu'
    let imageTextWithoutQuoteMatch = textBefore.match(/^\s*image\s*\:\s*([\w\:\/]*)/)

    if (imageTextWithoutQuoteMatch) {
      let imageText = imageTextWithoutQuoteMatch[1]
      return yamlSuggestSupport.suggestImages(imageText)
    }

    return Promise.resolve([])
  }

  private suggestKeys(word: string, version: string): CompletionItem[] {
    // Attempt to grab the keys for the requested schema version,
    // otherwise, fall back to showing a composition of all possible keys.
    const keys = <KeyInfo>composeVersions[`v${version}`] || composeVersions.All

    return Object.keys(keys).map(ruleName => {
      let completionItem = CompletionItem.create(ruleName)
      completionItem.kind = CompletionItemKind.Keyword
      completionItem.insertText = ruleName + ': '
      completionItem.documentation = keys[ruleName]
      return completionItem
    })
  }
}

function getWord(line: string, character: number): string {
  const before = line.substring(0, character)
  const after = line.substring(character)
  const word = before.match(/([^\s/:.]*)$/)[1] + after.match(/^([^\s/:.]*)/)[1]

  return word
}

