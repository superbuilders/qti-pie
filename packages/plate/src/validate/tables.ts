/**
 * What securing reads of QTI 3.0.1's ASI XSD: per element and named type, its attribute
 * declarations (a prohibited one left out), the children its content model names and how each one's
 * declaration is found, its element wildcard, and, per element, whether it is declared globally and
 * its declared types; per named type, its base or its union members. Securing
 * (`#plate/validate/verdict.ts`) keeps an attribute of a QTI element only where the declaration
 * that governs the element declares it (`#plate/validate/governing.ts`), so an attribute only a
 * wildcard admits is removed and marked.
 *
 * It holds nothing that judges a document: the database is the only judge of validity (pantry's
 * laws), and this is a projection of the tables plate's deleted validator was generated with, at
 * edullm 8e801b599, read the same way securing read those.
 *
 * TODO(census A2): replaced by the projection pantry generates from its derived inventory
 * (`pantry/src/vocab/inventory`), one derivation of the XSDs for both packages.
 *
 * @module
 */

import type { Tables } from "#plate/validate/governing.ts";

const t0 = { local: "aria-activedescendant", namespace: "" } as const;

const t1 = { local: "aria-atomic", namespace: "" } as const;

const t2 = { local: "aria-autocomplete", namespace: "" } as const;

const t3 = { local: "aria-busy", namespace: "" } as const;

const t4 = { local: "aria-checked", namespace: "" } as const;

const t5 = { local: "aria-colcount", namespace: "" } as const;

const t6 = { local: "aria-colindex", namespace: "" } as const;

const t7 = { local: "aria-colspan", namespace: "" } as const;

const t8 = { local: "aria-controls", namespace: "" } as const;

const t9 = { local: "aria-current", namespace: "" } as const;

const t10 = { local: "aria-describedby", namespace: "" } as const;

const t11 = { local: "aria-details", namespace: "" } as const;

const t12 = { local: "aria-disabled", namespace: "" } as const;

const t13 = { local: "aria-errormessage", namespace: "" } as const;

const t14 = { local: "aria-expanded", namespace: "" } as const;

const t15 = { local: "aria-flowto", namespace: "" } as const;

const t16 = { local: "aria-haspopup", namespace: "" } as const;

const t17 = { local: "aria-hidden", namespace: "" } as const;

const t18 = { local: "aria-invalid", namespace: "" } as const;

const t19 = { local: "aria-keyshortcuts", namespace: "" } as const;

const t20 = { local: "aria-label", namespace: "" } as const;

const t21 = { local: "aria-labelledby", namespace: "" } as const;

const t22 = { local: "aria-level", namespace: "" } as const;

const t23 = { local: "aria-live", namespace: "" } as const;

const t24 = { local: "aria-modal", namespace: "" } as const;

const t25 = { local: "aria-multiline", namespace: "" } as const;

const t26 = { local: "aria-multiselectable", namespace: "" } as const;

const t27 = { local: "aria-orientation", namespace: "" } as const;

const t28 = { local: "aria-owns", namespace: "" } as const;

const t29 = { local: "aria-placeholder", namespace: "" } as const;

const t30 = { local: "aria-posinset", namespace: "" } as const;

const t31 = { local: "aria-pressed", namespace: "" } as const;

const t32 = { local: "aria-readonly", namespace: "" } as const;

const t33 = { local: "aria-relevant", namespace: "" } as const;

const t34 = { local: "aria-required", namespace: "" } as const;

const t35 = { local: "aria-roledescription", namespace: "" } as const;

const t36 = { local: "aria-rowcount", namespace: "" } as const;

const t37 = { local: "aria-rowindex", namespace: "" } as const;

const t38 = { local: "aria-rowspan", namespace: "" } as const;

const t39 = { local: "aria-selected", namespace: "" } as const;

const t40 = { local: "aria-setsize", namespace: "" } as const;

const t41 = { local: "aria-sort", namespace: "" } as const;

const t42 = { local: "aria-valuemax", namespace: "" } as const;

const t43 = { local: "aria-valuemin", namespace: "" } as const;

const t44 = { local: "aria-valuenow", namespace: "" } as const;

const t45 = { local: "aria-valuetext", namespace: "" } as const;

const t46 = { local: "class", namespace: "" } as const;

const t47 = { local: "data-catalog-idref", namespace: "" } as const;

const t48 = { local: "data-qti-suppress-tts", namespace: "" } as const;

const t49 = { local: "data-ssml", namespace: "" } as const;

const t50 = { local: "dir", namespace: "" } as const;

const t51 = { local: "href", namespace: "" } as const;

const t52 = { local: "id", namespace: "" } as const;

const t53 = { local: "label", namespace: "" } as const;

const t54 = { local: "lang", namespace: "" } as const;

const t55 = { local: "role", namespace: "" } as const;

const t56 = { local: "type", namespace: "" } as const;

const t57 = { local: "base", namespace: "http://www.w3.org/XML/1998/namespace" } as const;

const t58 = { local: "lang", namespace: "http://www.w3.org/XML/1998/namespace" } as const;

const t59 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t49,
  t50,
  t51,
  t52,
  t53,
  t54,
  t55,
  t56,
  t57,
  t58,
] as const;

const t60 = { kind: "global" } as const;

const t61 = {
  local: "CustomInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t62 = { kind: "named", type: t61 } as const;

const t63 = {
  local: "EndAttemptInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t64 = { kind: "named", type: t63 } as const;

const t65 = {
  local: "FeedbackInlineDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t66 = { kind: "named", type: t65 } as const;

const t67 = {
  local: "GapDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t68 = { kind: "named", type: t67 } as const;

const t69 = {
  local: "HotTextDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t70 = { kind: "named", type: t69 } as const;

const t71 = {
  local: "InlineChoiceInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t72 = { kind: "named", type: t71 } as const;

const t73 = {
  local: "PrintedVariableDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t74 = { kind: "named", type: t73 } as const;

const t75 = {
  local: "TemplateInlineDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t76 = { kind: "named", type: t75 } as const;

const t77 = {
  local: "TextEntryInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t78 = { kind: "named", type: t77 } as const;

const t79 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-interaction": t62,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-end-attempt-interaction": t64,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap": t68,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t70,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inline-choice-interaction": t72,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-text-entry-interaction": t78,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t80 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t49,
  t50,
  t52,
  t53,
  t54,
  t55,
  t57,
  t58,
] as const;

const t81 = {
  local: "HTMLTextDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t82 = [t81] as const;

const t83 = { attributes: t80, children: t79, global: true, types: t82 } as const;

const t84 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t55,
  t58,
] as const;

const t85 = {
  local: "AssociateInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t86 = { kind: "named", type: t85 } as const;

const t87 = {
  local: "ChoiceInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t88 = { kind: "named", type: t87 } as const;

const t89 = {
  local: "DrawingInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t90 = { kind: "named", type: t89 } as const;

const t91 = {
  local: "ExtendedTextInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t92 = { kind: "named", type: t91 } as const;

const t93 = {
  local: "FeedbackBlockDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t94 = { kind: "named", type: t93 } as const;

const t95 = {
  local: "GapMatchInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t96 = { kind: "named", type: t95 } as const;

const t97 = {
  local: "GraphicAssociateInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t98 = { kind: "named", type: t97 } as const;

const t99 = {
  local: "GraphicGapMatchInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t100 = { kind: "named", type: t99 } as const;

const t101 = {
  local: "GraphicOrderInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t102 = { kind: "named", type: t101 } as const;

const t103 = {
  local: "HotspotInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t104 = { kind: "named", type: t103 } as const;

const t105 = {
  local: "HotTextInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t106 = { kind: "named", type: t105 } as const;

const t107 = {
  local: "MatchInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t108 = { kind: "named", type: t107 } as const;

const t109 = {
  local: "MediaInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t110 = { kind: "named", type: t109 } as const;

const t111 = {
  local: "OrderInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t112 = { kind: "named", type: t111 } as const;

const t113 = {
  local: "PortableCustomInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t114 = { kind: "named", type: t113 } as const;

const t115 = {
  local: "SelectPointInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t116 = { kind: "named", type: t115 } as const;

const t117 = {
  local: "SliderInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t118 = { kind: "named", type: t117 } as const;

const t119 = {
  local: "TemplateBlockDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t120 = { kind: "named", type: t119 } as const;

const t121 = {
  local: "UploadInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t122 = { kind: "named", type: t121 } as const;

const t123 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associate-interaction": t86,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-choice-interaction": t88,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-interaction": t62,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-drawing-interaction": t90,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-end-attempt-interaction": t64,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-extended-text-interaction": t92,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-match-interaction": t96,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-associate-interaction": t98,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-gap-match-interaction": t100,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-order-interaction": t102,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hotspot-interaction": t104,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t70,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext-interaction": t106,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inline-choice-interaction": t72,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-interaction": t108,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-media-interaction": t110,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-order-interaction": t112,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-portable-custom-interaction": t114,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-select-point-interaction": t116,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-slider-interaction": t118,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-text-entry-interaction": t78,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-upload-interaction": t122,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t124 = {
  local: "BaseHTML5FlowDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t125 = [t124] as const;

const t126 = { attributes: t84, children: t123, global: true, types: t125 } as const;

const t127 = { local: "autoplay", namespace: "" } as const;

const t128 = { local: "controls", namespace: "" } as const;

const t129 = { local: "crossorigin", namespace: "" } as const;

const t130 = { local: "loop", namespace: "" } as const;

const t131 = { local: "mediagroup", namespace: "" } as const;

const t132 = { local: "muted", namespace: "" } as const;

const t133 = { local: "preload", namespace: "" } as const;

const t134 = { local: "src", namespace: "" } as const;

const t135 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t127,
  t46,
  t128,
  t129,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t130,
  t131,
  t132,
  t133,
  t55,
  t134,
  t58,
] as const;

const t136 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}source": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}track": t60,
} as const;

const t137 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
} as const;

const t138 = { local: "title", namespace: "" } as const;

const t139 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t55,
  t138,
  t58,
] as const;

const t140 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
} as const;

const t141 = { local: "cite", namespace: "" } as const;

const t142 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t141,
  t46,
  t47,
  t48,
  t49,
  t50,
  t52,
  t53,
  t54,
  t55,
  t57,
  t58,
] as const;

const t143 = { local: "aria-keyshorts", namespace: "" } as const;

const t144 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t55,
  t57,
  t58,
] as const;

const t145 = {} as const;

const t146 = { local: "span", namespace: "" } as const;

const t147 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t55,
  t146,
  t57,
  t58,
] as const;

const t148 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t55,
  t146,
  t58,
] as const;

const t149 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}col": t60 } as const;

const t150 = { local: "open", namespace: "" } as const;

const t151 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t150,
  t55,
  t58,
] as const;

const t152 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}summary": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
} as const;

const t153 = {
  local: "PositionObjectStageDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t154 = { kind: "named", type: t153 } as const;

const t155 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associate-interaction": t86,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-choice-interaction": t88,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-interaction": t62,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-drawing-interaction": t90,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-end-attempt-interaction": t64,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-extended-text-interaction": t92,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-match-interaction": t96,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-associate-interaction": t98,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-gap-match-interaction": t100,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-order-interaction": t102,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hotspot-interaction": t104,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t70,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext-interaction": t106,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inline-choice-interaction": t72,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-interaction": t108,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-media-interaction": t110,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-order-interaction": t112,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-portable-custom-interaction": t114,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-position-object-stage": t154,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-select-point-interaction": t116,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-slider-interaction": t118,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-text-entry-interaction": t78,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-upload-interaction": t122,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t156 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dt": t60,
} as const;

const t157 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figcaption": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
} as const;

const t158 = { local: "alt", namespace: "" } as const;

const t159 = { local: "height", namespace: "" } as const;

const t160 = { local: "longdesc", namespace: "" } as const;

const t161 = { local: "width", namespace: "" } as const;

const t162 = [
  t158,
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t159,
  t52,
  t53,
  t54,
  t160,
  t55,
  t134,
  t161,
  t57,
  t58,
] as const;

const t163 = { local: "data", namespace: "" } as const;

const t164 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t163,
  t47,
  t48,
  t49,
  t50,
  t159,
  t52,
  t53,
  t54,
  t55,
  t56,
  t161,
  t57,
  t58,
] as const;

const t165 = {
  local: "ParamDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t166 = { kind: "named", type: t165 } as const;

const t167 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}param": t166,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t168 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}li": t60 } as const;

const t169 = {
  local: "OULDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t170 = [t169] as const;

const t171 = { attributes: t80, children: t168, global: true, types: t170 } as const;

const t172 = { local: "name", namespace: "" } as const;

const t173 = { local: "value", namespace: "" } as const;

const t174 = { local: "valuetype", namespace: "" } as const;

const t175 = [t172, t56, t173, t174] as const;

const t176 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}source": t60,
} as const;

const t177 = { local: "identifier", namespace: "" } as const;

const t178 = [t51, t177] as const;

const t179 = {
  local: "AdaptiveHrefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t180 = [t179] as const;

const t181 = { attributes: t178, children: t145, global: false, types: t180 } as const;

const t182 = [] as const;

const t183 = { kind: "named", type: t179 } as const;

const t184 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-adaptive-engine-ref": t183,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-adaptive-settings-ref": t183,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-metadata-ref": t183,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-usagedata-ref": t183,
} as const;

const t185 = {
  local: "AdaptiveSelectionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t186 = {
  local: "Logic1toManyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t187 = { kind: "named", type: t186 } as const;

const t188 = {
  local: "AnyNDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t189 = { kind: "named", type: t188 } as const;

const t190 = {
  local: "BaseValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t191 = { kind: "named", type: t190 } as const;

const t192 = {
  local: "LogicSingleDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t193 = { kind: "named", type: t192 } as const;

const t194 = {
  local: "LogicPairDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t195 = { kind: "named", type: t194 } as const;

const t196 = {
  local: "CorrectDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t197 = { kind: "named", type: t196 } as const;

const t198 = {
  local: "CustomOperatorDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t199 = { kind: "named", type: t198 } as const;

const t200 = {
  local: "DefaultDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t201 = { kind: "named", type: t200 } as const;

const t202 = {
  local: "EqualDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t203 = { kind: "named", type: t202 } as const;

const t204 = {
  local: "EqualRoundedDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t205 = { kind: "named", type: t204 } as const;

const t206 = {
  local: "FieldValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t207 = { kind: "named", type: t206 } as const;

const t208 = {
  local: "IndexDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t209 = { kind: "named", type: t208 } as const;

const t210 = {
  local: "InsideDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t211 = { kind: "named", type: t210 } as const;

const t212 = {
  local: "MapResponseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t213 = { kind: "named", type: t212 } as const;

const t214 = {
  local: "MathConstantDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t215 = { kind: "named", type: t214 } as const;

const t216 = {
  local: "MathOperatorDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t217 = { kind: "named", type: t216 } as const;

const t218 = {
  local: "Logic0toManyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t219 = { kind: "named", type: t218 } as const;

const t220 = {
  local: "EmptyPrimitiveTypeDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t221 = { kind: "named", type: t220 } as const;

const t222 = {
  local: "NumberDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t223 = { kind: "named", type: t222 } as const;

const t224 = {
  local: "OutcomeMinMaxDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t225 = { kind: "named", type: t224 } as const;

const t226 = {
  local: "PatternMatchDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t227 = { kind: "named", type: t226 } as const;

const t228 = {
  local: "RandomFloatDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t229 = { kind: "named", type: t228 } as const;

const t230 = {
  local: "RandomIntegerDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t231 = { kind: "named", type: t230 } as const;

const t232 = {
  local: "RepeatDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t233 = { kind: "named", type: t232 } as const;

const t234 = {
  local: "RoundToDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t235 = { kind: "named", type: t234 } as const;

const t236 = {
  local: "StatsOperatorDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t237 = { kind: "named", type: t236 } as const;

const t238 = {
  local: "StringMatchDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t239 = { kind: "named", type: t238 } as const;

const t240 = {
  local: "SubstringDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t241 = { kind: "named", type: t240 } as const;

const t242 = {
  local: "NumericLogic1toManyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t243 = { kind: "named", type: t242 } as const;

const t244 = {
  local: "TestVariablesDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t245 = { kind: "named", type: t244 } as const;

const t246 = {
  local: "VariableDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t247 = { kind: "named", type: t246 } as const;

const t248 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-and": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-any-n": t189,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-base-value": t191,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-container-size": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-contains": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-correct": t197,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-operator": t199,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default": t201,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-delete": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal": t203,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal-rounded": t205,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-field-value": t207,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gcd": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-index": t209,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inside": t211,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-modulus": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-to-float": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-is-null": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lcm": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response-point": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-constant": t215,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-operator": t217,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-max": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-member": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-min": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-multiple": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-not": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-null": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-correct": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-incorrect": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-presented": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-responded": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-selected": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-or": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-ordered": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-maximum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-minimum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pattern-match": t227,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-power": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-product": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-float": t229,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-integer": t231,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-repeat": t233,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round-to": t235,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stats-operator": t237,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-string-match": t239,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-substring": t241,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-subtract": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-sum": t243,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-variables": t245,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-truncate": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-variable": t247,
} as const;

const t249 = [t186] as const;

const t250 = { attributes: t182, children: t248, global: false, types: t249 } as const;

const t251 = { local: "max", namespace: "" } as const;

const t252 = { local: "min", namespace: "" } as const;

const t253 = [t251, t252] as const;

const t254 = { local: "coords", namespace: "" } as const;

const t255 = { local: "mapped-value", namespace: "" } as const;

const t256 = { local: "shape", namespace: "" } as const;

const t257 = [t254, t255, t256] as const;

const t258 = {
  local: "AreaMapEntryDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t259 = { local: "default-value", namespace: "" } as const;

const t260 = { local: "lower-bound", namespace: "" } as const;

const t261 = { local: "upper-bound", namespace: "" } as const;

const t262 = [t259, t260, t261] as const;

const t263 = { kind: "named", type: t258 } as const;

const t264 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-area-map-entry": t263 } as const;

const t265 = {
  local: "AreaMappingDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t266 = { local: "adaptive", namespace: "" } as const;

const t267 = { local: "time-dependent", namespace: "" } as const;

const t268 = { local: "tool-name", namespace: "" } as const;

const t269 = { local: "tool-version", namespace: "" } as const;

const t270 = [t266, t177, t53, t267, t138, t268, t269, t58] as const;

const t271 = {
  local: "AssessmentStimulusRefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t272 = { kind: "named", type: t271 } as const;

const t273 = {
  local: "CatalogInfoDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t274 = { kind: "named", type: t273 } as const;

const t275 = {
  local: "CompanionMaterialsInfoDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t276 = { kind: "named", type: t275 } as const;

const t277 = {
  local: "ContextDeclarationDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t278 = { kind: "named", type: t277 } as const;

const t279 = {
  local: "ItemBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t280 = { kind: "named", type: t279 } as const;

const t281 = {
  local: "ModalFeedbackDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t282 = { kind: "named", type: t281 } as const;

const t283 = {
  local: "ResponseDeclarationDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t284 = { kind: "named", type: t283 } as const;

const t285 = {
  local: "StyleSheetDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t286 = { kind: "named", type: t285 } as const;

const t287 = {
  local: "TemplateDeclarationDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t288 = { kind: "named", type: t287 } as const;

const t289 = {
  local: "TemplateProcessingDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t290 = { kind: "named", type: t289 } as const;

const t291 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-assessment-stimulus-ref": t272,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-companion-materials-info": t276,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-context-declaration": t278,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-item-body": t280,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-modal-feedback": t282,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-declaration": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-declaration": t284,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-processing": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-declaration": t288,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-processing": t290,
} as const;

const t292 = { local: "category", namespace: "" } as const;

const t293 = { local: "fixed", namespace: "" } as const;

const t294 = { local: "required", namespace: "" } as const;

const t295 = [t292, t46, t293, t51, t177, t294] as const;

const t296 = {
  local: "BranchRuleDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t297 = { kind: "named", type: t296 } as const;

const t298 = {
  local: "ItemSessionControlDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t299 = { kind: "named", type: t298 } as const;

const t300 = {
  local: "TemplateDefaultDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t301 = { kind: "named", type: t300 } as const;

const t302 = {
  local: "TimeLimitsDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t303 = { kind: "named", type: t302 } as const;

const t304 = {
  local: "VariableMappingDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t305 = { kind: "named", type: t304 } as const;

const t306 = {
  local: "WeightDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t307 = { kind: "named", type: t306 } as const;

const t308 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-branch-rule": t297,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-item-session-control": t299,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pre-condition": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-default": t301,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-time-limits": t303,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-variable-mapping": t305,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-weight": t307,
} as const;

const t309 = {
  local: "AssessmentItemRefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t310 = { local: "keep-together", namespace: "" } as const;

const t311 = { local: "visible", namespace: "" } as const;

const t312 = [t46, t293, t177, t310, t294, t138, t311] as const;

const t313 = { kind: "named", type: t185 } as const;

const t314 = { kind: "named", type: t309 } as const;

const t315 = {
  local: "AssessmentSectionRefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t316 = { kind: "named", type: t315 } as const;

const t317 = {
  local: "OrderingDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t318 = { kind: "named", type: t317 } as const;

const t319 = {
  local: "TestRubricBlockDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t320 = { kind: "named", type: t319 } as const;

const t321 = {
  local: "SelectionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t322 = { kind: "named", type: t321 } as const;

const t323 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-adaptive-selection": t313,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-assessment-item-ref": t314,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-assessment-section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-assessment-section-ref": t316,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-branch-rule": t297,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-item-session-control": t299,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-ordering": t318,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pre-condition": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rubric-block": t320,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-selection": t322,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-time-limits": t303,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t324 = [t46, t51, t177] as const;

const t325 = [t177, t53, t138, t268, t269, t58] as const;

const t326 = {
  local: "StimulusBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t327 = { kind: "named", type: t326 } as const;

const t328 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stimulus-body": t327,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
} as const;

const t329 = [t51, t177, t138] as const;

const t330 = [t46, t177, t138, t268, t269] as const;

const t331 = {
  local: "TestFeedbackDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t332 = { kind: "named", type: t331 } as const;

const t333 = {
  local: "TestPartDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t334 = { kind: "named", type: t333 } as const;

const t335 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-context-declaration": t278,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-declaration": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-processing": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rubric-block": t320,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-feedback": t332,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-part": t334,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-time-limits": t303,
} as const;

const t336 = { local: "hotspot-label", namespace: "" } as const;

const t337 = { local: "match-group", namespace: "" } as const;

const t338 = { local: "match-max", namespace: "" } as const;

const t339 = { local: "match-min", namespace: "" } as const;

const t340 = { local: "show-hide", namespace: "" } as const;

const t341 = { local: "template-identifier", namespace: "" } as const;

const t342 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t254,
  t47,
  t48,
  t50,
  t336,
  t52,
  t177,
  t53,
  t54,
  t337,
  t338,
  t339,
  t55,
  t256,
  t340,
  t341,
  t57,
  t58,
] as const;

const t343 = {
  local: "AssociableHotspotDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t344 = { local: "max-associations", namespace: "" } as const;

const t345 = { local: "min-associations", namespace: "" } as const;

const t346 = { local: "response-identifier", namespace: "" } as const;

const t347 = { local: "shuffle", namespace: "" } as const;

const t348 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t344,
  t345,
  t346,
  t55,
  t347,
  t57,
  t58,
] as const;

const t349 = {
  local: "PromptDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t350 = { kind: "named", type: t349 } as const;

const t351 = {
  local: "SimpleAssociableChoiceDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t352 = { kind: "named", type: t351 } as const;

const t353 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-simple-associable-choice": t352,
} as const;

const t354 = { local: "base-type", namespace: "" } as const;

const t355 = [t354] as const;

const t356 = { local: "target", namespace: "" } as const;

const t357 = [t356] as const;

const t358 = {
  local: "ItemFileInfoDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t359 = { kind: "named", type: t358 } as const;

const t360 = { kind: "simple" } as const;

const t361 = { local: "normalizedString", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t362 = { kind: "named", type: t361 } as const;

const t363 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-calculator-info": t359,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-calculator-type": t360,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-description": t362,
} as const;

const t364 = {
  local: "CalculatorDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t365 = { local: "mime-type", namespace: "" } as const;

const t366 = [t53, t365] as const;

const t367 = {
  local: "FileHrefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t368 = { kind: "named", type: t367 } as const;

const t369 = {
  local: "URLDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t370 = { kind: "named", type: t369 } as const;

const t371 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-file-href": t368,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-resource-icon": t370,
} as const;

const t372 = [t358] as const;

const t373 = { attributes: t366, children: t371, global: false, types: t372 } as const;

const t374 = { local: "support", namespace: "" } as const;

const t375 = [t374, t58] as const;

const t376 = {
  local: "CardEntryDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t377 = { kind: "named", type: t376 } as const;

const t378 = {
  local: "FileHrefCardDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t379 = { kind: "named", type: t378 } as const;

const t380 = {
  local: "HTMLContentDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t381 = { kind: "named", type: t380 } as const;

const t382 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-card-entry": t377,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-file-href": t379,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-html-content": t381,
} as const;

const t383 = {
  local: "CardDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t384 = { local: "default", namespace: "" } as const;

const t385 = [t384, t58] as const;

const t386 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-file-href": t379,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-html-content": t381,
} as const;

const t387 = [t52] as const;

const t388 = { kind: "named", type: t383 } as const;

const t389 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-card": t388 } as const;

const t390 = {
  local: "CatalogDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t391 = { kind: "named", type: t390 } as const;

const t392 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog": t391 } as const;

const t393 = { local: "data-max-selections-message", namespace: "" } as const;

const t394 = { local: "data-min-selections-message", namespace: "" } as const;

const t395 = { local: "max-choices", namespace: "" } as const;

const t396 = { local: "min-choices", namespace: "" } as const;

const t397 = { local: "orientation", namespace: "" } as const;

const t398 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t393,
  t394,
  t48,
  t50,
  t52,
  t53,
  t54,
  t395,
  t396,
  t397,
  t346,
  t55,
  t347,
  t57,
  t58,
] as const;

const t399 = {
  local: "SimpleChoiceDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t400 = { kind: "named", type: t399 } as const;

const t401 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-simple-choice": t400,
} as const;

const t402 = { namespace: "##other", process: "strict" } as const;

const t403 = { kind: "named", type: t364 } as const;

const t404 = {
  local: "ProtractorDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t405 = { kind: "named", type: t404 } as const;

const t406 = {
  local: "RuleDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t407 = { kind: "named", type: t406 } as const;

const t408 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-calculator": t403,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-digital-material": t359,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-physical-material": t362,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-protractor": t405,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rule": t407,
} as const;

const t409 = [t192] as const;

const t410 = { attributes: t182, children: t248, global: false, types: t409 } as const;

const t411 = [t194] as const;

const t412 = { attributes: t182, children: t248, global: false, types: t411 } as const;

const t413 = {
  local: "FeedbackContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t414 = {
  local: "FeedbackFlowContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t415 = {
  local: "RubricBlockContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t416 = {
  local: "RubricBlockTemplateBlockContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t417 = {
  local: "TemplateBlockContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t418 = {
  local: "TestFeedbackFlowContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t419 = {
  local: "TestRubricBlockContentBodyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t420 = { local: "cardinality", namespace: "" } as const;

const t421 = [t354, t420, t177] as const;

const t422 = {
  local: "DefaultValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t423 = { kind: "named", type: t422 } as const;

const t424 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default-value": t423 } as const;

const t425 = [t177] as const;

const t426 = {
  local: "ContextUniqueIDRefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t427 = { local: "interpretation", namespace: "" } as const;

const t428 = [t427] as const;

const t429 = {
  local: "ValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t430 = { kind: "named", type: t429 } as const;

const t431 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-value": t430 } as const;

const t432 = {
  local: "CorrectResponseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t433 = { namespace: "##any", process: "lax" } as const;

const t434 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t346,
  t55,
  t57,
  t58,
] as const;

const t435 = { namespace: "##other", process: "lax" } as const;

const t436 = { local: "definition", namespace: "" } as const;

const t437 = [t46, t436] as const;

const t438 = [t361] as const;

const t439 = { attributes: t182, children: t145, global: false, types: t438 } as const;

const t440 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
} as const;

const t441 = { local: "count-attempt", namespace: "" } as const;

const t442 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t441,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t346,
  t55,
  t138,
  t57,
  t58,
] as const;

const t443 = { local: "include-lower-bound", namespace: "" } as const;

const t444 = { local: "include-upper-bound", namespace: "" } as const;

const t445 = { local: "tolerance", namespace: "" } as const;

const t446 = { local: "tolerance-mode", namespace: "" } as const;

const t447 = [t443, t444, t445, t446] as const;

const t448 = { local: "figures", namespace: "" } as const;

const t449 = { local: "rounding-mode", namespace: "" } as const;

const t450 = [t448, t449] as const;

const t451 = [t220] as const;

const t452 = { attributes: t182, children: t145, global: false, types: t451 } as const;

const t453 = { local: "base", namespace: "" } as const;

const t454 = { local: "data-patternmask-message", namespace: "" } as const;

const t455 = { local: "expected-length", namespace: "" } as const;

const t456 = { local: "expected-lines", namespace: "" } as const;

const t457 = { local: "format", namespace: "" } as const;

const t458 = { local: "max-strings", namespace: "" } as const;

const t459 = { local: "min-strings", namespace: "" } as const;

const t460 = { local: "pattern-mask", namespace: "" } as const;

const t461 = { local: "placeholder-text", namespace: "" } as const;

const t462 = { local: "string-identifier", namespace: "" } as const;

const t463 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t453,
  t46,
  t47,
  t454,
  t48,
  t50,
  t455,
  t456,
  t457,
  t52,
  t53,
  t54,
  t458,
  t459,
  t460,
  t461,
  t346,
  t55,
  t462,
  t57,
  t58,
] as const;

const t464 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350 } as const;

const t465 = { local: "outcome-identifier", namespace: "" } as const;

const t466 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t49,
  t50,
  t52,
  t177,
  t53,
  t54,
  t465,
  t55,
  t340,
  t57,
  t58,
] as const;

const t467 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t60,
} as const;

const t468 = {
  local: "TemplateBlockFeedbackBlockDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t469 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t470 = { local: "field-identifier", namespace: "" } as const;

const t471 = [t470] as const;

const t472 = [t365] as const;

const t473 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t177,
  t53,
  t54,
  t337,
  t294,
  t55,
  t340,
  t341,
  t57,
  t58,
] as const;

const t474 = { local: "left", namespace: "" } as const;

const t475 = { local: "object-label", namespace: "" } as const;

const t476 = { local: "top", namespace: "" } as const;

const t477 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t177,
  t53,
  t54,
  t474,
  t337,
  t338,
  t339,
  t475,
  t55,
  t340,
  t341,
  t476,
  t58,
] as const;

const t478 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
} as const;

const t479 = {
  local: "GapImgDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t480 = { local: "data-choices-container-width", namespace: "" } as const;

const t481 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t480,
  t393,
  t394,
  t48,
  t50,
  t52,
  t53,
  t54,
  t344,
  t345,
  t346,
  t55,
  t347,
  t57,
  t58,
] as const;

const t482 = { kind: "named", type: t479 } as const;

const t483 = {
  local: "GapTextDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t484 = { kind: "named", type: t483 } as const;

const t485 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-img": t482,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-text": t484,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t486 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t177,
  t53,
  t54,
  t337,
  t338,
  t339,
  t55,
  t340,
  t341,
  t58,
] as const;

const t487 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t488 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t344,
  t345,
  t346,
  t55,
  t57,
  t58,
] as const;

const t489 = { kind: "named", type: t343 } as const;

const t490 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associable-hotspot": t489,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
} as const;

const t491 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t480,
  t393,
  t394,
  t48,
  t50,
  t52,
  t53,
  t54,
  t344,
  t345,
  t346,
  t55,
  t57,
  t58,
] as const;

const t492 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associable-hotspot": t489,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-img": t482,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-text": t484,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
} as const;

const t493 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t395,
  t396,
  t346,
  t55,
  t57,
  t58,
] as const;

const t494 = {
  local: "HotspotChoiceDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t495 = { kind: "named", type: t494 } as const;

const t496 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hotspot-choice": t495,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
} as const;

const t497 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t254,
  t47,
  t48,
  t50,
  t336,
  t52,
  t177,
  t53,
  t54,
  t55,
  t256,
  t340,
  t341,
  t57,
  t58,
] as const;

const t498 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t393,
  t394,
  t48,
  t50,
  t52,
  t53,
  t54,
  t395,
  t396,
  t346,
  t55,
  t57,
  t58,
] as const;

const t499 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t49,
  t50,
  t52,
  t177,
  t53,
  t54,
  t55,
  t340,
  t341,
  t57,
  t58,
] as const;

const t500 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t501 = [t58] as const;

const t502 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
} as const;

const t503 = {
  local: "RadialSIValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t504 = { kind: "named", type: t503 } as const;

const t505 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-major-increment": t504,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-minor-increment": t504,
} as const;

const t506 = {
  local: "IncrementSIDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t507 = {
  local: "RadialUSValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t508 = { kind: "named", type: t507 } as const;

const t509 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-major-increment": t508,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-minor-increment": t508,
} as const;

const t510 = {
  local: "IncrementUSDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t511 = { local: "n", namespace: "" } as const;

const t512 = [t511] as const;

const t513 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t293,
  t52,
  t177,
  t53,
  t54,
  t55,
  t340,
  t341,
  t58,
] as const;

const t514 = {
  local: "InlineChoiceDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t515 = { local: "data-prompt", namespace: "" } as const;

const t516 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t394,
  t515,
  t48,
  t50,
  t52,
  t53,
  t54,
  t396,
  t294,
  t346,
  t55,
  t347,
  t57,
  t58,
] as const;

const t517 = { kind: "named", type: t514 } as const;

const t518 = {
  local: "LabelDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t519 = { kind: "named", type: t518 } as const;

const t520 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inline-choice": t517,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-label": t519,
} as const;

const t521 = [t254, t256] as const;

const t522 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}template": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t523 = {
  local: "InteractionMarkupDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t524 = { local: "fallback-path", namespace: "" } as const;

const t525 = { local: "primary-path", namespace: "" } as const;

const t526 = [t524, t52, t525] as const;

const t527 = {
  local: "InteractionModuleDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t528 = { local: "primary-configuration", namespace: "" } as const;

const t529 = { local: "secondary-configuration", namespace: "" } as const;

const t530 = [t528, t529] as const;

const t531 = { kind: "named", type: t527 } as const;

const t532 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-interaction-module": t531,
} as const;

const t533 = {
  local: "InteractionModulesDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t534 = [t259] as const;

const t535 = {
  local: "InterpolationTableEntryDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t536 = { kind: "named", type: t535 } as const;

const t537 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-interpolation-table-entry": t536,
} as const;

const t538 = {
  local: "InterpolationTableDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t539 = { local: "include-boundary", namespace: "" } as const;

const t540 = { local: "source-value", namespace: "" } as const;

const t541 = { local: "target-value", namespace: "" } as const;

const t542 = [t539, t540, t541] as const;

const t543 = [t46, t47, t50, t52, t53, t58] as const;

const t544 = {
  local: "RubricBlockDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t545 = { kind: "named", type: t544 } as const;

const t546 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associate-interaction": t86,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-choice-interaction": t88,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-interaction": t62,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-drawing-interaction": t90,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-extended-text-interaction": t92,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-match-interaction": t96,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-associate-interaction": t98,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-gap-match-interaction": t100,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-order-interaction": t102,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hotspot-interaction": t104,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext-interaction": t106,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-interaction": t108,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-media-interaction": t110,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-order-interaction": t112,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-portable-custom-interaction": t114,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-position-object-stage": t154,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rubric-block": t545,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-select-point-interaction": t116,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-slider-interaction": t118,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-upload-interaction": t122,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t547 = { local: "allow-comment", namespace: "" } as const;

const t548 = { local: "allow-review", namespace: "" } as const;

const t549 = { local: "allow-skipping", namespace: "" } as const;

const t550 = { local: "max-attempts", namespace: "" } as const;

const t551 = { local: "show-feedback", namespace: "" } as const;

const t552 = { local: "show-solution", namespace: "" } as const;

const t553 = { local: "validate-responses", namespace: "" } as const;

const t554 = [t547, t548, t549, t550, t551, t552, t553] as const;

const t555 = {
  local: "LookupOutcomeValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t556 = { local: "unit", namespace: "" } as const;

const t557 = [t556] as const;

const t558 = {
  local: "SILinearValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t559 = {
  local: "USLinearValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t560 = [t503, t507, t558, t559] as const;

const t561 = { attributes: t557, children: t145, global: false, types: t560 } as const;

const t562 = { local: "case-sensitive", namespace: "" } as const;

const t563 = { local: "map-key", namespace: "" } as const;

const t564 = [t562, t563, t255] as const;

const t565 = {
  local: "MapEntryDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t566 = [t212] as const;

const t567 = { attributes: t425, children: t145, global: false, types: t566 } as const;

const t568 = { kind: "named", type: t565 } as const;

const t569 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-entry": t568 } as const;

const t570 = {
  local: "MappingDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t571 = { local: "data-first-column-header", namespace: "" } as const;

const t572 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t571,
  t393,
  t394,
  t48,
  t50,
  t52,
  t53,
  t54,
  t344,
  t345,
  t346,
  t55,
  t347,
  t57,
  t58,
] as const;

const t573 = {
  local: "SimpleMatchSetDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t574 = { kind: "named", type: t573 } as const;

const t575 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-simple-match-set": t574,
} as const;

const t576 = {
  local: "MatchTableEntryDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t577 = { kind: "named", type: t576 } as const;

const t578 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-table-entry": t577,
} as const;

const t579 = {
  local: "MatchTableDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t580 = [t540, t541] as const;

const t581 = [t172] as const;

const t582 = { local: "autostart", namespace: "" } as const;

const t583 = { local: "max-plays", namespace: "" } as const;

const t584 = { local: "min-plays", namespace: "" } as const;

const t585 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t582,
  t46,
  t254,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t130,
  t583,
  t584,
  t346,
  t55,
  t57,
  t58,
] as const;

const t586 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
} as const;

const t587 = { local: "integer", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t588 = [t177, t465, t340, t138] as const;

const t589 = { kind: "named", type: t414 } as const;

const t590 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": t589,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
} as const;

const t591 = [t218] as const;

const t592 = { attributes: t182, children: t248, global: false, types: t591 } as const;

const t593 = { local: "exclude-category", namespace: "" } as const;

const t594 = { local: "include-category", namespace: "" } as const;

const t595 = { local: "section-identifier", namespace: "" } as const;

const t596 = [t593, t594, t595] as const;

const t597 = [t222] as const;

const t598 = { attributes: t596, children: t145, global: false, types: t597 } as const;

const t599 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t480,
  t393,
  t394,
  t48,
  t50,
  t52,
  t53,
  t54,
  t395,
  t396,
  t397,
  t346,
  t55,
  t347,
  t57,
  t58,
] as const;

const t600 = [t347] as const;

const t601 = {
  local: "OutcomeElseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t602 = { kind: "named", type: t601 } as const;

const t603 = {
  local: "OutcomeIfDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t604 = { kind: "named", type: t603 } as const;

const t605 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-else": t602,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-else-if": t604,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-if": t604,
} as const;

const t606 = {
  local: "OutcomeConditionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t607 = { local: "external-scored", namespace: "" } as const;

const t608 = { local: "long-interpretation", namespace: "" } as const;

const t609 = { local: "mastery-value", namespace: "" } as const;

const t610 = { local: "normal-maximum", namespace: "" } as const;

const t611 = { local: "normal-minimum", namespace: "" } as const;

const t612 = { local: "variable-identifier-ref", namespace: "" } as const;

const t613 = { local: "view", namespace: "" } as const;

const t614 = [t354, t420, t607, t177, t427, t608, t609, t610, t611, t612, t613] as const;

const t615 = { kind: "named", type: t538 } as const;

const t616 = { kind: "named", type: t579 } as const;

const t617 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default-value": t423,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-interpolation-table": t615,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-table": t616,
} as const;

const t618 = { kind: "named", type: t555 } as const;

const t619 = { kind: "named", type: t606 } as const;

const t620 = {
  local: "OutcomeProcessingFragmentDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t621 = { kind: "named", type: t620 } as const;

const t622 = {
  local: "SetValueDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t623 = { kind: "named", type: t622 } as const;

const t624 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-exit-test": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lookup-outcome-value": t618,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-condition": t619,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-processing-fragment": t621,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-outcome-value": t623,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t625 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-and": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-any-n": t189,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-base-value": t191,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-container-size": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-contains": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-correct": t197,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-operator": t199,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default": t201,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-delete": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal": t203,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal-rounded": t205,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-exit-test": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-field-value": t207,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gcd": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-index": t209,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inside": t211,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-modulus": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-to-float": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-is-null": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lcm": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lookup-outcome-value": t618,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response-point": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-constant": t215,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-operator": t217,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-max": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-member": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-min": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-multiple": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-not": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-null": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-correct": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-incorrect": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-presented": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-responded": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-selected": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-or": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-ordered": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-condition": t619,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-maximum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-minimum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-processing-fragment": t621,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pattern-match": t227,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-power": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-product": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-float": t229,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-integer": t231,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-repeat": t233,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round-to": t235,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-outcome-value": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stats-operator": t237,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-string-match": t239,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-substring": t241,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-subtract": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-sum": t243,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-variables": t245,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-truncate": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-variable": t247,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t626 = [t603] as const;

const t627 = { attributes: t182, children: t625, global: false, types: t626 } as const;

const t628 = { local: "weight-identifier", namespace: "" } as const;

const t629 = [t593, t594, t465, t595, t628] as const;

const t630 = [t224] as const;

const t631 = { attributes: t629, children: t145, global: false, types: t630 } as const;

const t632 = { local: "pattern", namespace: "" } as const;

const t633 = [t632] as const;

const t634 = { local: "custom-interaction-type-identifier", namespace: "" } as const;

const t635 = { local: "module", namespace: "" } as const;

const t636 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t634,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t635,
  t346,
  t55,
  t57,
  t58,
] as const;

const t637 = { kind: "named", type: t426 } as const;

const t638 = { kind: "named", type: t523 } as const;

const t639 = { kind: "named", type: t533 } as const;

const t640 = {
  local: "TemplateUniqueIDRefDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t641 = { kind: "named", type: t640 } as const;

const t642 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-context-variable": t637,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-interaction-markup": t638,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-interaction-modules": t639,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-prompt": t350,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-variable": t641,
} as const;

const t643 = { local: "center-point", namespace: "" } as const;

const t644 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t643,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t395,
  t396,
  t346,
  t55,
  t58,
] as const;

const t645 = {
  local: "PositionObjectInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t646 = { kind: "named", type: t645 } as const;

const t647 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-position-object-interaction": t646,
} as const;

const t648 = { local: "delimiter", namespace: "" } as const;

const t649 = { local: "field", namespace: "" } as const;

const t650 = { local: "index", namespace: "" } as const;

const t651 = { local: "mapping-indicator", namespace: "" } as const;

const t652 = { local: "power-form", namespace: "" } as const;

const t653 = [t453, t46, t648, t649, t457, t52, t177, t650, t53, t651, t652, t57, t58] as const;

const t654 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t655 = { kind: "named", type: t506 } as const;

const t656 = { kind: "named", type: t510 } as const;

const t657 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-description": t362,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-increment-si": t655,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-increment-us": t656,
} as const;

const t658 = { local: "step", namespace: "" } as const;

const t659 = [t251, t252, t658] as const;

const t660 = { local: "number-repeats", namespace: "" } as const;

const t661 = [t660] as const;

const t662 = {
  local: "ResponseElseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t663 = { kind: "named", type: t662 } as const;

const t664 = {
  local: "ResponseIfDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t665 = { kind: "named", type: t664 } as const;

const t666 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-else": t663,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-else-if": t665,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-if": t665,
} as const;

const t667 = {
  local: "ResponseConditionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t668 = { kind: "named", type: t265 } as const;

const t669 = { kind: "named", type: t432 } as const;

const t670 = { kind: "named", type: t570 } as const;

const t671 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-area-mapping": t668,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-correct-response": t669,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default-value": t423,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-mapping": t670,
} as const;

const t672 = { kind: "named", type: t667 } as const;

const t673 = {
  local: "ResponseProcessingFragmentDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t674 = { kind: "named", type: t673 } as const;

const t675 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-exit-response": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lookup-outcome-value": t618,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-condition": t672,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-processing-fragment": t674,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-outcome-value": t623,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t676 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-and": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-any-n": t189,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-base-value": t191,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-container-size": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-contains": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-correct": t197,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-operator": t199,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default": t201,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-delete": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal": t203,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal-rounded": t205,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-exit-response": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-field-value": t207,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gcd": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-index": t209,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inside": t211,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-modulus": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-to-float": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-is-null": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lcm": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lookup-outcome-value": t618,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response-point": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-constant": t215,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-operator": t217,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-max": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-member": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-min": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-multiple": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-not": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-null": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-correct": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-incorrect": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-presented": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-responded": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-selected": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-or": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-ordered": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-maximum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-minimum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pattern-match": t227,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-power": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-product": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-float": t229,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-integer": t231,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-repeat": t233,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-condition": t672,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-response-processing-fragment": t674,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round-to": t235,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-outcome-value": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stats-operator": t237,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-string-match": t239,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-substring": t241,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-subtract": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-sum": t243,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-variables": t245,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-truncate": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-variable": t247,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t677 = [t664] as const;

const t678 = { attributes: t182, children: t676, global: false, types: t677 } as const;

const t679 = { local: "template", namespace: "" } as const;

const t680 = { local: "template-location", namespace: "" } as const;

const t681 = [t679, t680] as const;

const t682 = { local: "use", namespace: "" } as const;

const t683 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t49,
  t50,
  t52,
  t53,
  t54,
  t55,
  t682,
  t613,
  t57,
  t58,
] as const;

const t684 = {
  local: "SIRuleSystemDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t685 = { kind: "named", type: t684 } as const;

const t686 = {
  local: "USRuleSystemDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t687 = { kind: "named", type: t686 } as const;

const t688 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-description": t362,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rule-system-si": t685,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rule-system-us": t687,
} as const;

const t689 = { kind: "named", type: t558 } as const;

const t690 = { kind: "named", type: t587 } as const;

const t691 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-major-increment": t689,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-minimum-length": t690,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-minor-increment": t689,
} as const;

const t692 = { kind: "named", type: t559 } as const;

const t693 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-major-increment": t692,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-minimum-length": t690,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-minor-increment": t692,
} as const;

const t694 = { local: "select", namespace: "" } as const;

const t695 = { local: "with-replacement", namespace: "" } as const;

const t696 = [t694, t695] as const;

const t697 = [t622] as const;

const t698 = { attributes: t425, children: t248, global: false, types: t697 } as const;

const t699 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t293,
  t52,
  t177,
  t53,
  t54,
  t337,
  t338,
  t339,
  t55,
  t340,
  t341,
  t58,
] as const;

const t700 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/10/synthesis}audio": t60,
  "{http://www.w3.org/2001/10/synthesis}break": t60,
  "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
  "{http://www.w3.org/2001/10/synthesis}mark": t60,
  "{http://www.w3.org/2001/10/synthesis}p": t60,
  "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
  "{http://www.w3.org/2001/10/synthesis}prosody": t60,
  "{http://www.w3.org/2001/10/synthesis}s": t60,
  "{http://www.w3.org/2001/10/synthesis}say-as": t60,
  "{http://www.w3.org/2001/10/synthesis}speak": t60,
  "{http://www.w3.org/2001/10/synthesis}sub": t60,
  "{http://www.w3.org/2001/10/synthesis}voice": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t701 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-simple-associable-choice": t352,
} as const;

const t702 = { local: "reverse", namespace: "" } as const;

const t703 = { local: "step-label", namespace: "" } as const;

const t704 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t260,
  t397,
  t346,
  t702,
  t55,
  t658,
  t703,
  t261,
  t57,
  t58,
] as const;

const t705 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
  "{http://www.w3.org/1998/Math/MathML}math": t60,
  "{http://www.w3.org/2001/XInclude}include": t60,
} as const;

const t706 = { local: "substring", namespace: "" } as const;

const t707 = [t562, t706] as const;

const t708 = { local: "media", namespace: "" } as const;

const t709 = [t51, t708, t138, t56] as const;

const t710 = [t562] as const;

const t711 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-base-value": t191,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-container-size": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-correct": t197,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-operator": t199,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default": t201,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-delete": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-field-value": t207,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gcd": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-index": t209,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-modulus": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-to-float": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lcm": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response-point": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-constant": t215,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-operator": t217,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-max": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-min": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-multiple": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-null": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-correct": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-incorrect": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-presented": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-responded": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-selected": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-ordered": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-maximum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-minimum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-power": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-product": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-float": t229,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-integer": t231,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-repeat": t233,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round-to": t235,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stats-operator": t237,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-subtract": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-sum": t243,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-variables": t245,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-truncate": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-variable": t247,
} as const;

const t712 = {
  local: "RubricBlockTemplateBlockDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t713 = {
  local: "TemplateElseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t714 = { kind: "named", type: t713 } as const;

const t715 = {
  local: "TemplateIfDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t716 = { kind: "named", type: t715 } as const;

const t717 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-else": t714,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-else-if": t716,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-if": t716,
} as const;

const t718 = {
  local: "TemplateConditionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t719 = {
  local: "TemplateConstraintDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t720 = { local: "math-variable", namespace: "" } as const;

const t721 = { local: "param-variable", namespace: "" } as const;

const t722 = [t354, t420, t177, t720, t721] as const;

const t723 = [t341] as const;

const t724 = { kind: "named", type: t718 } as const;

const t725 = { kind: "named", type: t719 } as const;

const t726 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-exit-template": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-correct-response": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-default-value": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-template-value": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-condition": t724,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-constraint": t725,
} as const;

const t727 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-and": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-any-n": t189,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-base-value": t191,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-container-size": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-contains": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-correct": t197,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-operator": t199,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-default": t201,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-delete": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-duration-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal": t203,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-equal-rounded": t205,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-exit-template": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-field-value": t207,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gcd": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-index": t209,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-inside": t211,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-divide": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-modulus": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-integer-to-float": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-is-null": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lcm": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lt": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-lte": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-map-response-point": t213,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-constant": t215,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-math-operator": t217,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-max": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-member": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-min": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-multiple": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-not": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-null": t221,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-correct": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-incorrect": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-presented": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-responded": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-number-selected": t223,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-or": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-ordered": t219,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-maximum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-outcome-minimum": t225,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pattern-match": t227,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-power": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-product": t187,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-float": t229,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-random-integer": t231,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-repeat": t233,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-round-to": t235,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-correct-response": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-default-value": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-set-template-value": t623,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stats-operator": t237,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-string-match": t239,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-substring": t241,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-subtract": t195,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-sum": t243,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-condition": t724,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-constraint": t725,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-variables": t245,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-truncate": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-variable": t247,
} as const;

const t728 = [t715] as const;

const t729 = { attributes: t182, children: t727, global: false, types: t728 } as const;

const t730 = {
  local: "RubricBlockTemplateInlineDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t731 = { local: "access", namespace: "" } as const;

const t732 = [t731, t177, t465, t340, t138] as const;

const t733 = { kind: "named", type: t418 } as const;

const t734 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": t733,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
} as const;

const t735 = { local: "navigation-mode", namespace: "" } as const;

const t736 = { local: "submission-mode", namespace: "" } as const;

const t737 = [t46, t177, t735, t736, t138] as const;

const t738 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-assessment-section": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-assessment-section-ref": t316,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-branch-rule": t297,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-item-session-control": t299,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-pre-condition": t193,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-rubric-block": t320,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-test-feedback": t332,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-time-limits": t303,
} as const;

const t739 = { local: "variable-identifier", namespace: "" } as const;

const t740 = [t354, t593, t594, t595, t739, t628] as const;

const t741 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t453,
  t46,
  t47,
  t454,
  t48,
  t50,
  t455,
  t457,
  t52,
  t53,
  t54,
  t460,
  t461,
  t346,
  t55,
  t462,
  t57,
  t58,
] as const;

const t742 = { local: "allow-late-submission", namespace: "" } as const;

const t743 = { local: "max-time", namespace: "" } as const;

const t744 = { local: "min-time", namespace: "" } as const;

const t745 = [t742, t743, t744] as const;

const t746 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t346,
  t55,
  t56,
  t57,
  t58,
] as const;

const t747 = [t354, t470] as const;

const t748 = [t177, t628] as const;

const t749 = { local: "source-identifier", namespace: "" } as const;

const t750 = { local: "target-identifier", namespace: "" } as const;

const t751 = [t749, t750] as const;

const t752 = [t177, t173] as const;

const t753 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
} as const;

const t754 = {
  local: "BaseHTML5PhrasingDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t755 = [t754] as const;

const t756 = { attributes: t84, children: t753, global: true, types: t755 } as const;

const t757 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}rt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
} as const;

const t758 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}rb": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}rp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}rt": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}rtc": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
} as const;

const t759 = { local: "sizes", namespace: "" } as const;

const t760 = { local: "srcset", namespace: "" } as const;

const t761 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t50,
  t52,
  t53,
  t54,
  t708,
  t55,
  t759,
  t134,
  t760,
  t56,
  t58,
] as const;

const t762 = { local: "summary", namespace: "" } as const;

const t763 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t49,
  t50,
  t52,
  t53,
  t54,
  t55,
  t762,
  t57,
  t58,
] as const;

const t764 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}caption": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}col": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}colgroup": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tbody": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tfoot": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}thead": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tr": t60,
} as const;

const t765 = { "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tr": t60 } as const;

const t766 = {
  local: "TablePartDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t767 = [t766] as const;

const t768 = { attributes: t84, children: t765, global: true, types: t767 } as const;

const t769 = { local: "abbr", namespace: "" } as const;

const t770 = { local: "align", namespace: "" } as const;

const t771 = { local: "axis", namespace: "" } as const;

const t772 = { local: "colspan", namespace: "" } as const;

const t773 = { local: "headers", namespace: "" } as const;

const t774 = { local: "rowspan", namespace: "" } as const;

const t775 = { local: "scope", namespace: "" } as const;

const t776 = { local: "valign", namespace: "" } as const;

const t777 = [
  t769,
  t770,
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t771,
  t46,
  t772,
  t47,
  t48,
  t50,
  t773,
  t52,
  t53,
  t54,
  t55,
  t774,
  t775,
  t776,
  t58,
] as const;

const t778 = {
  local: "TDHDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t779 = [t778] as const;

const t780 = { attributes: t777, children: t123, global: true, types: t779 } as const;

const t781 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}td": t60,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}th": t60,
} as const;

const t782 = { local: "kind", namespace: "" } as const;

const t783 = { local: "srclang", namespace: "" } as const;

const t784 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t143,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t46,
  t47,
  t48,
  t384,
  t50,
  t52,
  t782,
  t53,
  t54,
  t55,
  t134,
  t783,
  t58,
] as const;

const t785 = { local: "poster", namespace: "" } as const;

const t786 = [
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  t18,
  t19,
  t20,
  t21,
  t22,
  t23,
  t24,
  t25,
  t26,
  t27,
  t28,
  t29,
  t30,
  t31,
  t32,
  t33,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
  t40,
  t41,
  t42,
  t43,
  t44,
  t45,
  t127,
  t46,
  t128,
  t129,
  t47,
  t48,
  t50,
  t159,
  t52,
  t53,
  t54,
  t130,
  t131,
  t132,
  t785,
  t133,
  t55,
  t134,
  t161,
  t58,
] as const;

const t787 = {
  local: "BaseSequenceXBaseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t788 = { local: "anyType", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t789 = { local: "string", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t790 = { attributes: t182, base: t789, children: t145, derivation: "restriction" } as const;

const t791 = {
  local: "BaseSequenceXBaseEmptyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t792 = {
  local: "BasePromptInteractionDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t793 = {
  local: "BaseSequenceDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t794 = { attributes: t144, base: t791, children: t145, derivation: "extension" } as const;

const t795 = { attributes: t84, base: t793, children: t123, derivation: "extension" } as const;

const t796 = {
  local: "ARIABaseDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t797 = {
  local: "ARIABaseEmptyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t798 = { attributes: t425, base: t220, children: t145, derivation: "extension" } as const;

const t799 = { attributes: t182, base: t361, children: t145, derivation: "restriction" } as const;

const t800 = { attributes: t428, base: t788, children: t431, derivation: "restriction" } as const;

const t801 = {
  local: "BaseSequenceFullDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t802 = { attributes: t80, base: t787, children: t79, derivation: "extension" } as const;

const t803 = { attributes: t450, base: t788, children: t248, derivation: "restriction" } as const;

const t804 = { local: "anyURI", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t805 = { local: "NCName", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t806 = { attributes: t182, base: t805, children: t145, derivation: "restriction" } as const;

const t807 = { attributes: t182, base: t788, children: t248, derivation: "restriction" } as const;

const t808 = { attributes: t425, base: t788, children: t248, derivation: "restriction" } as const;

const t809 = { attributes: t581, base: t788, children: t248, derivation: "restriction" } as const;

const t810 = { local: "double", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t811 = { attributes: t182, base: t788, children: t624, derivation: "restriction" } as const;

const t812 = { local: "decimal", namespace: "http://www.w3.org/2001/XMLSchema" } as const;

const t813 = { attributes: t557, base: t812, children: t145, derivation: "extension" } as const;

const t814 = { attributes: t182, base: t788, children: t675, derivation: "restriction" } as const;

const t815 = {
  local: "BaseSequenceEmptyDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t816 = { kind: "named", type: t417 } as const;

const t817 = {
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": t816,
  "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
} as const;

const t818 = {
  local: "TemplateBlockContentDType",
  namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
} as const;

const t819 = { attributes: t182, base: t788, children: t726, derivation: "restriction" } as const;

const t820 = { attributes: t182, base: t788, children: t654, derivation: "restriction" } as const;

export const tables: Tables = {
  elements: {
    a: {
      attributes: t59,
      children: t79,
      global: true,
      types: [{ local: "ADType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    abbr: t83,
    acronym: t83,
    address: t83,
    article: t126,
    aside: t126,
    audio: {
      attributes: t135,
      children: t136,
      global: true,
      types: [{ local: "AudioDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    b: t83,
    bdi: {
      attributes: t84,
      children: t137,
      global: true,
      types: [{ local: "BDIDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    bdo: {
      attributes: t139,
      children: t140,
      global: true,
      types: [{ local: "BDODType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    big: t83,
    blockquote: {
      attributes: t142,
      children: t137,
      global: true,
      types: [
        { local: "BlockQuoteDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" },
      ],
    },
    br: {
      attributes: t144,
      children: t145,
      global: true,
      types: [{ local: "BRDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    caption: {
      attributes: t84,
      children: t123,
      global: true,
      types: [{ local: "CaptionDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    cite: t83,
    code: t83,
    col: {
      attributes: t147,
      children: t145,
      global: true,
      types: [{ local: "ColDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    colgroup: {
      attributes: t148,
      children: t149,
      global: true,
      types: [{ local: "ColGroupDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    dd: {
      attributes: t80,
      children: t123,
      global: true,
      types: [{ local: "DDDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    details: {
      attributes: t151,
      children: t152,
      global: true,
      types: [{ local: "DetailsDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    dfn: t83,
    div: {
      attributes: t80,
      children: t155,
      global: true,
      types: [{ local: "DivDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    dl: {
      attributes: t80,
      children: t156,
      global: true,
      types: [{ local: "DLDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    dt: {
      attributes: t80,
      children: t79,
      global: true,
      types: [{ local: "DTDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    em: t83,
    figcaption: t126,
    figure: {
      attributes: t84,
      children: t157,
      global: true,
      types: [{ local: "FigureDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    footer: t126,
    h1: t83,
    h2: t83,
    h3: t83,
    h4: t83,
    h5: t83,
    h6: t83,
    header: t126,
    hr: {
      attributes: t144,
      children: t145,
      global: true,
      types: [{ local: "HRDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    i: t83,
    img: {
      attributes: t162,
      children: t145,
      global: true,
      types: [{ local: "ImgDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    kbd: t83,
    label: t126,
    li: {
      attributes: t84,
      children: t123,
      global: true,
      types: [{ local: "LIDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    nav: t126,
    object: {
      attributes: t164,
      children: t167,
      global: true,
      types: [{ local: "ObjectDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    ol: t171,
    p: t83,
    param: { attributes: t175, children: t145, global: false, types: [t165] },
    picture: {
      attributes: t84,
      children: t176,
      global: true,
      types: [{ local: "PictureDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    pre: t83,
    q: {
      attributes: t142,
      children: t79,
      global: true,
      types: [{ local: "QDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    "qti-adaptive-engine-ref": t181,
    "qti-adaptive-selection": { attributes: t182, children: t184, global: false, types: [t185] },
    "qti-adaptive-settings-ref": t181,
    "qti-and": t250,
    "qti-any-n": { attributes: t253, children: t248, global: false, types: [t188] },
    "qti-area-map-entry": { attributes: t257, children: t145, global: false, types: [t258] },
    "qti-area-mapping": { attributes: t262, children: t264, global: false, types: [t265] },
    "qti-assessment-item": {
      attributes: t270,
      children: t291,
      global: true,
      types: [
        { local: "AssessmentItemDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" },
      ],
    },
    "qti-assessment-item-ref": { attributes: t295, children: t308, global: false, types: [t309] },
    "qti-assessment-section": {
      attributes: t312,
      children: t323,
      global: true,
      types: [
        {
          local: "AssessmentSectionDType",
          namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
        },
      ],
    },
    "qti-assessment-section-ref": {
      attributes: t324,
      children: t145,
      global: false,
      types: [t315],
    },
    "qti-assessment-stimulus": {
      attributes: t325,
      children: t328,
      global: true,
      types: [
        {
          local: "AssessmentStimulusDType",
          namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
        },
      ],
    },
    "qti-assessment-stimulus-ref": {
      attributes: t329,
      children: t145,
      global: false,
      types: [t271],
    },
    "qti-assessment-test": {
      attributes: t330,
      children: t335,
      global: true,
      types: [
        { local: "AssessmentTestDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" },
      ],
    },
    "qti-associable-hotspot": { attributes: t342, children: t145, global: false, types: [t343] },
    "qti-associate-interaction": { attributes: t348, children: t353, global: false, types: [t85] },
    "qti-base-value": { attributes: t355, children: t145, global: false, types: [t190] },
    "qti-branch-rule": { attributes: t357, children: t248, global: false, types: [t296] },
    "qti-calculator": { attributes: t182, children: t363, global: false, types: [t364] },
    "qti-calculator-info": t373,
    "qti-calculator-type": { attributes: t182, children: t145, global: false, types: t182 },
    "qti-card": { attributes: t375, children: t382, global: false, types: [t383] },
    "qti-card-entry": { attributes: t385, children: t386, global: false, types: [t376] },
    "qti-catalog": { attributes: t387, children: t389, global: false, types: [t390] },
    "qti-catalog-info": { attributes: t182, children: t392, global: false, types: [t273] },
    "qti-choice-interaction": { attributes: t398, children: t401, global: false, types: [t87] },
    "qti-companion-materials-info": {
      anyElement: t402,
      attributes: t182,
      children: t408,
      global: false,
      types: [t275],
    },
    "qti-container-size": t410,
    "qti-contains": t412,
    "qti-content-body": {
      attributes: t182,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associate-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-choice-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-drawing-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-extended-text-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-match-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-associate-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-gap-match-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-order-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hotspot-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-media-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-order-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-portable-custom-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-position-object-stage": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-select-point-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-slider-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-upload-interaction": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      global: false,
      types: [t413, t414, t415, t416, t417, t418, t419],
    },
    "qti-context-declaration": { attributes: t421, children: t424, global: false, types: [t277] },
    "qti-context-variable": { attributes: t425, children: t145, global: false, types: [t426] },
    "qti-correct": { attributes: t425, children: t145, global: false, types: [t196] },
    "qti-correct-response": { attributes: t428, children: t431, global: false, types: [t432] },
    "qti-custom-interaction": {
      anyElement: t433,
      attributes: t434,
      children: t145,
      global: false,
      types: [t61],
    },
    "qti-custom-operator": {
      anyElement: t435,
      attributes: t437,
      children: t248,
      global: false,
      types: [t198],
    },
    "qti-default": { attributes: t425, children: t145, global: false, types: [t200] },
    "qti-default-value": { attributes: t428, children: t431, global: false, types: [t422] },
    "qti-delete": t412,
    "qti-description": t439,
    "qti-digital-material": t373,
    "qti-divide": t412,
    "qti-drawing-interaction": { attributes: t434, children: t440, global: false, types: [t89] },
    "qti-duration-gte": t412,
    "qti-duration-lt": t412,
    "qti-end-attempt-interaction": {
      attributes: t442,
      children: t145,
      global: false,
      types: [t63],
    },
    "qti-equal": { attributes: t447, children: t248, global: false, types: [t202] },
    "qti-equal-rounded": { attributes: t450, children: t248, global: false, types: [t204] },
    "qti-exit-response": t452,
    "qti-exit-template": t452,
    "qti-exit-test": t452,
    "qti-extended-text-interaction": {
      attributes: t463,
      children: t464,
      global: false,
      types: [t91],
    },
    "qti-feedback-block": { attributes: t466, children: t467, global: false, types: [t93, t468] },
    "qti-feedback-inline": { attributes: t466, children: t469, global: false, types: [t65] },
    "qti-field-value": { attributes: t471, children: t248, global: false, types: [t206] },
    "qti-file-href": { attributes: t472, children: t145, global: false, types: [t378, t367] },
    "qti-gap": { attributes: t473, children: t145, global: false, types: [t67] },
    "qti-gap-img": { attributes: t477, children: t478, global: false, types: [t479] },
    "qti-gap-match-interaction": { attributes: t481, children: t485, global: false, types: [t95] },
    "qti-gap-text": { attributes: t486, children: t487, global: false, types: [t483] },
    "qti-gcd": t250,
    "qti-graphic-associate-interaction": {
      attributes: t488,
      children: t490,
      global: false,
      types: [t97],
    },
    "qti-graphic-gap-match-interaction": {
      attributes: t491,
      children: t492,
      global: false,
      types: [t99],
    },
    "qti-graphic-order-interaction": {
      attributes: t493,
      children: t496,
      global: false,
      types: [t101],
    },
    "qti-gt": t412,
    "qti-gte": t412,
    "qti-hotspot-choice": { attributes: t497, children: t145, global: false, types: [t494] },
    "qti-hotspot-interaction": { attributes: t498, children: t496, global: false, types: [t103] },
    "qti-hottext": { attributes: t499, children: t487, global: false, types: [t69] },
    "qti-hottext-interaction": { attributes: t498, children: t500, global: false, types: [t105] },
    "qti-html-content": { attributes: t501, children: t502, global: false, types: [t380] },
    "qti-increment-si": { attributes: t182, children: t505, global: false, types: [t506] },
    "qti-increment-us": { attributes: t182, children: t509, global: false, types: [t510] },
    "qti-index": { attributes: t512, children: t248, global: false, types: [t208] },
    "qti-inline-choice": { attributes: t513, children: t487, global: false, types: [t514] },
    "qti-inline-choice-interaction": {
      attributes: t516,
      children: t520,
      global: false,
      types: [t71],
    },
    "qti-inside": { attributes: t521, children: t248, global: false, types: [t210] },
    "qti-integer-divide": t412,
    "qti-integer-modulus": t412,
    "qti-integer-to-float": t410,
    "qti-interaction-markup": { attributes: t182, children: t522, global: false, types: [t523] },
    "qti-interaction-module": { attributes: t526, children: t145, global: false, types: [t527] },
    "qti-interaction-modules": { attributes: t530, children: t532, global: false, types: [t533] },
    "qti-interpolation-table": { attributes: t534, children: t537, global: false, types: [t538] },
    "qti-interpolation-table-entry": {
      attributes: t542,
      children: t145,
      global: false,
      types: [t535],
    },
    "qti-is-null": t410,
    "qti-item-body": { attributes: t543, children: t546, global: false, types: [t279] },
    "qti-item-session-control": { attributes: t554, children: t145, global: false, types: [t298] },
    "qti-label": { attributes: t80, children: t487, global: false, types: [t518] },
    "qti-lcm": t250,
    "qti-lookup-outcome-value": { attributes: t425, children: t248, global: false, types: [t555] },
    "qti-lt": t412,
    "qti-lte": t412,
    "qti-major-increment": t561,
    "qti-map-entry": { attributes: t564, children: t145, global: false, types: [t565] },
    "qti-map-response": t567,
    "qti-map-response-point": t567,
    "qti-mapping": { attributes: t262, children: t569, global: false, types: [t570] },
    "qti-match": t412,
    "qti-match-interaction": { attributes: t572, children: t575, global: false, types: [t107] },
    "qti-match-table": { attributes: t534, children: t578, global: false, types: [t579] },
    "qti-match-table-entry": { attributes: t580, children: t145, global: false, types: [t576] },
    "qti-math-constant": { attributes: t581, children: t145, global: false, types: [t214] },
    "qti-math-operator": { attributes: t581, children: t248, global: false, types: [t216] },
    "qti-max": t250,
    "qti-media-interaction": { attributes: t585, children: t586, global: false, types: [t109] },
    "qti-member": t412,
    "qti-metadata-ref": t181,
    "qti-min": t250,
    "qti-minimum-length": { attributes: t182, children: t145, global: false, types: [t587] },
    "qti-minor-increment": t561,
    "qti-modal-feedback": { attributes: t588, children: t590, global: false, types: [t281] },
    "qti-multiple": t592,
    "qti-not": t410,
    "qti-null": t452,
    "qti-number-correct": t598,
    "qti-number-incorrect": t598,
    "qti-number-presented": t598,
    "qti-number-responded": t598,
    "qti-number-selected": t598,
    "qti-or": t250,
    "qti-order-interaction": { attributes: t599, children: t401, global: false, types: [t111] },
    "qti-ordered": t592,
    "qti-ordering": {
      anyElement: t435,
      attributes: t600,
      children: t145,
      global: false,
      types: [t317],
    },
    "qti-outcome-condition": { attributes: t182, children: t605, global: false, types: [t606] },
    "qti-outcome-declaration": {
      attributes: t614,
      children: t617,
      global: true,
      types: [
        {
          local: "OutcomeDeclarationDType",
          namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
        },
      ],
    },
    "qti-outcome-else": { attributes: t182, children: t624, global: false, types: [t601] },
    "qti-outcome-else-if": t627,
    "qti-outcome-if": t627,
    "qti-outcome-maximum": t631,
    "qti-outcome-minimum": t631,
    "qti-outcome-processing": {
      attributes: t182,
      children: t624,
      global: true,
      types: [
        {
          local: "OutcomeProcessingDType",
          namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
        },
      ],
    },
    "qti-outcome-processing-fragment": {
      attributes: t182,
      children: t624,
      global: false,
      types: [t620],
    },
    "qti-pattern-match": { attributes: t633, children: t248, global: false, types: [t226] },
    "qti-physical-material": t439,
    "qti-portable-custom-interaction": {
      attributes: t636,
      children: t642,
      global: false,
      types: [t113],
    },
    "qti-position-object-interaction": {
      attributes: t644,
      children: t478,
      global: false,
      types: [t645],
    },
    "qti-position-object-stage": { attributes: t387, children: t647, global: false, types: [t153] },
    "qti-power": t412,
    "qti-pre-condition": t410,
    "qti-printed-variable": { attributes: t653, children: t145, global: false, types: [t73] },
    "qti-product": t250,
    "qti-prompt": { attributes: t84, children: t654, global: false, types: [t349] },
    "qti-protractor": { attributes: t182, children: t657, global: false, types: [t404] },
    "qti-random": t410,
    "qti-random-float": { attributes: t253, children: t145, global: false, types: [t228] },
    "qti-random-integer": { attributes: t659, children: t145, global: false, types: [t230] },
    "qti-repeat": { attributes: t661, children: t248, global: false, types: [t232] },
    "qti-resource-icon": { attributes: t182, children: t145, global: false, types: [t369] },
    "qti-response-condition": { attributes: t182, children: t666, global: false, types: [t667] },
    "qti-response-declaration": { attributes: t421, children: t671, global: false, types: [t283] },
    "qti-response-else": { attributes: t182, children: t675, global: false, types: [t662] },
    "qti-response-else-if": t678,
    "qti-response-if": t678,
    "qti-response-processing": {
      attributes: t681,
      children: t675,
      global: true,
      types: [
        {
          local: "ResponseProcessingDType",
          namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
        },
      ],
    },
    "qti-response-processing-fragment": {
      attributes: t182,
      children: t675,
      global: false,
      types: [t673],
    },
    "qti-round": t410,
    "qti-round-to": { attributes: t450, children: t248, global: false, types: [t234] },
    "qti-rubric-block": {
      attributes: t683,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t60,
      },
      global: false,
      types: [t544, t319],
    },
    "qti-rule": { attributes: t182, children: t688, global: false, types: [t406] },
    "qti-rule-system-si": { attributes: t182, children: t691, global: false, types: [t684] },
    "qti-rule-system-us": { attributes: t182, children: t693, global: false, types: [t686] },
    "qti-select-point-interaction": {
      attributes: t493,
      children: t440,
      global: false,
      types: [t115],
    },
    "qti-selection": {
      anyElement: t435,
      attributes: t696,
      children: t145,
      global: false,
      types: [t321],
    },
    "qti-set-correct-response": t698,
    "qti-set-default-value": t698,
    "qti-set-outcome-value": t698,
    "qti-set-template-value": t698,
    "qti-simple-associable-choice": {
      attributes: t699,
      children: t700,
      global: false,
      types: [t351],
    },
    "qti-simple-choice": { attributes: t513, children: t700, global: false, types: [t399] },
    "qti-simple-match-set": { attributes: t387, children: t701, global: false, types: [t573] },
    "qti-slider-interaction": { attributes: t704, children: t464, global: false, types: [t117] },
    "qti-stats-operator": { attributes: t581, children: t248, global: false, types: [t236] },
    "qti-stimulus-body": { attributes: t84, children: t705, global: false, types: [t326] },
    "qti-string-match": { attributes: t707, children: t248, global: false, types: [t238] },
    "qti-stylesheet": { attributes: t709, children: t145, global: false, types: [t285] },
    "qti-substring": { attributes: t710, children: t248, global: false, types: [t240] },
    "qti-subtract": t412,
    "qti-sum": { attributes: t182, children: t711, global: false, types: [t242] },
    "qti-template-block": { attributes: t499, children: t467, global: false, types: [t712, t119] },
    "qti-template-condition": { attributes: t182, children: t717, global: false, types: [t718] },
    "qti-template-constraint": { attributes: t182, children: t248, global: false, types: [t719] },
    "qti-template-declaration": { attributes: t722, children: t424, global: false, types: [t287] },
    "qti-template-default": { attributes: t723, children: t248, global: false, types: [t300] },
    "qti-template-else": { attributes: t182, children: t726, global: false, types: [t713] },
    "qti-template-else-if": t729,
    "qti-template-if": t729,
    "qti-template-inline": {
      attributes: t499,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      global: false,
      types: [t730, t75],
    },
    "qti-template-processing": { attributes: t182, children: t726, global: false, types: [t289] },
    "qti-template-variable": { attributes: t723, children: t145, global: false, types: [t640] },
    "qti-test-feedback": { attributes: t732, children: t734, global: false, types: [t331] },
    "qti-test-part": { attributes: t737, children: t738, global: false, types: [t333] },
    "qti-test-variables": { attributes: t740, children: t145, global: false, types: [t244] },
    "qti-text-entry-interaction": { attributes: t741, children: t145, global: false, types: [t77] },
    "qti-time-limits": { attributes: t745, children: t145, global: false, types: [t302] },
    "qti-truncate": t410,
    "qti-upload-interaction": { attributes: t746, children: t464, global: false, types: [t121] },
    "qti-usagedata-ref": t181,
    "qti-value": { attributes: t747, children: t145, global: false, types: [t429] },
    "qti-variable": { attributes: t748, children: t145, global: false, types: [t246] },
    "qti-variable-mapping": { attributes: t751, children: t145, global: false, types: [t304] },
    "qti-weight": { attributes: t752, children: t145, global: false, types: [t306] },
    rb: t756,
    rp: t756,
    rt: t756,
    rtc: {
      attributes: t84,
      children: t757,
      global: true,
      types: [{ local: "RTCDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    ruby: {
      attributes: t84,
      children: t758,
      global: true,
      types: [{ local: "RubyDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    samp: t83,
    section: t126,
    small: t83,
    source: {
      attributes: t761,
      children: t145,
      global: true,
      types: [{ local: "SourceDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    span: t83,
    strong: t83,
    sub: t83,
    summary: t756,
    sup: t83,
    table: {
      attributes: t763,
      children: t764,
      global: true,
      types: [{ local: "TableDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    tbody: t768,
    td: t780,
    template: {
      anyElement: t433,
      attributes: t182,
      children: t145,
      global: true,
      types: [{ local: "TemplateDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    tfoot: t768,
    th: t780,
    thead: t768,
    tr: {
      attributes: t84,
      children: t781,
      global: true,
      types: [{ local: "TRDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    track: {
      attributes: t784,
      children: t145,
      global: true,
      types: [{ local: "TrackDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
    tt: t83,
    ul: t171,
    var: t83,
    video: {
      attributes: t786,
      children: t136,
      global: true,
      types: [{ local: "VideoDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" }],
    },
  },
  types: {
    ADType: { attributes: t59, base: t787, children: t79, derivation: "extension" },
    ARIABaseDType: {
      attributes: [
        t0,
        t1,
        t2,
        t3,
        t4,
        t5,
        t6,
        t7,
        t8,
        t9,
        t10,
        t11,
        t12,
        t13,
        t14,
        t15,
        t16,
        t17,
        t18,
        t19,
        t20,
        t21,
        t22,
        t23,
        t24,
        t25,
        t26,
        t27,
        t28,
        t29,
        t30,
        t31,
        t32,
        t33,
        t34,
        t35,
        t36,
        t37,
        t38,
        t39,
        t40,
        t41,
        t42,
        t43,
        t44,
        t45,
        t55,
      ],
      base: t788,
      children: t145,
      derivation: "restriction",
    },
    ARIABaseEmptyDType: {
      attributes: [
        t0,
        t1,
        t2,
        t3,
        t4,
        t5,
        t6,
        t7,
        t8,
        t9,
        t10,
        t11,
        t12,
        t13,
        t14,
        t15,
        t16,
        t17,
        t18,
        t143,
        t20,
        t21,
        t22,
        t23,
        t24,
        t25,
        t26,
        t27,
        t28,
        t29,
        t30,
        t31,
        t32,
        t33,
        t34,
        t35,
        t36,
        t37,
        t38,
        t39,
        t40,
        t41,
        t42,
        t43,
        t44,
        t45,
        t55,
      ],
      base: t220,
      children: t145,
      derivation: "extension",
    },
    ARIALevelIntegerDType: {
      attributes: t182,
      base: t587,
      children: t145,
      derivation: "restriction",
    },
    ARIARelevantListDType: t790,
    AdaptiveHrefDType: { attributes: t178, base: t220, children: t145, derivation: "extension" },
    AdaptiveSelectionDType: {
      attributes: t182,
      base: t788,
      children: t184,
      derivation: "restriction",
    },
    AnyNDType: { attributes: t253, base: t788, children: t248, derivation: "restriction" },
    AreaMapEntryDType: { attributes: t257, base: t220, children: t145, derivation: "extension" },
    AreaMappingDType: { attributes: t262, base: t788, children: t264, derivation: "restriction" },
    AssessmentItemDType: {
      attributes: t270,
      base: t788,
      children: t291,
      derivation: "restriction",
    },
    AssessmentItemRefDType: {
      attributes: t295,
      base: t788,
      children: t308,
      derivation: "restriction",
    },
    AssessmentSectionDType: {
      attributes: t312,
      base: t788,
      children: t323,
      derivation: "restriction",
    },
    AssessmentSectionRefDType: {
      attributes: t324,
      base: t220,
      children: t145,
      derivation: "extension",
    },
    AssessmentStimulusDType: {
      attributes: t325,
      base: t788,
      children: t328,
      derivation: "restriction",
    },
    AssessmentStimulusRefDType: {
      attributes: t329,
      base: t220,
      children: t145,
      derivation: "extension",
    },
    AssessmentTestDType: {
      attributes: t330,
      base: t788,
      children: t335,
      derivation: "restriction",
    },
    AssociableHotspotDType: {
      attributes: t342,
      base: t791,
      children: t145,
      derivation: "extension",
    },
    AssociateInteractionDType: {
      attributes: t348,
      base: t792,
      children: t353,
      derivation: "extension",
    },
    AudioDType: { attributes: t135, base: t793, children: t136, derivation: "extension" },
    BDIDType: { attributes: t84, base: t793, children: t137, derivation: "extension" },
    BDODType: { attributes: t139, base: t793, children: t140, derivation: "extension" },
    BRDType: t794,
    BaseHTML5FlowDType: t795,
    BaseHTML5PhrasingDType: {
      attributes: t84,
      base: t793,
      children: t753,
      derivation: "extension",
    },
    BasePromptInteractionDType: {
      attributes: t434,
      base: t796,
      children: t464,
      derivation: "extension",
    },
    BaseSequenceDType: { attributes: t84, base: t796, children: t145, derivation: "extension" },
    BaseSequenceEmptyDType: {
      attributes: [
        t0,
        t1,
        t2,
        t3,
        t4,
        t5,
        t6,
        t7,
        t8,
        t9,
        t10,
        t11,
        t12,
        t13,
        t14,
        t15,
        t16,
        t17,
        t18,
        t143,
        t20,
        t21,
        t22,
        t23,
        t24,
        t25,
        t26,
        t27,
        t28,
        t29,
        t30,
        t31,
        t32,
        t33,
        t34,
        t35,
        t36,
        t37,
        t38,
        t39,
        t40,
        t41,
        t42,
        t43,
        t44,
        t45,
        t46,
        t47,
        t48,
        t50,
        t52,
        t53,
        t54,
        t55,
        t58,
      ],
      base: t797,
      children: t145,
      derivation: "extension",
    },
    BaseSequenceFullDType: {
      attributes: t434,
      base: t796,
      children: t145,
      derivation: "extension",
    },
    BaseSequenceRIdentDType: {
      attributes: [
        t0,
        t1,
        t2,
        t3,
        t4,
        t5,
        t6,
        t7,
        t8,
        t9,
        t10,
        t11,
        t12,
        t13,
        t14,
        t15,
        t16,
        t17,
        t18,
        t19,
        t20,
        t21,
        t22,
        t23,
        t24,
        t25,
        t26,
        t27,
        t28,
        t29,
        t30,
        t31,
        t32,
        t33,
        t34,
        t35,
        t36,
        t37,
        t38,
        t39,
        t40,
        t41,
        t42,
        t43,
        t44,
        t45,
        t46,
        t47,
        t48,
        t50,
        t52,
        t53,
        t54,
        t346,
        t55,
        t58,
      ],
      base: t796,
      children: t145,
      derivation: "extension",
    },
    BaseSequenceXBaseDType: {
      attributes: t80,
      base: t796,
      children: t145,
      derivation: "extension",
    },
    BaseSequenceXBaseEmptyDType: {
      attributes: t144,
      base: t797,
      children: t145,
      derivation: "extension",
    },
    BaseValueDType: { attributes: t355, base: t789, children: t145, derivation: "extension" },
    BlockQuoteDType: { attributes: t142, base: t787, children: t137, derivation: "extension" },
    BranchRuleDType: { attributes: t357, base: t788, children: t248, derivation: "restriction" },
    CalculatorDType: { attributes: t182, base: t788, children: t363, derivation: "restriction" },
    CaptionDType: t795,
    CardDType: { attributes: t375, base: t788, children: t382, derivation: "restriction" },
    CardEntryDType: { attributes: t385, base: t788, children: t386, derivation: "restriction" },
    CatalogDType: { attributes: t387, base: t788, children: t389, derivation: "restriction" },
    CatalogInfoDType: { attributes: t182, base: t788, children: t392, derivation: "restriction" },
    ChoiceInteractionDType: {
      attributes: t398,
      base: t792,
      children: t401,
      derivation: "extension",
    },
    ColDType: { attributes: t147, base: t791, children: t145, derivation: "extension" },
    ColGroupDType: { attributes: t148, base: t793, children: t149, derivation: "extension" },
    CompanionMaterialsInfoDType: {
      anyElement: t402,
      attributes: t182,
      base: t788,
      children: t408,
      derivation: "restriction",
    },
    ContextDeclarationDType: {
      attributes: t421,
      base: t788,
      children: t424,
      derivation: "restriction",
    },
    ContextUniqueIDRefDType: t798,
    CoordsDType: t799,
    CorrectDType: t798,
    CorrectResponseDType: t800,
    CustomInteractionDType: {
      anyElement: t433,
      attributes: t434,
      base: t801,
      children: t145,
      derivation: "extension",
    },
    CustomOperatorDType: {
      anyElement: t435,
      attributes: t437,
      base: t788,
      children: t248,
      derivation: "restriction",
    },
    DDDType: { attributes: t80, base: t787, children: t123, derivation: "extension" },
    DLDType: { attributes: t80, base: t787, children: t156, derivation: "extension" },
    DTDType: t802,
    DefaultDType: t798,
    DefaultValueDType: t800,
    DetailsDType: { attributes: t151, base: t793, children: t152, derivation: "extension" },
    DivDType: { attributes: t80, base: t787, children: t155, derivation: "extension" },
    DrawingInteractionDType: {
      attributes: t434,
      base: t792,
      children: t440,
      derivation: "extension",
    },
    EmptyPrimitiveTypeDType: {
      attributes: t182,
      base: t788,
      children: t145,
      derivation: "restriction",
    },
    EncVariableStringDType: t790,
    EndAttemptInteractionDType: {
      attributes: t442,
      base: t791,
      children: t145,
      derivation: "extension",
    },
    EqualDType: { attributes: t447, base: t788, children: t248, derivation: "restriction" },
    EqualRoundedDType: t803,
    ExtendedTextInteractionDType: {
      attributes: t463,
      base: t792,
      children: t464,
      derivation: "extension",
    },
    FeedbackBlockDType: {
      attributes: t466,
      base: t787,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": {
          kind: "named",
          type: t413,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
      },
      derivation: "extension",
    },
    FeedbackContentBodyDType: {
      attributes: t182,
      base: t788,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-associate-interaction": t86,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-choice-interaction": t88,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-custom-interaction": t62,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-drawing-interaction": t90,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-extended-text-interaction": t92,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": t94,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap-match-interaction": t96,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-associate-interaction": t98,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-gap-match-interaction": t100,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-graphic-order-interaction": t102,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hotspot-interaction": t104,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext-interaction": t106,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-match-interaction": t108,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-media-interaction": t110,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-order-interaction": t112,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-portable-custom-interaction": t114,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-position-object-stage": t154,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-select-point-interaction": t116,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-slider-interaction": t118,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-upload-interaction": t122,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "restriction",
    },
    FeedbackFlowContentBodyDType: {
      attributes: t182,
      base: t788,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t70,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "restriction",
    },
    FeedbackInlineDType: { attributes: t466, base: t787, children: t469, derivation: "extension" },
    FieldValueDType: { attributes: t471, base: t788, children: t248, derivation: "restriction" },
    FigureDType: { attributes: t84, base: t793, children: t157, derivation: "extension" },
    FileHrefCardDType: { attributes: t472, base: t804, children: t145, derivation: "extension" },
    FileHrefDType: { attributes: t182, base: t804, children: t145, derivation: "restriction" },
    GapDType: { attributes: t473, base: t791, children: t145, derivation: "extension" },
    GapImgDType: { attributes: t477, base: t793, children: t478, derivation: "extension" },
    GapMatchInteractionDType: {
      attributes: t481,
      base: t792,
      children: t485,
      derivation: "extension",
    },
    GapTextDType: { attributes: t486, base: t793, children: t487, derivation: "extension" },
    GraphicAssociateInteractionDType: {
      attributes: t488,
      base: t792,
      children: t490,
      derivation: "extension",
    },
    GraphicGapMatchInteractionDType: {
      attributes: t491,
      base: t801,
      children: t492,
      derivation: "extension",
    },
    GraphicOrderInteractionDType: {
      attributes: t493,
      base: t801,
      children: t496,
      derivation: "extension",
    },
    HRDType: t794,
    HTMLContentDType: { attributes: t501, base: t788, children: t502, derivation: "restriction" },
    HTMLTextDType: t802,
    HotTextDType: { attributes: t499, base: t787, children: t487, derivation: "extension" },
    HotTextInteractionDType: {
      attributes: t498,
      base: t792,
      children: t500,
      derivation: "extension",
    },
    HotspotChoiceDType: { attributes: t497, base: t791, children: t145, derivation: "extension" },
    HotspotInteractionDType: {
      attributes: t498,
      base: t792,
      children: t496,
      derivation: "extension",
    },
    IdentifierDType: t806,
    IdentifierListDType: t806,
    ImgDType: { attributes: t162, base: t791, children: t145, derivation: "extension" },
    IncrementSIDType: { attributes: t182, base: t788, children: t505, derivation: "restriction" },
    IncrementUSDType: { attributes: t182, base: t788, children: t509, derivation: "restriction" },
    IndexDType: { attributes: t512, base: t788, children: t248, derivation: "restriction" },
    InlineChoiceDType: { attributes: t513, base: t793, children: t487, derivation: "extension" },
    InlineChoiceInteractionDType: {
      attributes: t516,
      base: t801,
      children: t520,
      derivation: "extension",
    },
    InsideDType: { attributes: t521, base: t788, children: t248, derivation: "restriction" },
    IntegerListDType: {
      attributes: t182,
      base: { local: "int", namespace: "http://www.w3.org/2001/XMLSchema" },
      children: t145,
      derivation: "restriction",
    },
    InteractionMarkupDType: {
      attributes: t182,
      base: t788,
      children: t522,
      derivation: "restriction",
    },
    InteractionModuleDType: {
      attributes: t526,
      base: t220,
      children: t145,
      derivation: "extension",
    },
    InteractionModulesDType: {
      attributes: t530,
      base: t788,
      children: t532,
      derivation: "restriction",
    },
    InterpolationTableDType: {
      attributes: t534,
      base: t788,
      children: t537,
      derivation: "restriction",
    },
    InterpolationTableEntryDType: {
      attributes: t542,
      base: t220,
      children: t145,
      derivation: "extension",
    },
    ItemBodyDType: { attributes: t543, base: t788, children: t546, derivation: "restriction" },
    ItemFileInfoDType: { attributes: t366, base: t788, children: t371, derivation: "restriction" },
    ItemSessionControlDType: {
      attributes: t554,
      base: t220,
      children: t145,
      derivation: "extension",
    },
    LIDType: t795,
    LabelDType: { attributes: t80, base: t787, children: t487, derivation: "extension" },
    LengthDType: t790,
    Logic0toManyDType: t807,
    Logic1toManyDType: t807,
    LogicPairDType: t807,
    LogicSingleDType: t807,
    LookupOutcomeValueDType: t808,
    MapEntryDType: { attributes: t564, base: t220, children: t145, derivation: "extension" },
    MapResponseDType: t798,
    MappingDType: { attributes: t262, base: t788, children: t569, derivation: "restriction" },
    MatchInteractionDType: {
      attributes: t572,
      base: t792,
      children: t575,
      derivation: "extension",
    },
    MatchTableDType: { attributes: t534, base: t788, children: t578, derivation: "restriction" },
    MatchTableEntryDType: { attributes: t580, base: t220, children: t145, derivation: "extension" },
    MathConstantDType: { attributes: t581, base: t220, children: t145, derivation: "extension" },
    MathOperatorDType: t809,
    MediaInteractionDType: {
      attributes: t585,
      base: t792,
      children: t586,
      derivation: "extension",
    },
    MimeTypeDType: t799,
    MimeTypeListDType: {
      attributes: t182,
      base: { local: "MimeTypeDType", namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0" },
      children: t145,
      derivation: "restriction",
    },
    ModalFeedbackDType: { attributes: t588, base: t788, children: t590, derivation: "restriction" },
    NonNegativeDoubleDType: {
      attributes: t182,
      base: t810,
      children: t145,
      derivation: "restriction",
    },
    NumberDType: { attributes: t596, base: t220, children: t145, derivation: "extension" },
    NumericLogic1toManyDType: {
      attributes: t182,
      base: t788,
      children: t711,
      derivation: "restriction",
    },
    OULDType: { attributes: t80, base: t787, children: t168, derivation: "extension" },
    ObjectDType: { attributes: t164, base: t787, children: t167, derivation: "extension" },
    OrderInteractionDType: {
      attributes: t599,
      base: t792,
      children: t401,
      derivation: "extension",
    },
    OrderingDType: {
      anyElement: t435,
      attributes: t600,
      base: t788,
      children: t145,
      derivation: "restriction",
    },
    OutcomeConditionDType: {
      attributes: t182,
      base: t788,
      children: t605,
      derivation: "restriction",
    },
    OutcomeDeclarationDType: {
      attributes: t614,
      base: t788,
      children: t617,
      derivation: "restriction",
    },
    OutcomeElseDType: t811,
    OutcomeIfDType: { attributes: t182, base: t788, children: t625, derivation: "restriction" },
    OutcomeMinMaxDType: { attributes: t629, base: t220, children: t145, derivation: "extension" },
    OutcomeProcessingDType: t811,
    OutcomeProcessingFragmentDType: t811,
    ParamDType: { attributes: t175, base: t220, children: t145, derivation: "extension" },
    PatternMatchDType: { attributes: t633, base: t788, children: t248, derivation: "restriction" },
    PictureDType: { attributes: t84, base: t793, children: t176, derivation: "extension" },
    PortableCustomInteractionDType: {
      attributes: t636,
      base: t792,
      children: t642,
      derivation: "extension",
    },
    PositionObjectInteractionDType: {
      attributes: t644,
      base: {
        local: "BaseSequenceRIdentDType",
        namespace: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
      },
      children: t478,
      derivation: "extension",
    },
    PositionObjectStageDType: {
      attributes: t387,
      base: t788,
      children: t647,
      derivation: "restriction",
    },
    PrintedVariableDType: { attributes: t653, base: t220, children: t145, derivation: "extension" },
    PromptDType: { attributes: t84, base: t793, children: t654, derivation: "extension" },
    ProtractorDType: { attributes: t182, base: t788, children: t657, derivation: "restriction" },
    QDType: { attributes: t142, base: t787, children: t79, derivation: "extension" },
    RTCDType: { attributes: t84, base: t793, children: t757, derivation: "extension" },
    RadialSIValueDType: t813,
    RadialUSValueDType: t813,
    RandomFloatDType: { attributes: t253, base: t220, children: t145, derivation: "extension" },
    RandomIntegerDType: { attributes: t659, base: t220, children: t145, derivation: "extension" },
    RepeatDType: { attributes: t661, base: t788, children: t248, derivation: "restriction" },
    ResponseConditionDType: {
      attributes: t182,
      base: t788,
      children: t666,
      derivation: "restriction",
    },
    ResponseDeclarationDType: {
      attributes: t421,
      base: t788,
      children: t671,
      derivation: "restriction",
    },
    ResponseElseDType: t814,
    ResponseIfDType: { attributes: t182, base: t788, children: t676, derivation: "restriction" },
    ResponseProcessingDType: {
      attributes: t681,
      base: t788,
      children: t675,
      derivation: "restriction",
    },
    ResponseProcessingFragmentDType: t814,
    RoundToDType: t803,
    RubricBlockContentBodyDType: {
      attributes: t182,
      base: t788,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": {
          kind: "named",
          type: t712,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": {
          kind: "named",
          type: t730,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "restriction",
    },
    RubricBlockDType: {
      attributes: t683,
      base: t787,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": {
          kind: "named",
          type: t415,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
      },
      derivation: "extension",
    },
    RubricBlockTemplateBlockContentBodyDType: {
      attributes: t182,
      base: t788,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "restriction",
    },
    RubricBlockTemplateBlockDType: {
      attributes: t499,
      base: t787,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": {
          kind: "named",
          type: t416,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
      },
      derivation: "extension",
    },
    RubricBlockTemplateInlineDType: {
      attributes: t499,
      base: t787,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "extension",
    },
    RubyDType: { attributes: t84, base: t793, children: t758, derivation: "extension" },
    RuleDType: { attributes: t182, base: t788, children: t688, derivation: "restriction" },
    SILinearValueDType: t813,
    SIRuleSystemDType: { attributes: t182, base: t788, children: t691, derivation: "restriction" },
    SelectPointInteractionDType: {
      attributes: t493,
      base: t792,
      children: t440,
      derivation: "extension",
    },
    SelectionDType: {
      anyElement: t435,
      attributes: t696,
      base: t788,
      children: t145,
      derivation: "restriction",
    },
    SetValueDType: t808,
    SimpleAssociableChoiceDType: {
      attributes: t699,
      base: t793,
      children: t700,
      derivation: "extension",
    },
    SimpleChoiceDType: { attributes: t513, base: t793, children: t700, derivation: "extension" },
    SimpleMatchSetDType: {
      attributes: t387,
      base: t788,
      children: t701,
      derivation: "restriction",
    },
    SliderInteractionDType: {
      attributes: t704,
      base: t792,
      children: t464,
      derivation: "extension",
    },
    SourceDType: { attributes: t761, base: t815, children: t145, derivation: "extension" },
    StatsOperatorDType: t809,
    StimulusBodyDType: { attributes: t84, base: t793, children: t705, derivation: "extension" },
    StringListDType: t790,
    StringMatchDType: { attributes: t707, base: t788, children: t248, derivation: "restriction" },
    StyleSheetDType: { attributes: t709, base: t220, children: t145, derivation: "extension" },
    SubstringDType: { attributes: t710, base: t788, children: t248, derivation: "restriction" },
    SupportExtStringDType: t799,
    TDHDType: { attributes: t777, base: t793, children: t123, derivation: "extension" },
    TRDType: { attributes: t84, base: t793, children: t781, derivation: "extension" },
    TableDType: { attributes: t763, base: t787, children: t764, derivation: "extension" },
    TablePartDType: { attributes: t84, base: t793, children: t765, derivation: "extension" },
    TemplateBlockContentBodyDType: {
      attributes: t182,
      base: t788,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}address": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}article": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}aside": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}audio": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}blockquote": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}details": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}div": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dl": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}figure": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}footer": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h1": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h2": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h3": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h4": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h5": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}h6": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}header": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}hr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}nav": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ol": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}p": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}pre": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-block": {
          kind: "named",
          type: t468,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-block": t120,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}section": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}table": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ul": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}video": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "restriction",
    },
    TemplateBlockContentDType: {
      attributes: t80,
      base: t787,
      children: t817,
      derivation: "extension",
    },
    TemplateBlockDType: { attributes: t499, base: t818, children: t817, derivation: "extension" },
    TemplateBlockFeedbackBlockDType: {
      attributes: t466,
      base: t818,
      children: t817,
      derivation: "extension",
    },
    TemplateConditionDType: {
      attributes: t182,
      base: t788,
      children: t717,
      derivation: "restriction",
    },
    TemplateConstraintDType: t807,
    TemplateDType: {
      anyElement: t433,
      attributes: t182,
      base: t788,
      children: t145,
      derivation: "restriction",
    },
    TemplateDeclarationDType: {
      attributes: t722,
      base: t788,
      children: t424,
      derivation: "restriction",
    },
    TemplateDefaultDType: {
      attributes: t723,
      base: t788,
      children: t248,
      derivation: "restriction",
    },
    TemplateElseDType: t819,
    TemplateIfDType: { attributes: t182, base: t788, children: t727, derivation: "restriction" },
    TemplateInlineDType: {
      attributes: t499,
      base: t787,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}a": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}abbr": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}acronym": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}b": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdi": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}bdo": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}big": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}br": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}cite": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}code": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}dfn": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}em": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}i": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}img": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}kbd": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}label": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}object": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}picture": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}q": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-feedback-inline": t66,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-gap": t68,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-hottext": t70,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-template-inline": t76,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}ruby": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}samp": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}small": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}span": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}strong": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sub": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}sup": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}tt": t60,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}var": t60,
        "{http://www.w3.org/1998/Math/MathML}math": t60,
        "{http://www.w3.org/2001/10/synthesis}audio": t60,
        "{http://www.w3.org/2001/10/synthesis}break": t60,
        "{http://www.w3.org/2001/10/synthesis}emphasis": t60,
        "{http://www.w3.org/2001/10/synthesis}mark": t60,
        "{http://www.w3.org/2001/10/synthesis}p": t60,
        "{http://www.w3.org/2001/10/synthesis}phoneme": t60,
        "{http://www.w3.org/2001/10/synthesis}prosody": t60,
        "{http://www.w3.org/2001/10/synthesis}s": t60,
        "{http://www.w3.org/2001/10/synthesis}say-as": t60,
        "{http://www.w3.org/2001/10/synthesis}speak": t60,
        "{http://www.w3.org/2001/10/synthesis}sub": t60,
        "{http://www.w3.org/2001/10/synthesis}voice": t60,
        "{http://www.w3.org/2001/XInclude}include": t60,
      },
      derivation: "extension",
    },
    TemplateProcessingDType: t819,
    TemplateUniqueIDRefDType: {
      attributes: t723,
      base: t220,
      children: t145,
      derivation: "extension",
    },
    TestFeedbackDType: { attributes: t732, base: t788, children: t734, derivation: "restriction" },
    TestFeedbackFlowContentBodyDType: t820,
    TestPartDType: { attributes: t737, base: t788, children: t738, derivation: "restriction" },
    TestRubricBlockContentBodyDType: t820,
    TestRubricBlockDType: {
      attributes: t683,
      base: t787,
      children: {
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-catalog-info": t274,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-content-body": {
          kind: "named",
          type: t419,
        },
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-printed-variable": t74,
        "{http://www.imsglobal.org/xsd/imsqtiasi_v3p0}qti-stylesheet": t286,
      },
      derivation: "extension",
    },
    TestVariablesDType: { attributes: t740, base: t220, children: t145, derivation: "extension" },
    TextEntryInteractionDType: {
      attributes: t741,
      base: t791,
      children: t145,
      derivation: "extension",
    },
    TimeLimitsDType: { attributes: t745, base: t220, children: t145, derivation: "extension" },
    ToleranceListDType: {
      attributes: t182,
      children: t145,
      derivation: "union",
      members: [t789, t810],
    },
    TrackDType: { attributes: t784, base: t815, children: t145, derivation: "extension" },
    URLDType: t799,
    USLinearValueDType: t813,
    USRuleSystemDType: { attributes: t182, base: t788, children: t693, derivation: "restriction" },
    UniqueIdentifierDType: {
      attributes: t182,
      base: { local: "ID", namespace: "http://www.w3.org/2001/XMLSchema" },
      children: t145,
      derivation: "restriction",
    },
    UniqueIdentifierRefDType: {
      attributes: t182,
      base: { local: "IDREF", namespace: "http://www.w3.org/2001/XMLSchema" },
      children: t145,
      derivation: "restriction",
    },
    UploadInteractionDType: {
      attributes: t746,
      base: t792,
      children: t464,
      derivation: "extension",
    },
    UseExtensionStringDType: t799,
    ValueDType: { attributes: t747, base: t361, children: t145, derivation: "extension" },
    VariableDType: { attributes: t748, base: t220, children: t145, derivation: "extension" },
    VariableMappingDType: { attributes: t751, base: t220, children: t145, derivation: "extension" },
    VariableStringDType: t790,
    VideoDType: { attributes: t786, base: t793, children: t136, derivation: "extension" },
    ViewEnumDType: t790,
    WeightDType: { attributes: t752, base: t220, children: t145, derivation: "extension" },
  },
};
