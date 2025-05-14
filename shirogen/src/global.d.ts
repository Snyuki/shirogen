// For module.css file to be used
declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
  }
  