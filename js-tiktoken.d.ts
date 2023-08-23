declare module "js-tiktoken/ranks/cl100k_base" {
  declare const cl100k_base: {
    pat_str: string
    special_tokens: Record<string, number>
    bpe_ranks: string
  }
  export default cl100k_base
}
