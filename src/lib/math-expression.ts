// Safe parser for the function plot block: expressions in `x` compile to a closure over a fixed
// set of operators, constants and functions. Nothing is ever passed to `eval` or `Function`.

const functions: Record<string, (value: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log2: Math.log2,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
}

const constants: Record<string, number> = { pi: Math.PI, π: Math.PI, e: Math.E }

type Fn = (x: number) => number
type Token = { kind: 'number'; value: number } | { kind: 'name' | 'op'; value: string }

export class ExpressionError extends Error {}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < source.length) {
    const rest = source.slice(i)
    const space = /^\s+/.exec(rest)
    const number = /^(\d+\.?\d*|\.\d+)/.exec(rest)
    const name = /^[a-zπ][a-z0-9]*/i.exec(rest)
    if (space) {
      i += space[0].length
    } else if (number) {
      tokens.push({ kind: 'number', value: Number(number[0]) })
      i += number[0].length
    } else if (name) {
      tokens.push({ kind: 'name', value: name[0].toLowerCase() })
      i += name[0].length
    } else if (rest.startsWith('**')) {
      tokens.push({ kind: 'op', value: '^' })
      i += 2
    } else if ('+-*/^()·×−'.includes(rest[0])) {
      const op = { '·': '*', '×': '*', '−': '-' }[rest[0]] ?? rest[0]
      tokens.push({ kind: 'op', value: op })
      i += 1
    } else {
      throw new ExpressionError(`Unexpected "${rest[0]}".`)
    }
  }
  return tokens
}

// expression := term (("+" | "-") term)*
// term       := unary (("*" | "/") unary | unary)*    a bare unary is implicit multiplication: 2x
// unary      := ("-" | "+") unary | power
// power      := primary ("^" unary)?                  right-associative, so -x^2 is -(x^2)
// primary    := number | constant | "x" | function "(" expression ")" | "(" expression ")"
function parse(tokens: Token[]): Fn {
  let position = 0
  const peek = () => tokens[position]
  const isOp = (value: string) => peek()?.kind === 'op' && peek()?.value === value
  const expect = (value: string) => {
    if (!isOp(value)) throw new ExpressionError(`Expected "${value}".`)
    position++
  }
  const startsPrimary = () => {
    const token = peek()
    return token && (token.kind !== 'op' || token.value === '(')
  }

  function expression(): Fn {
    let left = term()
    while (isOp('+') || isOp('-')) {
      const op = (tokens[position++] as Token).value
      const a = left
      const b = term()
      left = op === '+' ? (x) => a(x) + b(x) : (x) => a(x) - b(x)
    }
    return left
  }

  function term(): Fn {
    let left = unary()
    while (isOp('*') || isOp('/') || startsPrimary()) {
      const op = isOp('/') ? '/' : '*'
      if (isOp('*') || isOp('/')) position++
      const a = left
      const b = unary()
      left = op === '*' ? (x) => a(x) * b(x) : (x) => a(x) / b(x)
    }
    return left
  }

  function unary(): Fn {
    if (isOp('-')) {
      position++
      const a = unary()
      return (x) => -a(x)
    }
    if (isOp('+')) {
      position++
      return unary()
    }
    return power()
  }

  function power(): Fn {
    const base = primary()
    if (!isOp('^')) return base
    position++
    const exponent = unary()
    return (x) => base(x) ** exponent(x)
  }

  function primary(): Fn {
    const token = tokens[position++]
    if (!token) throw new ExpressionError('The expression ends too early.')
    if (token.kind === 'number') return () => token.value
    if (token.kind === 'op') {
      if (token.value !== '(') throw new ExpressionError(`Unexpected "${token.value}".`)
      const inner = expression()
      expect(')')
      return inner
    }
    const name = token.value
    if (name === 'x') return (x) => x
    // Own keys only: `constructor` and the like are not names here
    if (Object.hasOwn(constants, name)) {
      const value = constants[name] as number
      return () => value
    }
    const fn = Object.hasOwn(functions, name) ? functions[name] : undefined
    if (fn) {
      expect('(')
      const argument = expression()
      expect(')')
      return (x) => fn(argument(x))
    }
    throw new ExpressionError(`Unknown name "${name}". Use x, pi, e and functions like sin(x).`)
  }

  const result = expression()
  if (position < tokens.length) {
    const token = tokens[position] as Token
    throw new ExpressionError(`Unexpected "${token.value}".`)
  }
  return result
}

export function compileExpression(source: string): Fn {
  const tokens = tokenize(source)
  if (!tokens.length) throw new ExpressionError('Enter an expression in x.')
  return parse(tokens)
}

export function validateExpression(source: unknown): string | true {
  if (typeof source !== 'string' || !source.trim()) return 'Enter an expression in x.'
  try {
    compileExpression(source)
    return true
  } catch (err) {
    if (err instanceof ExpressionError) return err.message
    throw err
  }
}
