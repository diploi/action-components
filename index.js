const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const core = require('@actions/core');

try {
  const config = yaml.load(fs.readFileSync('diploi.yaml', 'utf-8'));
  const componentsOutput = [];

  for (const component of config.components) {
    if (!fs.existsSync(component.identifier)) {
      throw new Error(
        `Folder /${component.identifier} for the ${component.identifier} component is missing.`
      );
    }

    const componentOutput = {
      identifier: component.identifier,
      name: component.name || component.identifier,
      folder: component.identifier,
      ref: component.package.split('#').pop(),
    };

    componentsOutput.push(componentOutput);

    if (fs.existsSync(path.join(component.identifier, 'Dockerfile.dev'))) {
      componentsOutput.push({
        ...componentOutput,
        stage: 'dev',
      });
    }
  }

  core.setOutput('components', JSON.stringify(componentsOutput));
} catch (error) {
  core.setFailed(error.message);
}
