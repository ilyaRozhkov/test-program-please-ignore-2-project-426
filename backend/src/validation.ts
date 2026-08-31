// @ts-nocheck
/* eslint-disable */
// This document was generated automatically by openapi-box

/**
 * @typedef {import('@sinclair/typebox').TSchema} TSchema
 */

/**
 * @template {TSchema} T
 * @typedef {import('@sinclair/typebox').Static<T>} Static
 */

/**
 * @typedef {{
 *  [Path in keyof schema]: {
 *    [Method in keyof schema[Path]]: {
 *      args: Static<schema[Path][Method]['args']>
 *      data?: Static<schema[Path][Method]['data']>
 *      error?: Static<schema[Path][Method]['error']>
 *    }
 *  }
 * }} Paths
 */

/** @typedef {Json[]} JsonArray */
/** @typedef {{ [key: string | number]: Json }} JsonRecord */
/** @typedef {string} JsonString */
/** @typedef {number} JsonNumber */
/** @typedef {boolean} JsonBoolean */
/** @typedef {null} JsonNull */
/** @typedef {JsonArray | JsonRecord | JsonString | JsonNumber | JsonBoolean | JsonNull} Json */

import { Type as T } from '@sinclair/typebox'

/**
 * @params {object} [options]
 * @returns {ReturnType<typeof T.Unsafe<Json>>}
 */
const Json = (options) => T.Unsafe(T.Any(options))

const cache = {}
cache['5a015f40f0c7296870e1f6036f752bc8'] = {
  email: T.String(),
  password: T.String()
}
cache['f83112b8cc52c1230cc3f64b0548c99e'] = {
  id: T.Integer({ format: 'int32' }),
  email: T.String(),
  createdAt: T.String(),
  updatedAt: T.String()
}
cache['f35e3fedc1b25706eb764bb198f44d4c'] = {
  token: T.String(),
  user: T.Object(cache['f83112b8cc52c1230cc3f64b0548c99e'])
}
cache['77c920eaa967be9313c28efda9bb4006'] = {
  code: T.String(),
  message: T.String(),
  details: T.Any()
}
cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'] = {
  error: T.Object(cache['77c920eaa967be9313c28efda9bb4006'])
}
cache['7f5dec4f6661e8b37f8bf25c2e250109'] = [
  T.Object(cache['f35e3fedc1b25706eb764bb198f44d4c']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['e3d810c00d93ba0dd7d50f2e5b6b6d63'] = {
  message: T.String()
}
cache['d5acffabed63dcfa4e8503e0c10a2926'] = [
  T.Object(cache['e3d810c00d93ba0dd7d50f2e5b6b6d63']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['2e1dea54eb85945bb9683de25e2cbd8d'] = [
  T.Object(cache['f83112b8cc52c1230cc3f64b0548c99e']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['ec4e559d850fd36719ed26252a892667'] = {
  id: T.Integer({ format: 'int32' }),
  name: T.String(),
  slug: T.String()
}
cache['b12ac447960cfe6bac40a3934c140700'] = T.Object(
  cache['ec4e559d850fd36719ed26252a892667']
)
cache['ea5318a8db980e147769a5c177477172'] = [
  T.Array(cache['b12ac447960cfe6bac40a3934c140700']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['1b6695fa52e82b02b3b3a03dbdc4be5f'] = {
  params: Json(),
  category: T.Optional(T.String()),
  minPrice: T.Optional(T.Integer({ format: 'int32' })),
  maxPrice: T.Optional(T.Integer({ format: 'int32' })),
  available: T.Optional(T.Boolean()),
  search: T.Optional(T.String()),
  page: T.Optional(T.Integer({ format: 'int32' })),
  limit: T.Optional(T.Integer({ format: 'int32', default: 10 }))
}
cache['a0896c9a63d6dd4d99d347507f555aa3'] = {
  amount: T.Integer({ format: 'int32' })
}
cache['414f0be174a48ac95556e0b18b5a75b3'] = {
  id: T.Integer({ format: 'int32' }),
  name: T.String(),
  slug: T.String(),
  description: T.Optional(T.String()),
  price: T.Object(cache['a0896c9a63d6dd4d99d347507f555aa3']),
  imageUrl: T.Optional(T.String()),
  available: T.Boolean(),
  category: T.Object(cache['ec4e559d850fd36719ed26252a892667'])
}
cache['f956707ef7c45f29bd32327377b08b14'] = T.Object(
  cache['414f0be174a48ac95556e0b18b5a75b3']
)
cache['ea25898c8aa7612229fef4ea4b0ba635'] = {
  items: T.Array(cache['f956707ef7c45f29bd32327377b08b14']),
  total: T.Integer({ format: 'int32' }),
  page: T.Integer({ format: 'int32' }),
  limit: T.Integer({ format: 'int32' }),
  totalPages: T.Integer({ format: 'int32' })
}
cache['225a045a009455c64b9413cca0eb6fec'] = [
  T.Object(cache['ea25898c8aa7612229fef4ea4b0ba635']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['bf3444cbe311b1e3522595b7dd06c778'] = [
  T.Array(cache['f956707ef7c45f29bd32327377b08b14']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['d224f9e407a681a924f1cea12da50196'] = {
  slug: T.String()
}
cache['257490c30cce98310e8c970047d1259b'] = [
  T.Object(cache['414f0be174a48ac95556e0b18b5a75b3']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['3ba5a9bc2e297effe2f54901f84c7448'] = {
  productId: T.Integer({ format: 'int32' }),
  quantity: T.Integer({ format: 'int32' })
}
cache['c512ce53715c18bd45562dd3ad467801'] = T.Object(
  cache['3ba5a9bc2e297effe2f54901f84c7448']
)
cache['909c8d71e62929bdad31ca8f8e1b8c09'] = [
  T.Literal('delivery'),
  T.Literal('pickup')
]
cache['e284496a64280bf3ee6f561d8949702f'] = {
  items: T.Array(cache['c512ce53715c18bd45562dd3ad467801']),
  deliveryMethod: T.Union(cache['909c8d71e62929bdad31ca8f8e1b8c09']),
  recipientName: T.String(),
  phone: T.String(),
  address: T.Optional(T.String())
}
cache['315e30090eb5426d8d3e7ee1c3ca90b8'] = {
  productId: T.Integer({ format: 'int32' }),
  quantity: T.Integer({ format: 'int32' }),
  name: T.String(),
  price: T.Object(cache['a0896c9a63d6dd4d99d347507f555aa3'])
}
cache['b361475a51e3c678cbaca9963001a492'] = T.Object(
  cache['315e30090eb5426d8d3e7ee1c3ca90b8']
)
cache['7b0e4adcdfeadca2eefaff2c26c577cb'] = {
  id: T.Integer({ format: 'int32' }),
  userId: T.Integer({ format: 'int32' }),
  items: T.Array(cache['b361475a51e3c678cbaca9963001a492']),
  total: T.Integer({ format: 'int32' }),
  status: T.String(),
  deliveryMethod: T.String(),
  recipientName: T.String(),
  phone: T.String(),
  address: T.Optional(T.String()),
  createdAt: T.String()
}
cache['3858312d6f9ae5d3dfeabd6a45c2079c'] = {
  order: T.Object(cache['7b0e4adcdfeadca2eefaff2c26c577cb'])
}
cache['829cde44e0369d3d45cab6e43f9ea08d'] = [
  T.Object(cache['3858312d6f9ae5d3dfeabd6a45c2079c']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['de3cb35bb3fcbb3f06a46b027daa4fd9'] = T.Object(
  cache['7b0e4adcdfeadca2eefaff2c26c577cb']
)
cache['614f22d84cae2f7082f286d5da3a75ca'] = [
  T.Array(cache['de3cb35bb3fcbb3f06a46b027daa4fd9']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['d6ff278167ebd6695c9076e913b61be0'] = {
  id: T.Integer({ format: 'int32' })
}
cache['7666ebc52baa4822bbe9d0bbb4920e33'] = [
  T.Object(cache['7b0e4adcdfeadca2eefaff2c26c577cb']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]
cache['fdb21aa7b49d2449c53ebeced74c4bf3'] = {
  id: T.Integer({ format: 'int32' }),
  title: T.String(),
  text: T.String(),
  product: T.Object(cache['414f0be174a48ac95556e0b18b5a75b3'])
}
cache['82bd10f64edfed99e5d09160c6ba730a'] = T.Object(
  cache['fdb21aa7b49d2449c53ebeced74c4bf3']
)
cache['017ce7e8fa1fb63282ff4245f5e60598'] = [
  T.Array(cache['82bd10f64edfed99e5d09160c6ba730a']),
  T.Object(cache['0f9fab53d63b4f2f184dae2fa0fcb4f4'])
]

const schema = {
  '/api/auth/login': {
    POST: {
      args: T.Object({
        body: T.Object(cache['5a015f40f0c7296870e1f6036f752bc8'], {
          'x-content-type': 'application/json'
        })
      }),
      data: T.Union([
        T.Union(cache['7f5dec4f6661e8b37f8bf25c2e250109'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/auth/logout': {
    POST: {
      args: T.Void(),
      data: T.Union([
        T.Union(cache['d5acffabed63dcfa4e8503e0c10a2926'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/auth/me': {
    GET: {
      args: T.Void(),
      data: T.Union([
        T.Union(cache['2e1dea54eb85945bb9683de25e2cbd8d'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/auth/register': {
    POST: {
      args: T.Object({
        body: T.Object(cache['5a015f40f0c7296870e1f6036f752bc8'], {
          'x-content-type': 'application/json'
        })
      }),
      data: T.Union([
        T.Union(cache['2e1dea54eb85945bb9683de25e2cbd8d'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/catalog/categories': {
    GET: {
      args: T.Void(),
      data: T.Union([
        T.Union(cache['ea5318a8db980e147769a5c177477172'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/catalog/products': {
    GET: {
      args: T.Object({
        query: T.Object(cache['1b6695fa52e82b02b3b3a03dbdc4be5f'])
      }),
      data: T.Union([
        T.Union(cache['225a045a009455c64b9413cca0eb6fec'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/catalog/products/batch': {
    POST: {
      args: T.Object({
        body: Json({
          'x-content-type': 'application/json',
          items: { type: 'integer', format: 'int32' }
        })
      }),
      data: T.Union([
        T.Union(cache['bf3444cbe311b1e3522595b7dd06c778'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/catalog/products/{slug}': {
    GET: {
      args: T.Object({
        params: T.Object(cache['d224f9e407a681a924f1cea12da50196'])
      }),
      data: T.Union([
        T.Union(cache['257490c30cce98310e8c970047d1259b'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/orders': {
    POST: {
      args: T.Object({
        body: T.Object(cache['e284496a64280bf3ee6f561d8949702f'], {
          'x-content-type': 'application/json'
        })
      }),
      data: T.Union([
        T.Union(cache['829cde44e0369d3d45cab6e43f9ea08d'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    },
    GET: {
      args: T.Void(),
      data: T.Union([
        T.Union(cache['614f22d84cae2f7082f286d5da3a75ca'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/orders/{id}': {
    GET: {
      args: T.Object({
        params: T.Object(cache['d6ff278167ebd6695c9076e913b61be0'])
      }),
      data: T.Union([
        T.Union(cache['7666ebc52baa4822bbe9d0bbb4920e33'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  },
  '/api/promo': {
    GET: {
      args: T.Void(),
      data: T.Union([
        T.Union(cache['017ce7e8fa1fb63282ff4245f5e60598'], {
          'x-status-code': '200',
          'x-content-type': 'application/json'
        })
      ]),
      error: T.Union([T.Any()])
    }
  }
}

export { schema }
