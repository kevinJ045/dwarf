import fs from "fs";
import path from "path";

class FIO {
  static readFile(importPath) {
    const filePath = FIO.resolveFilePath(importPath);
    return fs.readFileSync(filePath, "utf8");
  }

  static resolveFilePath(importPath) {
    if (importPath.startsWith("f:")) {
      // File import
      const relativePath = importPath.substring(2);
      return path.resolve(relativePath);
    } else if (importPath.startsWith("pkg:")) {
      // Package import
      const packageName = importPath.substring(4);
      const pkgsPath = FIO.searchForPkgsPath();
      if (!pkgsPath) {
        throw new Error("Package not found. No 'pkgs' directory detected.");
      }
      const packagePath = path.resolve(pkgsPath, packageName);
      return packagePath;
    } else {
      throw new Error(`Invalid import path: ${importPath}`);
    }
  }

  static searchForPkgsPath() {
    let currentPath = path.resolve(".");
    while (currentPath !== path.sep) {
      const pkgsPath = path.join(currentPath, "pkgs");
      if (fs.existsSync(pkgsPath) && fs.lstatSync(pkgsPath).isDirectory()) {
        return pkgsPath;
      }
      currentPath = path.dirname(currentPath);
    }
    return null;
  }
}

export default FIO;
