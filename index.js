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

    const isDevImageAvailable = fs.existsSync(path.join(component.identifier, 'Dockerfile.dev'));

    const componentOutput = {
      identifier: component.identifier,
      name: component.name || component.identifier,
      folder: component.identifier,
      type: isDevImageAvailable ? 'main' : 'main-dev',
    };

    componentsOutput.push(componentOutput);

    if (isDevImageAvailable) {
      componentsOutput.push({
        ...componentOutput,
        name: `${componentOutput.name} Dev`,
        type: 'dev',
      });
    }
  }

  core.setOutput('components', JSON.stringify(componentsOutput));
} catch (error) {
  core.setFailed(error.message);
}
