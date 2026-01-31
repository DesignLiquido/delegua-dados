import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        verbose: true,
        modulePathIgnorePatterns: ['<rootDir>/dist/'],
        preset: 'ts-jest',
        testEnvironment: 'node',
        coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
        testMatch: ['**/testes/**/*.test.ts'],
        collectCoverageFrom: [
            'fontes/**/*.ts',
            '!fontes/**/*.test.ts',
            '!fontes/**/index.ts'
        ]
    };
};
