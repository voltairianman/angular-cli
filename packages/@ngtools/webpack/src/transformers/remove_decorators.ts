import * as ts from "typescript";

import { collectDeepNodes } from "./ast_helpers";
import {
    StandardTransform,
    TransformOperation,
    RemoveNodeOperation,
} from "./interfaces";
import { makeTransform } from "./make_transform";

export function removeDecorators(
    shouldTransform: (fileName: string) => boolean,
    getTypeChecker: () => ts.TypeChecker
): ts.TransformerFactory<ts.SourceFile> {
    const standardTransform: StandardTransform = function(
        sourceFile: ts.SourceFile
    ) {
        const ops: TransformOperation[] = [];

        if (!shouldTransform(sourceFile.fileName)) {
            return ops;
        }

        collectDeepNodes<ts.Decorator>(sourceFile, ts.SyntaxKind.Decorator)
            .filter(decorator => shouldRemove(decorator, getTypeChecker()))
            .forEach(decorator => {
                // Remove the decorator node.
                ops.push(new RemoveNodeOperation(sourceFile, decorator));
            });

        return ops;
    };

    return makeTransform(standardTransform, getTypeChecker);
}

function shouldRemove(
    decorator: ts.Decorator,
    typeChecker: ts.TypeChecker
): boolean {
    const origin = getDecoratorOrigin(decorator, typeChecker);

    return origin && origin.module === "@angular/core";
}

// Decorator helpers.
interface DecoratorOrigin {
    name: string;
    module: string;
}

function getDecoratorOrigin(
    decorator: ts.Decorator,
    typeChecker: ts.TypeChecker
): DecoratorOrigin | null {
    if (!ts.isCallExpression(decorator.expression)) {
        return null;
    }

    let identifier: ts.Node;
    let name: string;
    if (ts.isPropertyAccessExpression(decorator.expression.expression)) {
        identifier = decorator.expression.expression.expression;
        name = decorator.expression.expression.name.text;
    } else if (ts.isIdentifier(decorator.expression.expression)) {
        identifier = decorator.expression.expression;
    } else {
        return null;
    }

    // NOTE: resolver.getReferencedImportDeclaration would work as well but is
    // internal
    const symbol = typeChecker.getSymbolAtLocation(identifier);
    if (symbol && symbol.declarations && symbol.declarations.length > 0) {
        const declaration = symbol.declarations[0];
        let module: string;
        if (ts.isImportSpecifier(declaration)) {
            name = (declaration.propertyName || declaration.name).text;
            module = (declaration.parent.parent.parent
                .moduleSpecifier as ts.StringLiteral).text;
        } else if (ts.isNamespaceImport(declaration)) {
            // Use the name from the decorator namespace property access
            module = (declaration.parent.parent
                .moduleSpecifier as ts.StringLiteral).text;
        } else if (ts.isImportClause(declaration)) {
            name = declaration.name.text;
            module = (declaration.parent.moduleSpecifier as ts.StringLiteral)
                .text;
        } else {
            return null;
        }

        return { name, module };
    }

    return null;
}
