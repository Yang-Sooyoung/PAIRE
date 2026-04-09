declare module "dom-to-image-more" {
  interface Options {
    quality?: number
    scale?: number
    bgcolor?: string
    width?: number
    height?: number
    style?: Partial<CSSStyleDeclaration>
    filter?: (node: Node) => boolean
  }
  function toBlob(node: HTMLElement, options?: Options): Promise<Blob>
  function toPng(node: HTMLElement, options?: Options): Promise<string>
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>
  function toSvg(node: HTMLElement, options?: Options): Promise<string>
  const domtoimage: { toBlob: typeof toBlob; toPng: typeof toPng; toJpeg: typeof toJpeg; toSvg: typeof toSvg }
  export default domtoimage
}
