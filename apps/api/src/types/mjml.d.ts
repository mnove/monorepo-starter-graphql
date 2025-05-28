declare module "mjml" {
  interface MjmlOptions {
    fonts?: Record<string, string>;
    keepComments?: boolean;
    ignoreIncludes?: boolean;
    validationLevel?: "strict" | "soft" | "skip";
    minify?: boolean;
    minifyOptions?: {
      collapseWhitespace?: boolean;
      removeEmptyAttributes?: boolean;
    };
    beautify?: boolean;
    filePath?: string;
  }

  interface MjmlOutput {
    html: string;
    errors: Array<{
      line: number;
      message: string;
      tagName: string;
      formattedMessage: string;
    }>;
  }

  function mjml2html(mjml: string, options?: MjmlOptions): MjmlOutput;
  export default mjml2html;
}
