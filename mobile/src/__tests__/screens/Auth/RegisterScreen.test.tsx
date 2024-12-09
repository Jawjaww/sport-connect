import { z } from 'zod';

const registerSchema = z.object({
  username: z.string()
    .min(1, 'Le nom d\'utilisateur est requis')
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

describe('Register Form Validation', () => {
  const testCases = [
    {
      name: 'should contain required field errors when fields are empty',
      data: { username: '', email: '', password: '', confirmPassword: '' },
      expectedErrors: [
        "Le nom d'utilisateur est requis",
        "L'email est requis",
        "Le mot de passe est requis",
        "La confirmation du mot de passe est requise"
      ]
    },
    {
      name: 'should fail with short username',
      data: {
        username: 'ab',
        email: 'test@test.com',
        password: '123456',
        confirmPassword: '123456'
      },
      expectedErrors: ["Le nom d'utilisateur doit contenir au moins 3 caractères"]
    },
    {
      name: 'should fail with invalid email',
      data: {
        username: 'test',
        email: 'invalidemail',
        password: '123456',
        confirmPassword: '123456'
      },
      expectedErrors: ['Email invalide']
    },
    {
      name: 'should fail with short password',
      data: {
        username: 'test',
        email: 'test@test.com',
        password: '123',
        confirmPassword: '123'
      },
      expectedErrors: ['Le mot de passe doit contenir au moins 6 caractères']
    },
    {
      name: 'should fail with non-matching passwords',
      data: {
        username: 'test',
        email: 'test@test.com',
        password: '123456',
        confirmPassword: 'different'
      },
      expectedErrors: ['Les mots de passe ne correspondent pas']
    },
    {
      name: 'should pass with valid data',
      data: {
        username: 'test',
        email: 'test@test.com',
        password: '123456',
        confirmPassword: '123456'
      },
      expectedErrors: []
    }
  ];

  testCases.forEach(({ name, data, expectedErrors }) => {
    it(name, () => {
      const result = registerSchema.safeParse(data);
      
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
