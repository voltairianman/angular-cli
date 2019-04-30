import { oneLine, stripIndent } from "common-tags";
import { createTypescriptContext, transformTypescript } from "./ast_helpers";
import { replaceServerBootstrap } from "./replace_server_bootstrap";

describe("@ngtools/webpack transformers", () => {
    describe("replace_server_bootstrap", () => {
        it("should replace bootstrap", () => {
            const input = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { platformDynamicServer } from '@angular/platform-server';

        import { AppModule } from './app/app.module';
        import { environment } from './environments/environment';

        if (environment.production) {
          enableProdMode();
        }

        platformDynamicServer().bootstrapModule(AppModule);
      `;

            // tslint:disable:max-line-length
            const output = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { environment } from './environments/environment';

        import * as __NgCli_bootstrap_1 from "./app/app.module.ngfactory";
        import * as __NgCli_bootstrap_2 from "@angular/platform-server";

        if (environment.production) {
          enableProdMode();
        }
        __NgCli_bootstrap_2.platformServer().bootstrapModuleFactory(__NgCli_bootstrap_1.AppModuleNgFactory);
      `;
            // tslint:enable:max-line-length

            const { program, compilerHost } = createTypescriptContext(input);
            const transformer = replaceServerBootstrap(
                () => true,
                () => ({
                    path: "/project/src/app/app.module",
                    className: "AppModule",
                }),
                () => program.getTypeChecker()
            );
            const result = transformTypescript(
                undefined,
                [transformer],
                program,
                compilerHost
            );

            expect(oneLine`${result}`).toEqual(oneLine`${output}`);
        });

        it("should replace renderModule", () => {
            const input = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { renderModule } from '@angular/platform-server';

        import { AppModule } from './app/app.module';
        import { environment } from './environments/environment';

        if (environment.production) {
          enableProdMode();
        }

        renderModule(AppModule, {
          document: '<app-root></app-root>',
          url: '/'
        });
      `;

            // tslint:disable:max-line-length
            const output = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { environment } from './environments/environment';

        import * as __NgCli_bootstrap_1 from "./app/app.module.ngfactory";
        import * as __NgCli_bootstrap_2 from "@angular/platform-server";

        if (environment.production) {
          enableProdMode();
        }
        __NgCli_bootstrap_2.renderModuleFactory(__NgCli_bootstrap_1.AppModuleNgFactory, {
            document: '<app-root></app-root>',
            url: '/'
          });
      `;
            // tslint:enable:max-line-length

            const { program, compilerHost } = createTypescriptContext(input);
            const transformer = replaceServerBootstrap(
                () => true,
                () => ({
                    path: "/project/src/app/app.module",
                    className: "AppModule",
                }),
                () => program.getTypeChecker()
            );
            const result = transformTypescript(
                undefined,
                [transformer],
                program,
                compilerHost
            );

            expect(oneLine`${result}`).toEqual(oneLine`${output}`);
        });

        it("should replace when the module is used in a config object", () => {
            const input = stripIndent`
        import * as express from 'express';

        import { enableProdMode } from '@angular/core';
        import { ngExpressEngine } from '@nguniversal/express-engine';

        import { AppModule } from './app/app.module';
        import { environment } from './environments/environment';

        if (environment.production) {
          enableProdMode();
        }

        const server = express();
        server.engine('html', ngExpressEngine({
          bootstrap: AppModule
        }));
      `;

            // tslint:disable:max-line-length
            const output = stripIndent`
        import * as express from 'express';

        import { enableProdMode } from '@angular/core';
        import { ngExpressEngine } from '@nguniversal/express-engine';

        import { environment } from './environments/environment';

        import * as __NgCli_bootstrap_1 from "./app/app.module.ngfactory";

        if (environment.production) {
          enableProdMode();
        }

        const server = express();
        server.engine('html', ngExpressEngine({
          bootstrap: __NgCli_bootstrap_1.AppModuleNgFactory
        }));
      `;
            // tslint:enable:max-line-length

            const { program, compilerHost } = createTypescriptContext(input);
            const transformer = replaceServerBootstrap(
                () => true,
                () => ({
                    path: "/project/src/app/app.module",
                    className: "AppModule",
                }),
                () => program.getTypeChecker()
            );
            const result = transformTypescript(
                undefined,
                [transformer],
                program,
                compilerHost
            );

            expect(oneLine`${result}`).toEqual(oneLine`${output}`);
        });

        it("should replace bootstrap when barrel files are used", () => {
            const input = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { platformDynamicServer } from '@angular/platform-browser-dynamic';

        import { AppModule } from './app';
        import { environment } from './environments/environment';

        if (environment.production) {
          enableProdMode();
        }

        platformDynamicServer().bootstrapModule(AppModule);
      `;

            // tslint:disable:max-line-length
            const output = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { environment } from './environments/environment';

        import * as __NgCli_bootstrap_1 from "./app/app.module.ngfactory";
        import * as __NgCli_bootstrap_2 from "@angular/platform-server";

        if (environment.production) {
          enableProdMode();
        }
        __NgCli_bootstrap_2.platformServer().bootstrapModuleFactory(__NgCli_bootstrap_1.AppModuleNgFactory);
      `;
            // tslint:enable:max-line-length

            const { program, compilerHost } = createTypescriptContext(input);
            const transformer = replaceServerBootstrap(
                () => true,
                () => ({
                    path: "/project/src/app/app.module",
                    className: "AppModule",
                }),
                () => program.getTypeChecker()
            );
            const result = transformTypescript(
                undefined,
                [transformer],
                program,
                compilerHost
            );

            expect(oneLine`${result}`).toEqual(oneLine`${output}`);
        });

        it("should not replace bootstrap when there is no entry module", () => {
            const input = stripIndent`
        import { enableProdMode } from '@angular/core';
        import { platformDynamicServer } from '@angular/platform-browser-dynamic';

        import { AppModule } from './app/app.module';
        import { environment } from './environments/environment';

        if (environment.production) {
          enableProdMode();
        }

        platformDynamicServer().bootstrapModule(AppModule);
      `;

            const { program, compilerHost } = createTypescriptContext(input);
            const transformer = replaceServerBootstrap(
                () => true,
                () => undefined,
                () => program.getTypeChecker()
            );
            const result = transformTypescript(
                undefined,
                [transformer],
                program,
                compilerHost
            );

            expect(oneLine`${result}`).toEqual(oneLine`${input}`);
        });
    });
});
