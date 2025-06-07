module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/src/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/api/(.*)$': '<rootDir>/src/api/$1',
        '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@/entities/(.*)$': '<rootDir>/src/entities/$1',
        '^@/exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
        '^@/facade/(.*)$': '<rootDir>/src/facade/$1',
        '^@/factories/(.*)$': '<rootDir>/src/factories/$1',
        '^@/helpers/(.*)$': '<rootDir>/src/helpers/$1',
        '^@/patterns/(.*)$': '<rootDir>/src/patterns/$1',
        '^@/patterns/adapter/(.*)$': '<rootDir>/src/patterns/adapter/$1',
        '^@/patterns/observer/(.*)$': '<rootDir>/src/patterns/observer/$1',
        '^@/routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/state/(.*)$': '<rootDir>/src/state/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/view/(.*)$': '<rootDir>/src/view/$1',
        '^@/tests/(.*)$': '<rootDir>/src/tests/$1'
    },
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/?(*.)+(spec|test).ts"
    ]
};
