const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const core = require('@actions/core');

try {
  const config = yaml.load(fs.readFileSync('diploi.yaml', 'utf-8'));
  const componentsOutput = [];

  for (const component of config.components) {
    let folder = component.folder || component.identifier;
    if (folder.startsWith('/')) {
      folder = folder.substring(1);
    }

    if (!fs.existsSync(folder)) {
      throw new Error(
        `Folder ${folder} for the ${component.identifier} component is missing.`
      );
    }

    const isDevImageAvailable = fs.existsSync(
      path.join(folder, 'Dockerfile.dev')
    );

    const componentOutput = {
      identifier: component.identifier,
      name: component.name || component.identifier,
      folder,
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
