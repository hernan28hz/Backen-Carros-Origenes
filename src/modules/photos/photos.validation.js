const { z } = require("zod");

const uploadPhotoSchema = z.object({
  body: z.object({
    description: z.string().max(300).optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}).optional().default({}),
});

module.exports = {
  uploadPhotoSchema,
};
