import { z } from 'zod';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

describe('Login Form Validation', () => {
  const testCases = [
    {
      name: 'should contain required field errors when fields are empty',
      data: { email: '', password: '' },
      expectedErrors: ["L'email est requis", "Le mot de passe est requis"]
    },
    {
      name: 'should fail with invalid email',
      data: { email: 'invalidemail', password: '123456' },
      expectedErrors: ['Email invalide']
    },
    {
      name: 'should fail with short password',
      data: { email: 'test@test.com', password: '123' },
      expectedErrors: ['Le mot de passe doit contenir au moins 6 caractères']
    },
    {
      name: 'should pass with valid data',
      data: { email: 'test@test.com', password: '123456' },
      expectedErrors: []
    }
  ];

  testCases.forEach(({ name, data, expectedErrors }) => {
    it(name, () => {
      const result = loginSchema.safeParse(data);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        // Vérifie que toutes les erreurs attendues sont présentes
        expectedErrors.forEach(expectedError => {
          expect(errors).toContain(expectedError);
        });
      } else {
        expect(expectedErrors).toHaveLength(0);
      }
    });
  });
});
