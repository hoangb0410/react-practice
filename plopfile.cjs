module.exports = function (plop) {
  plop.setGenerator('module', {
    description:
      'Scaffold a new feature module (api, react-query, module page)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name (kebab-case, e.g. "posts"):',
        validate: (v) =>
          /^[a-z][a-z0-9-]*$/.test(v) || 'lowercase, kebab-case, no spaces',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/api/{{kebabCase name}}/{{camelCase name}}.endpoint.ts',
        templateFile: 'plop-templates/endpoint.hbs',
      },
      {
        type: 'add',
        path: 'src/api/{{kebabCase name}}/{{camelCase name}}Api.ts',
        templateFile: 'plop-templates/api.hbs',
      },
      {
        type: 'add',
        path: 'src/api/{{kebabCase name}}/index.ts',
        template: "export * from './{{camelCase name}}Api';\n",
      },
      {
        type: 'append',
        path: 'src/api/index.ts',
        template: "export * from './{{kebabCase name}}';",
      },
      {
        type: 'add',
        path: 'src/react-query/{{kebabCase name}}/use{{pascalCase name}}ListQuery.ts',
        templateFile: 'plop-templates/list-query.hbs',
      },
      {
        type: 'add',
        path: 'src/react-query/{{kebabCase name}}/index.ts',
        template: "export * from './use{{pascalCase name}}ListQuery';\n",
      },
      {
        type: 'append',
        path: 'src/react-query/index.ts',
        template: "export * from './{{kebabCase name}}';",
      },
      {
        type: 'add',
        path: 'src/modules/{{kebabCase name}}/pages/{{pascalCase name}}List.tsx',
        templateFile: 'plop-templates/page.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{kebabCase name}}/pages/index.ts',
        template: "export * from './{{pascalCase name}}List';\n",
      },
      {
        type: 'add',
        path: 'src/modules/{{kebabCase name}}/index.ts',
        template: "export * from './pages';\n",
      },
    ],
  });
};
