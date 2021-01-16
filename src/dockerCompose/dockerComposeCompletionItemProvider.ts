/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

import { CompletionItemProvider,CompletionList, CompletionItem, CompletionItemKind, ProviderResult, TextDocument, workspace, Position, CancellationToken, CompletionContext } from 'coc.nvim'
import composeVersions from './dockerComposeKeyInfo'
import { KeyInfo } from './types'
import { SuggestSupportHelper } from '../utils/suggestSupportHelper'

export class DockerComposeCompletionItemProvider implements CompletionItemProvider {
    async provideCompletionItems(textDocument: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): Promise<CompletionItem[]> {

    const hub = new SuggestSupportHelper()

    // Determine the schema version of the current compose file,
    // based on the existence of a top-level "version" property.
    const versionMatch = textDocument.getText().match(/^version:\s*(["'])(\d+(\.\d)?)\1/im)
    const version = versionMatch ? versionMatch[2] : "1"

    const document = workspace.getDocument(textDocument.uri)

    // Get the line where intellisense was invoked on (e.g. 'image: u').
    const line = await workspace.getLine(textDocument.uri, position.line)
    if (line.length === 0) {
      // empty line
      return Promise.resolve(this.suggestKeys('', version))
    }

    const range = document.getWordRangeAtPosition(position)

    // Get the text where intellisense was invoked on (e.g. 'u').
    const word = range && textDocument.getText(range)

    const textBefore = line.substring(0, position.character)
    if (/^\s*[\w_]*$/.test(textBefore)) {
      // on the first token
      return Promise.resolve(this.suggestKeys(word, version))
    }

    // Matches strings like: 'image: "ubuntu'
    const imageTextWithQuoteMatchYaml = textBefore.match(/^\s*image\s*:\s*"([^"]*)$/)
    if (imageTextWithQuoteMatchYaml) {
      const imageText = imageTextWithQuoteMatchYaml[1]
      return hub.suggestImages(imageText)
    }

    // Matches strings like: 'image: ubuntu'
    const imageTextWithoutQuoteMatch = textBefore.match(/^\s*image\s*:\s*([\w:/]*)/)
    if (imageTextWithoutQuoteMatch) {
      const imageText = imageTextWithoutQuoteMatch[1]
      return hub.suggestImages(imageText)
    }

    return Promise.resolve([])
  }

  private suggestKeys(word: string, version: string): CompletionItem[] {
    // Attempt to grab the keys for the requested schema version,
    // otherwise, fall back to showing a composition of all possible keys.
    const keys = composeVersions[`v${version}`] as KeyInfo || composeVersions.All

    return Object.keys(keys).map(ruleName => {
      const completionItem: CompletionItem = { label: ruleName }
      completionItem.kind = CompletionItemKind.Keyword
      completionItem.insertText = ruleName + ': '
      completionItem.documentation = keys[ruleName]
      return completionItem
    })
  }
}

