/*
 * Copyright 2022 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import jsonata from 'jsonata';
import { resolveSafeChildPath } from '@backstage/backend-common';
import fs from 'fs-extra';

export function createJsonJSONataTransformAction() {
  return createTemplateAction<{
    path: string;
    expression: string;
    writeOutputPath?: string;
    replacer?: string[];
    space?: string;
  }>({
    id: 'roadiehq:utils:jsonata:json:transform',
    description:
      'Allows performing jsonata opterations and transformations on objects',
    schema: {
      input: {
        type: 'object',
        required: ['path', 'expression'],
        properties: {
          path: {
            title: 'Path',
            description: 'Input path to read json file.',
            type: 'string',
          },
          expression: {
            title: 'Expression',
            description: 'JSONata expression to perform on the input',
            type: 'string',
          },
          writeOutputPath: {
            title: 'Output Path',
            description: 'If set this will write the serialized json here.',
            type: 'string',
          },
          replacer: {
            title: 'Replacer',
            description: 'Replacer array',
            type: 'array',
            items: {
              type: 'string',
            },
          },
          space: {
            title: 'Space',
            description: 'Space character',
            type: 'string',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          result: {
            title: 'Output result from JSONata',
            type: 'object',
          },
        },
      },
    },
    async handler(ctx) {
      const sourceFilepath = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.path,
      );

      const data = JSON.parse(fs.readFileSync(sourceFilepath).toString());
      const expression = jsonata(ctx.input.expression);
      const result = JSON.stringify(
        expression.evaluate(data),
        ctx.input.replacer,
        ctx.input.space || 2,
      );

      if (ctx.input.writeOutputPath) {
        ctx.logger.info(`writing file to ${ctx.input.writeOutputPath}`);
        const writeFilePath = resolveSafeChildPath(
          ctx.workspacePath,
          ctx.input.writeOutputPath,
        );
        fs.outputFileSync(writeFilePath, result);
      }

      ctx.output('result', result);
    },
  });
}
