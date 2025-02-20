import { describe, it } from "node:test"
import assert from "assert"
import * as ohm from "ohm-js"

const grammars = {
  canadianPostalCode: String.raw`
    code = first_letter digit other_letter " " digit other_letter digit
    other_letter = "A" | "B" | "C" | "E" | "G" | "H" | "J" | "K" | "L" | "M" | "N" | "P" | "R" | "S" | "T" | "V" | "W" | "X" | "Y" | "Z" 
    first_letter = "A" | "B" | "C" | "E" | "G" | "H" | "J" | "K" | "L" | "M" | "N" | "P" | "R" | "S" | "T" | "V" | "X" | "Y" 
  `,

  visa: String.raw`
    visa = "4" digit12or15
    digit12or15 =  d d d d d d d d d d d d (d d d)?
    d = digit
  `,

  masterCard: String.raw`
    card = (s51_55 digit14) | (s2221_2720 digit12)
    s51_55 = "5" ("1" | "2" | "3" | "4" | "5")
    s2221_2720 = "22" ( "2" ("1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9") | ("3" | "4" | "5" | "6" | "7" | "8" | "9") d ) -- twentytwo
                | ("23" | "24" | "25" | "26") d d -- twentythreetosix
                | "27" ("0" d | "1" d | "2" "0") -- twentyseven
    digit14 = d d d d d d d d d d d d d d
    digit12 = d d d d d d d d d d d d
    d = digit
  `,

  notThreeEndingInOO: String.raw`
    letters = ~(letter l l end) letter*
    l = "o" | "O"
  `,

  divisibleBy16: String.raw`
    binary16 = "0"+ -- zero 
    | binary* "0000" -- multiple
    binary = ~("0000" end) bit
    bit = "0" | "1"
  `,

  eightThroughThirtyTwo: String.raw`
    decimal = "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32"
  `,

  notPythonPycharmPyc: String.raw`
    notPPP = ~("python" end) ~("pycharm" end) ~("pyc" end) letter*
  `,

  restrictedFloats: String.raw`
    float = digit+ ("." digit+)? ("E" | "e") ("+" | "-")? digit digit? digit?
  `,

  palindromes2358: String.raw`
    pa12358 = pa18 | pa15 | pa13 | pa12
    pa18 = "a" pa16 "a" | "b" pa16 "b" | "c" pa16 "c" 
    pa15 = "a" pa13 "a" | "b" pa13 "b" | "c" pa13 "c" 
    pa16 = "a" pa14 "a" | "b" pa14 "b" | "c" pa14 "c" 
    pa14 = "a" pa12 "a" | "b" pa12 "b" | "c" pa12 "c" 
    pa13 = "a" pa11 "a" | "b" pa11 "b" | "c" pa11 "c" 
    pa12 = "aa" | "bb" | "cc"
    pa11 = "a" | "b" | "c"
  `,

  // pythonStringLiterals: String.raw`
  //   literal = prefix? (long | short)
  //   prefix = "r" | "u" | "R" | "U" |"f" | "F" | fr" | "Fr" | "rf" | "rF" | "Rf" | RF"
  //   short = "'" shortitem_s* "'" | 
  // `,
}

function matches(name, string) {
  const grammar = `G {${grammars[name]}}`
  return ohm.grammar(grammar).match(string).succeeded()
}

const testFixture = {
  canadianPostalCode: {
    good: ["A7X 2P8", "P8E 4R2", "K1V 9P2", "Y3J 5C0"],
    bad: [
      "A7X   9B2",
      "C7E 9U2",
      "",
      "Dog",
      "K1V\t9P2",
      " A7X 2P8",
      "A7X 2P8 ",
    ],
  },
  visa: {
    good: ["4128976567772613", "4089655522138888", "4098562516243"],
    bad: [
      "43333",
      "42346238746283746823",
      "7687777777263211",
      "foo",
      "π",
      "4128976567772613 ",
    ],
  },
  masterCard: {
    good: [
      "5100000000000000",
      "5294837679998888",
      "5309888182838282",
      "5599999999999999",
      "2221000000000000",
      "2720999999999999",
      "2578930481258783",
      "2230000000000000",
    ],
    bad: [
      "5763777373890002",
      "513988843211541",
      "51398884321108541",
      "",
      "OH",
      "5432333xxxxxxxxx",
    ],
  },
  notThreeEndingInOO: {
    good: ["", "fog", "Tho", "one", "a", "ab", "food"],
    bad: ["fOo", "gOO", "HoO", "zoo", "MOO", "123", "A15"],
  },
  divisibleBy16: {
    good: [
      "0",
      "00",
      "000",
      "00000",
      "00000",
      "000000",
      "00000000",
      "1101000000",
    ],
    bad: ["1", "00000000100", "1000000001", "dog0000000"],
},
  eightThroughThirtyTwo: {
    good: Array(25)
      .fill(0)
      .map((x, i) => i + 8),
    bad: ["1", "0", "00003", "dog", "", "361", "90", "7", "-11"],
  },
  notPythonPycharmPyc: {
    good: [
      "",
      "pythons",
      "pycs",
      "PYC",
      "apycharm",
      "zpyc",
      "dog",
      "pythonpyc",
    ],
    bad: ["python", "pycharm", "pyc"],
  },
  restrictedFloats: {
    good: ["1e0", "235e9", "1.0e1", "1.0e+122", "55e20"],
    bad: ["3.5E9999", "2.355e-9991", "1e2210"],
  },
  palindromes2358: {
    good: [
      "aa",
      "bb",
      "cc",
      "aaa",
      "aba",
      "aca",
      "bab",
      "bbb",
      "ababa",
      "abcba",
      "aaaaaaaa",
      "abaaaaba",
      "cbcbbcbc",
      "caaaaaac",
    ],
    bad: ["", "a", "ab", "abc", "abbbb", "cbcbcbcb"],
  },
  // pythonStringLiterals: {
  //   good: String.raw`''
  //     ""
  //     'hello'
  //     "world"
  //     'a\'b'
  //     "a\"b"
  //     '\n'
  //     "a\tb"
  //     f'\u'
  //     """abc"""
  //     '''a''"''"'''
  //     """abc\xdef"""
  //     '''abc\$def'''
  //     '''abc\''''`
  //     .split("\n")
  //     .map((s) => s.trim()),
  //   bad: String.raw`
  //     'hello"
  //     "world'
  //     'a'b'
  //     "a"b"
  //     'a''
  //     "x""
  //     """"""""
  //     frr"abc"
  //     'a\'
  //     '''abc''''
  //     """`
  //     .split("\n")
  //     .map((s) => s.trim()),
  // },
}

for (let name of Object.keys(testFixture)) {
    describe(`when matching ${name}`, () => {
      for (let s of testFixture[name].good) {
        it(`accepts ${s}`, () => {
          assert.ok(matches(name, s))
        })
      }
      for (let s of testFixture[name].bad) {
        it(`rejects ${s}`, () => {
          assert.ok(!matches(name, s))
        })
      }
    })
  }
