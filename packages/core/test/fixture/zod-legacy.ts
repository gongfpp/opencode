import { z } from "zod-legacy"

// AFT 0.62.0 installs this override on its bundled Zod 4.1.8 argument schemas.
const override = <T extends z.ZodType>(schema: T): T => {
  schema._zod.toJSONSchema = () => {
    const original = schema._zod.toJSONSchema
    delete schema._zod.toJSONSchema
    try {
      const { $schema: _, ...json } = z.toJSONSchema(schema)
      return json
    } finally {
      schema._zod.toJSONSchema = original
    }
  }
  return schema
}

export const legacyInput = () =>
  z.object({
    path: override(z.string().describe("File path")),
    count: z.string().transform(Number),
  })

export const legacyRecursive = () => {
  type Node = { name: string; children: Node[] }
  const node: z.ZodType<Node> = z.lazy(() => z.object({ name: z.string(), children: z.array(node) }))
  return override(z.object({ tree: node }).describe("Recursive tree"))
}

export const legacyJsonSchema = (schema: z.ZodType, io: "input" | "output") =>
  z.toJSONSchema(schema, { target: "draft-2020-12", io })
