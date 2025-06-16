import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  name: string;
  version: string;
  [key: string]: any;
}

@Injectable()
export class AppService {
  getInfo() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8'),
    ) as PackageJson;

    return {
      name: packageJson.name,
      version: packageJson.version,
      timestamp: new Date().toISOString(),
    };
  }
}
