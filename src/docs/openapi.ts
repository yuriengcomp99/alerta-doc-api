/** Definição OpenAPI sem `servers` — preenchida em runtime via `API_PUBLIC_URL`. */
export const openApiDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Alerta Doc API",
    description:
      "API core — autenticação e documentos. Tokens opacos (access 15m, refresh 7d) persistidos em `auth_sessions`.",
    version: "0.1.0",
  },
  tags: [
    { name: "Health", description: "Health check" },
    { name: "Auth", description: "Autenticação" },
    { name: "Documents", description: "Documentos (multipart/form-data)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "opaque",
        description: "Access token retornado em login/register/refresh",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
            required: ["message"],
          },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy", "degraded"] },
          timestamp: { type: "string", format: "date-time" },
          services: {
            type: "object",
            properties: {
              database: { type: "string", enum: ["ok", "error"] },
            },
          },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER", "ADMIN"] },
        },
      },
      TokenPair: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          accessExpiresAt: { type: "string", format: "date-time" },
          refreshExpiresAt: { type: "string", format: "date-time" },
        },
      },
      AuthResult: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
          tokens: { $ref: "#/components/schemas/TokenPair" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "senha1234" },
          name: { type: "string", example: "Nome Completo" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      LogoutRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string" },
        },
      },
      IntrospectRequest: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string", description: "Access token" },
        },
      },
      IntrospectActive: {
        type: "object",
        properties: {
          active: { type: "boolean", example: true },
          sessionId: { type: "string", format: "uuid" },
          user: { $ref: "#/components/schemas/AuthUser" },
          accessExpiresAt: { type: "string", format: "date-time" },
        },
      },
      IntrospectInactive: {
        type: "object",
        properties: {
          active: { type: "boolean", example: false },
        },
      },
      Document: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
          },
          fileUrl: { type: "string", nullable: true, example: "/uploads/arquivo.pdf" },
          expiresAt: {
            type: "string",
            format: "date",
            nullable: true,
            description: "Data de validade/vencimento do documento (somente dia, YYYY-MM-DD).",
            example: "2026-12-31",
          },
          ownerId: { type: "string", format: "uuid" },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data/hora de criação (UTC).",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data/hora da última atualização (UTC).",
          },
        },
      },
      DocumentResponse: {
        type: "object",
        properties: {
          document: { $ref: "#/components/schemas/Document" },
        },
      },
      DocumentListResponse: {
        type: "object",
        properties: {
          documents: {
            type: "array",
            items: { $ref: "#/components/schemas/Document" },
          },
        },
      },
      DocumentUpdateJson: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
          },
          expiresAt: {
            type: "string",
            format: "date",
            nullable: true,
            description: "Nova data de validade (YYYY-MM-DD). Envie null para remover.",
            example: "2026-06-30",
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API e banco operacionais",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastro de usuário",
        description: "Cria usuário e retorna tokens (auto-login).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResult" },
              },
            },
          },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "E-mail já cadastrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResult" },
              },
            },
          },
          "401": { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar tokens",
        description: "Revoga o refresh atual e emite novo par (rotação).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Novos tokens",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResult" },
              },
            },
          },
          "401": { description: "Refresh inválido ou expirado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Revoga a sessão. Envie `refreshToken` no body ou Bearer access token.",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutRequest" },
            },
          },
        },
        security: [{ bearerAuth: [] }],
        responses: {
          "204": { description: "Sessão revogada" },
          "400": { description: "Requisição inválida", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Usuário autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Perfil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/AuthUser" },
                  },
                },
              },
            },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/introspect": {
      post: {
        tags: ["Auth"],
        summary: "Validar access token",
        description:
          "Microserviços enviam `{ token }` com o access token do usuário. Resposta `active: true/false`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/IntrospectRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Resultado da validação",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/IntrospectActive" },
                    { $ref: "#/components/schemas/IntrospectInactive" },
                  ],
                },
              },
            },
          },
          "400": { description: "token ausente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/documents": {
      get: {
        tags: ["Documents"],
        summary: "Listar meus documentos",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de documentos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DocumentListResponse" },
              },
            },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Documents"],
        summary: "Criar documento",
        description:
          "Envia multipart/form-data. Campo opcional `expiresAt` (YYYY-MM-DD) define a data de validade.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "file"],
                properties: {
                  title: {
                    type: "string",
                    description: "Título do documento",
                    example: "Contrato 2026",
                  },
                  description: {
                    type: "string",
                    description: "Descrição opcional",
                  },
                  expiresAt: {
                    type: "string",
                    description:
                      "Data de validade do documento (YYYY-MM-DD). Opcional.",
                    example: "2026-12-31",
                  },
                  file: {
                    type: "string",
                    format: "binary",
                    description: "PDF, imagem, DOC ou DOCX (máx. 10MB)",
                  },
                },
              },
              encoding: {
                title: { contentType: "text/plain" },
                description: { contentType: "text/plain" },
                expiresAt: { contentType: "text/plain" },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Documento criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DocumentResponse" },
              },
            },
          },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/documents/{id}": {
      get: {
        tags: ["Documents"],
        summary: "Buscar documento por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Documento",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DocumentResponse" },
              },
            },
          },
          "404": { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Documents"],
        summary: "Atualizar documento",
        description:
          "JSON ou multipart/form-data (arquivo opcional). Permite alterar `expiresAt` (YYYY-MM-DD); em JSON use `null` para limpar a data.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
                  },
                  expiresAt: {
                    type: "string",
                    description:
                      "Data de validade (YYYY-MM-DD). Deixe vazio para não alterar.",
                    example: "2026-12-31",
                  },
                  file: { type: "string", format: "binary" },
                },
              },
              encoding: {
                title: { contentType: "text/plain" },
                description: { contentType: "text/plain" },
                status: { contentType: "text/plain" },
                expiresAt: { contentType: "text/plain" },
              },
            },
            "application/json": {
              schema: { $ref: "#/components/schemas/DocumentUpdateJson" },
            },
          },
        },
        responses: {
          "200": {
            description: "Documento atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DocumentResponse" },
              },
            },
          },
          "404": { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Documents"],
        summary: "Excluir documento",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "204": { description: "Removido" },
          "404": { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
} as const;
