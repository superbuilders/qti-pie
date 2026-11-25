/**
 * The attributes plate writes on each MathML element: MathML 3's own, by the attribute groups of
 * its schemas, read by the server shell's MathML writer (`#plate/ui/item/contents/mathml.tsx`) as
 * its allow-list. It judges nothing: the database admitted the MathML (pantry's laws, reading
 * `mathml-validity`).
 *
 * @module
 */
import { regex } from "arkregex";

/**
 * The no-namespace attributes plate writes on every MathML element: those MathML 3 admits on every
 * element, `id`, `xref`, `class`, `href` and the deprecated `other` (§2.1.6, "Attributes Shared by
 * all MathML Elements"), and `cdbase`, which inherits down the tree (§4.2.3.2), but `style`: plate
 * renders no author style, on MathML as on the body's HTML, so a `style` admission accepted
 * (`mathml3-common.xsd` declares it) is not written.
 */
const commonAttributes: readonly string[] = ["cdbase", "class", "href", "id", "other", "xref"];

/**
 * Split a list of names written with white space between them.
 *
 * @param list The names.
 * @returns Each name, none for an empty list.
 */
const words = (list: string): readonly string[] => list.match(regex("\\S+", "gu")) ?? [];

/**
 * A group of elements and the attributes MathML 3 gives each of them beyond
 * {@link commonAttributes}.
 */
interface AttributeRow {
  readonly attributes: readonly string[];
  readonly elements: readonly string[];
}

/**
 * The attributes of each MathML 3 element beyond the common ones, one row per group of elements
 * that carry the same, as the attribute groups of `mathml3-common.xsd`, `mathml3-presentation.xsd`,
 * `mathml3-content.xsd` and `mathml3-strict-content.xsd` expand for each `xs:element`; the
 * RelaxNG, which the reading "MathML validity is the MathML 3 Recommendation" holds normative,
 * agrees with them name for name. Deprecated names the Recommendation still lists are admitted.
 * The names are MathML's own spellings, `definitionURL` the one in camel case, which the tree
 * holds (`readName` in `#plate/content/mathml.ts`).
 */
const attributeRows: readonly AttributeRow[] = [
  {
    attributes: words("definitionURL encoding"),
    elements: words(`
      abs and approx arccos arccosh arccot arccoth arccsc arccsch arcsec arcsech arcsin arcsinh
      arctan arctanh arg card cartesianproduct cbytes ceiling codomain complexes compose conjugate
      cos cosh cot coth cs csc csch curl determinant diff divergence divide domain emptyset eq
      equivalent eulergamma exists exp exponentiale factorial factorof false floor forall gcd geq
      grad gt ident image imaginary imaginaryi implies in infinity int integers intersect inverse
      lambda laplacian lcm leq limit ln log lt matrix matrixrow max mean median min minus mode
      moment naturalnumbers neq not notanumber notin notprsubset notsubset or otherwise
      outerproduct partialdiff pi piece piecewise plus power primes product prsubset quotient
      rationals real reals rem root scalarproduct sdev sec sech selector setdiff sin sinh subset
      sum tan tanh times transpose true union variance vector vectorproduct xor
    `),
  },
  {
    attributes: [],
    elements: words(`
      apply bind bvar cerror condition degree domainofapplication fn logbase lowlimit momentabout
      reln sep uplimit
    `),
  },
  {
    attributes: words("mathbackground mathcolor"),
    elements: words("merror mphantom mprescripts mroot msqrt none"),
  },
  {
    attributes: words(`
      background color dir fontfamily fontsize fontstyle fontweight mathbackground mathcolor
      mathsize mathvariant
    `),
    elements: words("mi mn mtext"),
  },
  {
    attributes: words("definitionURL encoding type"),
    elements: words("ci set tendsto"),
  },
  {
    attributes: words("cd definitionURL encoding name src"),
    elements: words("annotation annotation-xml"),
  },
  {
    attributes: words("columnalign groupalign mathbackground mathcolor rowalign"),
    elements: words("mlabeledtr mtr"),
  },
  {
    attributes: words("mathbackground mathcolor subscriptshift superscriptshift"),
    elements: words("mmultiscripts msubsup"),
  },
  {
    attributes: words(`
      accent accentunder align alignmentscope altimg altimg-height altimg-valign altimg-width
      alttext bevelled cdgroup charalign charspacing close columnalign columnlines columnspacing
      columnspan columnwidth crossout decimalpoint denomalign depth dir display displaystyle edge
      equalcolumns equalrows fence form frame framespacing groupalign height indentalign
      indentalignfirst indentalignlast indentshift indentshiftfirst indentshiftlast indenttarget
      infixlinebreakstyle largeop leftoverhang length linebreak linebreakmultchar linebreakstyle
      lineleading linethickness location longdivstyle lquote lspace macros mathbackground
      mathcolor mathsize mathvariant maxsize maxwidth minlabelspacing minsize mode movablelimits
      mslinethickness notation numalign open overflow position rightoverhang rowalign rowlines
      rowspacing rowspan rquote rspace scriptlevel scriptminsize scriptsizemultiplier selection
      separator separators shift side stackalign stretchy subscriptshift superscriptshift
      symmetric valign width
    `),
    elements: words("math"),
  },
  {
    attributes: words(`
      accent accentunder align alignmentscope background bevelled charalign charspacing close
      color columnalign columnlines columnspacing columnspan columnwidth crossout decimalpoint
      denomalign depth dir displaystyle edge equalcolumns equalrows fence fontfamily fontsize
      fontstyle fontweight form frame framespacing groupalign height indentalign indentalignfirst
      indentalignlast indentshift indentshiftfirst indentshiftlast indenttarget
      infixlinebreakstyle largeop leftoverhang length linebreak linebreakmultchar linebreakstyle
      lineleading linethickness location longdivstyle lquote lspace mathbackground mathcolor
      mathsize mathvariant maxsize mediummathspace minlabelspacing minsize movablelimits
      mslinethickness notation numalign open position rightoverhang rowalign rowlines rowspacing
      rowspan rquote rspace scriptlevel scriptminsize scriptsizemultiplier selection separator
      separators shift side stackalign stretchy subscriptshift superscriptshift symmetric
      thickmathspace thinmathspace valign verythickmathspace verythinmathspace
      veryverythickmathspace veryverythinmathspace width
    `),
    elements: words("mstyle"),
  },
  {
    attributes: words("accent accentunder align mathbackground mathcolor"),
    elements: words("munderover"),
  },
  {
    attributes: words("accent align mathbackground mathcolor"),
    elements: words("mover"),
  },
  {
    attributes: words(`
      accent background color dir fence fontfamily fontsize fontstyle fontweight form
      indentalign indentalignfirst indentalignlast indentshift indentshiftfirst indentshiftlast
      indenttarget largeop linebreak linebreakmultchar linebreakstyle lineleading lspace
      mathbackground mathcolor mathsize mathvariant maxsize minsize movablelimits rspace
      separator stretchy symmetric
    `),
    elements: words("mo"),
  },
  {
    attributes: words("accentunder align mathbackground mathcolor"),
    elements: words("munder"),
  },
  {
    attributes: words("actiontype mathbackground mathcolor selection"),
    elements: words("maction"),
  },
  {
    attributes: words(`
      align alignmentscope columnalign columnlines columnspacing columnwidth displaystyle
      equalcolumns equalrows frame framespacing groupalign mathbackground mathcolor
      minlabelspacing rowalign rowlines rowspacing side width
    `),
    elements: words("mtable"),
  },
  {
    attributes: words("align charalign charspacing mathbackground mathcolor stackalign"),
    elements: words("mstack"),
  },
  {
    attributes: words(`
      alt background color fontfamily fontsize fontstyle fontweight height index mathbackground
      mathcolor mathsize mathvariant src valign width
    `),
    elements: words("mglyph"),
  },
  {
    attributes: words(`
      background color depth dir fontfamily fontsize fontstyle fontweight height indentalign
      indentalignfirst indentalignlast indentshift indentshiftfirst indentshiftlast indenttarget
      linebreak mathbackground mathcolor mathsize mathvariant width
    `),
    elements: words("mspace"),
  },
  {
    attributes: words(`
      background color dir fontfamily fontsize fontstyle fontweight lquote mathbackground
      mathcolor mathsize mathvariant rquote
    `),
    elements: words("ms"),
  },
  {
    attributes: words("base definitionURL encoding type"),
    elements: words("cn"),
  },
  {
    attributes: words("bevelled denomalign linethickness mathbackground mathcolor numalign"),
    elements: words("mfrac"),
  },
  {
    attributes: words("cd definitionURL encoding name"),
    elements: words("semantics"),
  },
  {
    attributes: words("cd definitionURL encoding type"),
    elements: words("csymbol"),
  },
  {
    attributes: words("close mathbackground mathcolor open separators"),
    elements: words("mfenced"),
  },
  {
    attributes: words("closure definitionURL encoding"),
    elements: words("interval"),
  },
  {
    attributes: words(
      "columnalign columnspan groupalign mathbackground mathcolor rowalign rowspan",
    ),
    elements: words("mtd"),
  },
  {
    attributes: words("crossout location mathbackground mathcolor"),
    elements: words("mscarry"),
  },
  {
    attributes: words("crossout location mathbackground mathcolor position scriptsizemultiplier"),
    elements: words("mscarries"),
  },
  {
    attributes: words("definitionURL encoding nargs occurrence scope type"),
    elements: words("declare"),
  },
  {
    attributes: words("definitionURL encoding order"),
    elements: words("list"),
  },
  {
    attributes: words("depth height lspace mathbackground mathcolor voffset width"),
    elements: words("mpadded"),
  },
  {
    attributes: words("dir mathbackground mathcolor"),
    elements: words("mrow"),
  },
  {
    attributes: words("edge mathbackground mathcolor"),
    elements: words("malignmark"),
  },
  {
    attributes: words("groupalign mathbackground mathcolor"),
    elements: words("maligngroup"),
  },
  {
    attributes: words(`
      leftoverhang length mathbackground mathcolor mslinethickness position rightoverhang
    `),
    elements: words("msline"),
  },
  {
    attributes: words("longdivstyle mathbackground mathcolor position shift"),
    elements: words("mlongdiv"),
  },
  {
    attributes: words("mathbackground mathcolor notation"),
    elements: words("menclose"),
  },
  {
    attributes: words("mathbackground mathcolor position shift"),
    elements: words("msgroup"),
  },
  {
    attributes: words("mathbackground mathcolor position"),
    elements: words("msrow"),
  },
  {
    attributes: words("mathbackground mathcolor subscriptshift"),
    elements: words("msub"),
  },
  {
    attributes: words("mathbackground mathcolor superscriptshift"),
    elements: words("msup"),
  },
  {
    attributes: words("src"),
    elements: words("share"),
  },
];

/**
 * The attributes plate writes on each MathML element, by local name: its row of
 * {@link attributeRows} and {@link commonAttributes}. Every MathML 3 element has a list, and
 * `annotation-xml` has its own; an element no row names has none, so nothing of it is written.
 */
export const elementAttributes: ReadonlyMap<string, ReadonlySet<string>> = new Map(
  attributeRows.flatMap(({ attributes, elements }) => {
    const admitted: ReadonlySet<string> = new Set([...commonAttributes, ...attributes]);

    return elements.map((element): readonly [string, ReadonlySet<string>] => [element, admitted]);
  }),
);
