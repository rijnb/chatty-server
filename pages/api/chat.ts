import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from '@/utils/app/const';
import {OpenAIError, OpenAIStream} from '@/utils/server';

import {ChatBody, Message} from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import { auth } from './auth';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import {Tiktoken, init} from '@dqbd/tiktoken/lite/init';
import {OpenAIModelID, OpenAIModels} from '@/types/openai';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const authResult = auth(req);
    if (authResult.error) {
      return new Response('Unauthorized', {
        status: authResult.status,
        statusText: authResult.statusText,
      });
    }
    const { model, messages, key, prompt, temperature } =
        (await req.json()) as ChatBody;

    const {tokenLimit} = OpenAIModels[model.id as OpenAIModelID];

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = OPENAI_DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = OPENAI_DEFAULT_TEMPERATURE;
    }

    let tokenCount = encoding.encode(promptToSend).length;
    tokenCount += 3; // reply starts with <|start|>assistant<|end|>
    tokenCount += 5; // We're off by 5. Unsure why.
    let totalTokenCount = tokenCount;

    let messagesToSend: Message[] = [];
    const maxReplyTokens = OPENAI_API_MAX_TOKENS;

    // I think we're calculating this correctly, but if we're off, it's by a
    // _lot_ less than 100.
    const safetyMargin = 100;

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const msgTokenCount = 4 +
        encoding.encode(message.content).length +
        encoding.encode(message.role).length;

      if (tokenCount + msgTokenCount + maxReplyTokens + safetyMargin <= tokenLimit) {
        tokenCount += msgTokenCount;
        messagesToSend = [message, ...messagesToSend];
      }
      totalTokenCount += msgTokenCount;
    }
    encoding.free();
    console.info(`Using first ${tokenCount} tokens from a conversation of ${totalTokenCount} tokens in total (server limit: ${tokenLimit})`);

    const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } });
  } catch (error) {
    if (error instanceof OpenAIError) {
      console.error(`Error in OpenAI stream, error:${error}, message:${error.message}`);
      return new Response('Error', {status: 500, statusText: error.message});
    } else {
      console.error(`Other stream error, error:${error}`);
      return new Response('Error', {status: 500});
    }
  }
};

export default handler;