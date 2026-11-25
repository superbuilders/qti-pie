import {
  Bits,
  closed,
  closedId,
  contained,
  Crypto,
  derived,
  Logic,
  natural,
  on,
  query,
  schema,
  str,
  v,
} from "@bjornpagen/grizzle";
import type { QtiLom } from "@qti-pie/pantry/qti/lom.ts";
import { Array as Arr, Option, pipe } from "effect";
import { named } from "#ledger/laws.ts";
import {
  baseTypes,
  operandBases,
  operandCardinalities,
  operandForms,
  profileReasons,
  rubricView,
  tableRoles,
} from "#ledger/registry/contract.ts";
import type { GraderVersion, Roster } from "#ledger/registry/contract.ts";
import { genericBindings, genericTables } from "#ledger/registry/seed.ts";

/**
 * Any text: a closed relation's text, matched against a QTI value as the value is written.
 */
const anyText = str.regex("^.*$", "su");

/**
 * The elements a registered operand's form is written as: a literal a `qti-base-value`, a
 * `qti-multiple` or `qti-ordered` of base values, or a `qti-null` where the item states none (ASI
 * §2.11.1.4: its value "is treated as if it is of any desired base-type"); a rubric a
 * `qti-base-value` naming it; a default a `qti-default`; an essay a `qti-variable`. `any` writes
 * any expression and is no row.
 */
const formKinds = [
  { form: "literal", kind: "qti-base-value" },
  { form: "literal", kind: "qti-null" },
  { form: "literal", kind: "qti-multiple" },
  { form: "literal", kind: "qti-ordered" },
  { form: "rubric", kind: "qti-base-value" },
  { form: "default", kind: "qti-default" },
  { form: "essay", kind: "qti-variable" },
] as const;

/**
 * The registry over an installation's QTI levels: two levels of grizzle's, each a PostgreSQL schema
 * of its own (README, "Levels"), since a derived relation reads only the levels below its own
 * (README, "Derived tables").
 *
 * - **`RegistryRoster`** (`registry_roster`): the deployment's roster (`Roster` of
 *   `#registry/contract.ts`) as closed relations, the constants every view reads: each operator's
 *   class, definition, value source, arity and result; its operands by name, rank, type and form;
 *   its record fields; the machine graders at their versions, the one roster of who a machine
 *   score's machine is, and each recorded class's grader in force; the rubric uses; the seed tables
 *   the primitives read, each entry with its place, and which table each class reads in each role;
 *   and why an element is outside the profile.
 * - **`Registry`** (`registry`): views over pantry's content, refusing nothing, `BoundOperator`,
 *   `RecordedApplication`, `RubricApplication` and `ApplicationDefault` stored (grizzle's
 *   `derived.stored`, kept at COMMIT at every package a transaction writes, so the grader and the
 *   learner part's judge read their tables):
 *
 *   - `OutsideProfile`: each element that puts its document outside this deployment's profile, with
 *     why, which the grader's gradable relation reads, so an item is served for credit only within
 *     the profile;
 *   - `BoundOperator`: each `qti-custom-operator` bound to its registered class, which the grader
 *     dispatches on;
 *   - `RecordedApplication`: each application of a recorded class in an item, which a ledger fact
 *     names;
 *   - `RubricGrader`: each item's `rubric-score` grader, by its rubric block, with the grader version
 *     in force;
 *   - `RubricApplication`: each `rubric-score` application of an item, with the rubric group it scores;
 *   - `ApplicationResponse`: each recorded application's `essay` operand, by the response it names;
 *   - `ApplicationDefault` and `ApplicationLiteral`: each bound operator's `default` operands, by the
 *     outcome each names, and its `literal` operands, by their text, each by the operator's place and
 *     the operand's rank;
 *
 * **Nothing here refuses admission** (Bjorn's ruling of 2026-11-20, SPEC-AUDIT batch 3): an
 * unregistered operator, its foreign children and attributes, operands of other forms and every
 * other narrowing below are valid QTI 3.0.1, which pantry admits. Content outside the profile is
 * "valid QTI 3.0.1, outside this deployment's profile" (QTI 3.0 Conformance §3 and §4.4: a
 * certified application "must be able to ignore or remove the unsupported data", and "can leave the
 * exchangeable materials unaltered, but not implement the unsupported features"), stored as written
 * and never served for credit, so an operator no class defines is never a silent score of 0 on the
 * student path. That replaces the earlier choice between refusing such an operator at admission and
 * evaluating it as NULL, both of which treated valid QTI as invalid or scored it silently.
 *
 * @param qti - The QTI levels the registry is built over: pantry's, as the installation composes
 *   them.
 * @param roster - The deployment's roster: its operators, grader versions, rubric uses, seed tables
 *   and their bindings.
 * @returns The two levels, the roster's below the registry's.
 */
export const registryOf = (qti: typeof QtiLom, roster: Roster) => {
  /**
   * The seed tables and bindings: the registry's own (`#ledger/registry/seed.ts`), then the
   * deployment's.
   */
  const tables = [...genericTables, ...roster.tables];
  const bindings = [...genericBindings, ...roster.bindings];

  const {
    Attribute,
    BaseType,
    BoundVariable,
    Cardinality,
    DeclarationName,
    Expression,
    IdValue,
    Literal,
    Node,
    NodeKind,
    OpenAttribute,
    OperandOf,
    ValueBase,
    ValueCardinality,
    VariableRef,
  } = qti.relations;

  /**
   * The registered classes, by their names: a later class appends, since codes are history.
   */
  const OperatorClass = closed.ordered(
    "OperatorClass",
    pipe(
      roster.operators,
      Arr.map((operator) => operator.class),
    ),
  );

  /**
   * How a registered operator's value arises: inline, by an immutable SQL function, or recorded, a
   * ledger fact.
   */
  const ValueSource = closed.ordered("ValueSource", ["inline", "recorded"]);

  /**
   * The names a registered contract gives its operands and its record result's fields, each once.
   */
  const ContractName = closed.ordered(
    "ContractName",
    Arr.dedupe(
      Arr.appendAll(
        pipe(
          roster.operators,
          Arr.flatMap(({ operands }) =>
            pipe(
              operands,
              Arr.map(({ name }) => name),
            ),
          ),
        ),
        pipe(
          roster.operators,
          Arr.flatMap(({ result }) =>
            result.cardinality === "record"
              ? pipe(
                  result.fields,
                  Arr.map(({ field }) => field),
                )
              : [],
          ),
        ),
      ),
    ),
  );

  /**
   * How an operand must be written beyond its type (`#registry/contract.ts`, `OperandForm`).
   */
  const OperandForm = closed.ordered("OperandForm", operandForms);

  /**
   * The base types an operand slot admits: one, or `any` (`#registry/contract.ts`, `OperandBase`).
   */
  const SlotBase = closed.ordered("SlotBase", operandBases);

  /**
   * The cardinalities an operand slot admits: one, or `any` (`#registry/contract.ts`,
   * `OperandCardinality`).
   */
  const SlotCardinality = closed.ordered("SlotCardinality", operandCardinalities);

  /**
   * Whether a record value may hold no value of a field: never, or where it is NULL (an empty
   * string is).
   */
  const FieldAbsence = closed.ordered("FieldAbsence", ["never", "null"]);

  /**
   * The `use` a rubric operand's block may have.
   */
  const RubricUse = closed.ordered("RubricUse", roster.rubricUses);

  /**
   * The machine graders at their versions, in roster order: a later version appends, and a class's
   * last is in force.
   */
  const GraderVersion = closed.ordered(
    "GraderVersion",
    pipe(
      roster.graders,
      Arr.map(({ version }) => version),
    ),
  );

  /**
   * Why an element puts its document outside this deployment's profile ({@link OutsideProfile}):
   * each a narrowing of something QTI 3.0.1 leaves open, never a breach of QTI itself, which
   * pantry's own laws judge.
   */
  const ProfileReason = closed.ordered("ProfileReason", profileReasons);

  /**
   * Each registered operator: its class's name as written in `class`, its definition URI, how its
   * value arises and how many operands it takes. Its result is one of three sidecars:
   * {@link OperatorResultValue}, {@link OperatorField}'s fields, or {@link OperatorResultOperand}.
   */
  const CustomOperator = closed.relation(
    "CustomOperator",
    {
      arity: natural,
      class: closedId(OperatorClass),
      definition: anyText,
      name: anyText,
      source: closedId(ValueSource),
    },
    ["class"],
    pipe(
      roster.operators,
      Arr.map((operator) => ({
        arity: BigInt(operator.operands.length),
        class: operator.class,
        definition: operator.definition,
        name: operator.class,
        source: operator.source,
      })),
    ),
  );

  /**
   * Each result that is a single value or a container of a base type: its cardinality and its base
   * type.
   */
  const OperatorResultValue = closed.relation(
    "OperatorResultValue",
    {
      baseType: closedId(BaseType),
      cardinality: closedId(Cardinality),
      class: closedId(OperatorClass),
    },
    ["class"],
    roster.operators.flatMap((operator) =>
      operator.result.cardinality === "record" || operator.result.cardinality === "operand"
        ? []
        : [
            {
              baseType: operator.result.baseType,
              cardinality: operator.result.cardinality,
              class: operator.class,
            },
          ],
    ),
  );

  /**
   * Each result of the type one of the operator's operands has, by that operand's name
   * (`when-present`'s `value`).
   */
  const OperatorResultOperand = closed.relation(
    "OperatorResultOperand",
    { class: closedId(OperatorClass), operand: closedId(ContractName) },
    ["class"],
    roster.operators.flatMap((operator) =>
      operator.result.cardinality === "operand"
        ? [{ class: operator.class, operand: operator.result.operand }]
        : [],
    ),
  );

  /**
   * Each operand of each registered operator: its rank from 1, the type its slot admits, and its
   * form.
   */
  const OperatorOperand = closed.relation(
    "OperatorOperand",
    {
      baseType: closedId(SlotBase),
      cardinality: closedId(SlotCardinality),
      class: closedId(OperatorClass),
      form: closedId(OperandForm),
      operand: closedId(ContractName),
      rank: natural,
    },
    ["class", "operand"],
    pipe(
      roster.operators,
      Arr.flatMap((operator) =>
        pipe(
          operator.operands,
          Arr.map((operand, index) => ({
            baseType: operand.baseType,
            cardinality: operand.cardinality,
            class: operator.class,
            form: operand.form,
            operand: operand.name,
            rank: BigInt(index + 1),
          })),
        ),
      ),
    ),
  );

  /**
   * Each field of each record result: its base type, and when a reply holds no value of it.
   */
  const OperatorField = closed.relation(
    "OperatorField",
    {
      absent: closedId(FieldAbsence),
      baseType: closedId(BaseType),
      class: closedId(OperatorClass),
      field: closedId(ContractName),
    },
    ["class", "field"],
    pipe(
      roster.operators,
      Arr.flatMap((operator) =>
        operator.result.cardinality === "record"
          ? pipe(
              operator.result.fields,
              Arr.map((field) => ({
                absent: field.absent,
                baseType: field.baseType,
                class: operator.class,
                field: field.field,
              })),
            )
          : [],
      ),
    ),
  );

  /**
   * Each rubric use as `use` writes it.
   */
  const RubricUseText = closed.relation(
    "RubricUseText",
    { lexical: anyText, use: closedId(RubricUse) },
    ["use"],
    pipe(
      roster.rubricUses,
      Arr.map((use) => ({ lexical: use, use })),
    ),
  );

  /**
   * Each machine grader at its version: the recorded class it implements, its vendor's endpoint,
   * model and parameters, and its prompt's digest.
   */
  const Grader = closed.relation(
    "Grader",
    {
      class: closedId(OperatorClass),
      effort: anyText,
      endpoint: anyText,
      maxOutputTokens: natural,
      model: anyText,
      prompt: anyText,
      vendor: anyText,
      version: closedId(GraderVersion),
    },
    ["version"],
    pipe(
      roster.graders,
      Arr.map((version) => ({
        class: version.class,
        effort: version.effort,
        endpoint: version.endpoint,
        maxOutputTokens: BigInt(version.maxOutputTokens),
        model: version.model,
        prompt: version.prompt,
        vendor: version.vendor,
        version: version.version,
      })),
    ),
  );

  /**
   * Each recorded class's grader version in force: its last, in roster order. No row is stored to
   * say so.
   */
  const InForceGrader = closed.relation(
    "InForceGrader",
    { class: closedId(OperatorClass), version: closedId(GraderVersion) },
    ["class"],
    pipe(
      roster.graders,
      Arr.filter(
        (version, index) =>
          !pipe(
            Arr.drop(roster.graders, index + 1),
            Arr.some((later: GraderVersion) => later.class === version.class),
          ),
      ),
      Arr.map((version) => ({ class: version.class, version: version.version })),
    ),
  );

  /**
   * The expression base types an operand of each registered base type may have: its own, pantry's
   * `ValueBaseOf` image, and `unknown`, the type pantry gives a value no declaration of its
   * document types (a record's field, a template's parameter), which a record-bound response's
   * `stringValue` is. `any`, `qti-null`'s, sets no bit (`ValueBaseBit`), so it fits every slot. A
   * slot of base `any` admits every expression and has no row.
   */
  const FitBase = closed.relation(
    "FitBase",
    { baseType: closedId(SlotBase), value: closedId(ValueBase) },
    ["baseType", "value"],
    pipe(
      baseTypes,
      Arr.flatMap((baseType) => [
        { baseType, value: baseType },
        { baseType, value: "unknown" as const },
      ]),
    ),
  );

  /**
   * The expression cardinality an operand of each registered cardinality may have: its own;
   * `unknown` sets no bit. A slot of cardinality `any` admits every expression and has no row.
   */
  const FitCardinality = closed.relation(
    "FitCardinality",
    { cardinality: closedId(SlotCardinality), value: closedId(ValueCardinality) },
    ["cardinality", "value"],
    operandCardinalities
      .filter((cardinality) => cardinality !== "any")
      .map((cardinality) => ({ cardinality, value: cardinality })),
  );

  /**
   * The element each written form is.
   */
  const FormKind = closed.relation(
    "FormKind",
    { form: closedId(OperandForm), kind: closedId(NodeKind) },
    ["form", "kind"],
    formKinds,
  );

  /**
   * The seed tables the primitives read, by their names.
   */
  const RegistryTable = closed.ordered(
    "RegistryTable",
    Arr.dedupe(tables.map(({ table }) => table)),
  );

  /**
   * Every key a seed table holds, each once, in seed order.
   */
  const RegistryWord = closed.ordered("RegistryWord", Arr.dedupe(tables.map(({ key }) => key)));

  /**
   * The roles a primitive reads a seed table in.
   */
  const TableRole = closed.ordered("TableRole", tableRoles);

  /**
   * Every entry of every seed table, maps' and lists' alike, with its place from 1 in its table's
   * order.
   */
  const RegistryEntry = closed.relation(
    "RegistryEntry",
    { key: closedId(RegistryWord), place: natural, table: closedId(RegistryTable) },
    ["table", "key"],
    tables.map(({ key, place, table }) => ({ key, place: BigInt(place), table })),
  );

  /**
   * Each map table's value of each of its keys: a unit's identifier, a plural's singular.
   */
  const RegistryValue = closed.relation(
    "RegistryValue",
    { key: closedId(RegistryWord), table: closedId(RegistryTable), value: anyText },
    ["table", "key"],
    tables.flatMap(({ key, table, value }) =>
      Option.match(value, { onNone: () => [], onSome: (text) => [{ key, table, value: text }] }),
    ),
  );

  /**
   * Which table each class reads in each role, at its place: a role's tables are read as their
   * union, ordered by the binding's place, then the entry's. A table stands once in a class's role,
   * so the class, the role and the table are the key, and the place is unique within the role (a
   * closed relation's key holds closed ids alone).
   */
  const RegistryBinding = closed.relation(
    "RegistryBinding",
    {
      class: closedId(OperatorClass),
      place: natural,
      role: closedId(TableRole),
      table: closedId(RegistryTable),
    },
    ["class", "role", "table"],
    bindings.map((binding) => ({
      class: binding.class,
      place: BigInt(binding.place),
      role: binding.role,
      table: binding.table,
    })),
  );

  const RegistryRoster = schema.extend(
    [qti],
    "RegistryRoster",
    [
      OperatorClass,
      ValueSource,
      ContractName,
      OperandForm,
      SlotBase,
      SlotCardinality,
      FieldAbsence,
      RubricUse,
      GraderVersion,
      ProfileReason,
      CustomOperator,
      OperatorResultValue,
      OperatorResultOperand,
      OperatorOperand,
      OperatorField,
      RubricUseText,
      Grader,
      InForceGrader,
      FitBase,
      FitCardinality,
      FormKind,
      RegistryTable,
      RegistryWord,
      TableRole,
      RegistryEntry,
      RegistryValue,
      RegistryBinding,
    ],
    [
      named(
        "Registry value entry",
        contained(on(RegistryValue, "table", "key"), on(RegistryEntry, "table", "key")),
      ),
    ],
  );

  /**
   * Each `qti-custom-operator` whose `definition` is a registered URI, by its place, with that
   * URI's class.
   */
  const operatorDefinitions = query(RegistryRoster).rule((r) => {
    const { package: pkg, path, start, value } = v(Attribute, "definition");
    const { class: operatorClass } = v(CustomOperator, "registered");

    return r
      .match(Attribute, {
        kind: "qti-custom-operator",
        name: "definition",
        package: pkg,
        path,
        start,
        value,
      })
      .match(CustomOperator, { class: operatorClass, definition: value })
      .find({ class: operatorClass, package: pkg, path, start });
  });

  /**
   * Each bound operator, by its place: its `definition` a registered URI and its `class` that URI's
   * class's name; with its class, how its value arises, the processing language it is written in,
   * and its element children's count.
   */
  const boundOperators = query(RegistryRoster).rule((r) => {
    const { class: operatorClass, package: pkg, path, start } = v(operatorDefinitions, "bound");
    const { name, source } = v(CustomOperator, "registered");
    const { elementChildren } = v(Node, "operator");
    const { language } = v(Expression, "expression");

    return r
      .match(operatorDefinitions, { class: operatorClass, package: pkg, path, start })
      .match(CustomOperator, { class: operatorClass, name, source })
      .match(Attribute, {
        kind: "qti-custom-operator",
        name: "class",
        package: pkg,
        path,
        start,
        value: name,
      })
      .match(Node, { elementChildren, package: pkg, path, start })
      .match(Expression, { language, package: pkg, path, start })
      .find({ class: operatorClass, elementChildren, language, package: pkg, path, source, start });
  });

  /**
   * Each operand slot of each bound operator: the operator's place, the slot's name, rank, type and
   * form.
   */
  const operandSlots = query(RegistryRoster).rule((r) => {
    const { class: operatorClass, package: pkg, path, start } = v(boundOperators, "bound");
    const { baseType, cardinality, form, operand, rank } = v(OperatorOperand, "slot");

    return r
      .match(boundOperators, { class: operatorClass, package: pkg, path, start })
      .match(OperatorOperand, { baseType, cardinality, class: operatorClass, form, operand, rank })
      .find({
        baseType,
        cardinality,
        class: operatorClass,
        form,
        operand,
        package: pkg,
        path,
        rank,
        start,
      });
  });

  /**
   * Each operand slot whose operand misfits under some placement of the operator's document
   * (pantry's `placedDocuments`, each with its `OperandOf` row): its type there outside the slot's
   * ({@link FitBase}, {@link FitCardinality}) where the slot's is not `any`, or its element not the
   * slot's form's ({@link FormKind}), by the operator's place and the rank: the negation of the fit
   * {@link fittedOperands} states. A document two assemblies place is typed in each, so an operand
   * that fits one and not the other misfits.
   */
  const misfitOperands = query(RegistryRoster).rule((r) => {
    const {
      baseType,
      cardinality,
      form,
      package: pkg,
      path,
      rank,
      start,
    } = v(operandSlots, "slot");
    const { baseTypeBit, cardinalityBit, start: operand } = v(OperandOf, "operand");
    const { kind } = v(Node, "operandNode");

    return r
      .match(operandSlots, { baseType, cardinality, form, package: pkg, path, rank, start })
      .match(OperandOf, {
        baseTypeBit,
        cardinalityBit,
        operator: start,
        package: pkg,
        path,
        rank,
        start: operand,
      })
      .match(Node, { kind, package: pkg, path, start: operand })
      .where(
        r.or(
          r.and(
            r.ne(baseType, "any"),
            r.eq(Bits.subset(baseTypeBit, FitBase.row(baseType)), false),
          ),
          r.and(
            r.ne(cardinality, "any"),
            r.eq(Bits.subset(cardinalityBit, FitCardinality.row(cardinality)), false),
          ),
          r.and(r.ne(form, "any"), Logic.not(FormKind.has(form, kind))),
        ),
      )
      .find({ operator: start, package: pkg, path, rank });
  });

  /**
   * Each operand slot's operand where it fits under every placement of the operator's document: the
   * operator's expression child of the slot's rank, its type fitting the slot's ({@link FitBase},
   * {@link FitCardinality}) under a placement and misfitting under none ({@link misfitOperands}),
   * its element the slot's form's ({@link FormKind}), by the operator's place and the rank, with
   * the operand's own place.
   */
  const fittedOperands = query(RegistryRoster).rule((r) => {
    const {
      baseType,
      cardinality,
      form,
      package: pkg,
      path,
      rank,
      start,
    } = v(operandSlots, "slot");
    const { baseTypeBit, cardinalityBit, start: operand } = v(OperandOf, "operand");
    const { kind } = v(Node, "operandNode");

    return r
      .match(operandSlots, { baseType, cardinality, form, package: pkg, path, rank, start })
      .match(OperandOf, {
        baseTypeBit,
        cardinalityBit,
        operator: start,
        package: pkg,
        path,
        rank,
        start: operand,
      })
      .match(Node, { kind, package: pkg, path, start: operand })
      .where(
        r.or(r.eq(baseType, "any"), r.eq(Bits.subset(baseTypeBit, FitBase.row(baseType)), true)),
        r.or(
          r.eq(cardinality, "any"),
          r.eq(Bits.subset(cardinalityBit, FitCardinality.row(cardinality)), true),
        ),
        r.or(r.eq(form, "any"), FormKind.has(form, kind)),
      )
      .where(r.not(misfitOperands, { operator: start, package: pkg, path, rank }))
      .find({ form, operand, operator: start, package: pkg, path, rank });
  });

  /**
   * Each `essay` operand that names the response an extended-text interaction of its item binds: a
   * `qti-variable` whose identifier names a response declaration of the document, which an
   * extended-text interaction's `response-identifier` binds.
   */
  const essayOperands = query(RegistryRoster).rule((r) => {
    const { operand, operator, package: pkg, path, rank } = v(fittedOperands, "fitted");
    const { identifier } = v(VariableRef, "reference");
    const { start: interaction } = v(BoundVariable, "binding");

    return r
      .match(fittedOperands, { form: "essay", operand, operator, package: pkg, path, rank })
      .match(VariableRef, {
        attribute: "identifier",
        identifier,
        package: pkg,
        path,
        start: operand,
      })
      .match(DeclarationName, {
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(BoundVariable, {
        attribute: "response-identifier",
        identifier,
        package: pkg,
        path,
        start: interaction,
      })
      .match(Node, {
        kind: "qti-extended-text-interaction",
        package: pkg,
        path,
        start: interaction,
      })
      .find({ operator, package: pkg, path, rank });
  });

  /**
   * Each `default` operand that names an outcome declaration of its document: a `qti-default` of
   * one.
   */
  const defaultOperands = query(RegistryRoster).rule((r) => {
    const { operand, operator, package: pkg, path, rank } = v(fittedOperands, "fitted");
    const { identifier } = v(VariableRef, "reference");

    return r
      .match(fittedOperands, { form: "default", operand, operator, package: pkg, path, rank })
      .match(VariableRef, {
        attribute: "identifier",
        identifier,
        package: pkg,
        path,
        start: operand,
      })
      .match(DeclarationName, {
        declarationKind: "qti-outcome-declaration",
        identifier,
        package: pkg,
        path,
      })
      .find({ operator, package: pkg, path, rank });
  });

  /**
   * Each `rubric` operand that names, by its `id`, a `qti-rubric-block` of its document whose
   * `view` is `scorer` and whose `use` is a registered rubric use: the operand's operator and rank,
   * the block's place, its id and its use. The block is the element that carries the ID the operand
   * names, read through pantry's one statement of an ID's value (`IdValue`, an `xs:ID` by its
   * SHA-256), its own attribute where it is the ID's owner.
   */
  const rubricOperands = query(RegistryRoster).rule((r) => {
    const { operand, operator, package: pkg, path, rank } = v(fittedOperands, "fitted");
    const { text } = v(Literal, "literal");
    const { start: owner } = v(IdValue, "id");
    const { value: useText } = v(Attribute, "use");
    const { use } = v(RubricUseText, "registered");

    return r
      .match(fittedOperands, { form: "rubric", operand, operator, package: pkg, path, rank })
      .match(Literal, { package: pkg, path, start: operand, text })
      .match(IdValue, { idDigest: Crypto.sha256(text), owner, package: pkg, path, start: owner })
      .match(Node, { kind: "qti-rubric-block", package: pkg, path, start: owner })
      .match(Attribute, { name: "view", package: pkg, path, start: owner, value: rubricView })
      .match(Attribute, { name: "use", package: pkg, path, start: owner, value: useText })
      .match(RubricUseText, { lexical: useText, use })
      .find({ block: owner, operator, package: pkg, path, rank, rubric: text, use });
  });

  /**
   * The operand slots of one form that no operand of its form fills, each by its operator's place.
   */
  const unfilled = (
    form: "essay" | "default" | "rubric",
    filled: typeof essayOperands | typeof defaultOperands | typeof rubricOperands,
    reason: (typeof profileReasons)[number],
  ) =>
    query(RegistryRoster).rule((r) => {
      const { package: pkg, path, rank, start } = v(operandSlots, "slot");

      return r
        .match(operandSlots, { form, package: pkg, path, rank, start })
        .where(r.not(filled, { operator: start, package: pkg, path, rank }))
        .find({ package: pkg, path, reason: ProfileReason.handle(reason), start });
    });

  /**
   * Each element that puts its document outside this deployment's profile, by its place, with why:
   * valid QTI 3.0.1 that this deployment does not grade (QTI 3.0 Conformance §3: a certified
   * application "must be able to ignore or remove the unsupported data"; §4.4, it may "leave the
   * exchangeable materials unaltered, but not implement the unsupported features"). It refuses
   * nothing: pantry admits every valid document, and the grader serves for credit only an item with
   * no row here (GRADING-SQL's gradable relation, of the delivery level), so an operator outside
   * the roster, or one whose operands its contract does not admit, never yields a silent score.
   *
   * - `unregisteredOperator`: a `qti-custom-operator` whose `definition` is unwritten or no
   *   registered URI (ASI Table 5.37.2 makes it [0..1]; the profile reads an operator by it
   *   alone).
   * - `operatorClass`: one whose `class` is unwritten or not its definition's class's name, compared
   *   case-sensitively (Table 5.37.1; §7.16, "They are always compared case-sensitively").
   * - `operatorArity`: one whose element children are not exactly its class's operands (Table 5.37.5
   *   admits foreign children beside them, which no registered class reads).
   * - `operatorAttribute`: one that writes an attribute of another namespace (Table 5.37.3,
   *   "sub-classes may add any number of characteristics of their own", which no registered class
   *   reads).
   * - `operandType`: an operand slot of its class whose operand, the expression of its rank, is
   *   missing, or under some placement of its document of a type the slot does not admit (its base
   *   type the slot's, or `unknown` or `any`, or any where the slot's is `any`; its cardinality the
   *   slot's, or `unknown`, or any where the slot's is `any`), or written otherwise than the slot's
   *   form.
   * - `essayOperand`, `defaultOperand`, `rubricOperand`: an operand of that form that names no
   *   response an extended-text interaction of its item binds, no outcome declaration, or no scorer
   *   rubric block of a registered use.
   * - `literalOperand`: a literal operand written as a `qti-multiple` or `qti-ordered` with a member
   *   that is no `qti-base-value`, so the operand is no fact of the content.
   * - `recordedPlacement`: a recorded class outside response processing, where no attempt's response
   *   exists.
   *
   * A portable custom interaction is in the profile: its module is a file of its own package, which
   * the delivery level's "Module held" holds at its publish (`#ledger/module-held.ts`), not a
   * registered extension.
   */
  const OutsideProfile = derived(
    "OutsideProfile",
    query(RegistryRoster)
      .rule((r) => {
        const { package: pkg, path, start } = v(Node, "operator");

        return r
          .match(Node, { kind: "qti-custom-operator", package: pkg, path, start })
          .where(r.not(operatorDefinitions, { package: pkg, path, start }))
          .find({
            package: pkg,
            path,
            reason: ProfileReason.handle("unregisteredOperator"),
            start,
          });
      })
      .rule((r) => {
        const { package: pkg, path, start } = v(operatorDefinitions, "registered");

        return r
          .match(operatorDefinitions, { package: pkg, path, start })
          .where(r.not(boundOperators, { package: pkg, path, start }))
          .find({ package: pkg, path, reason: ProfileReason.handle("operatorClass"), start });
      })
      .rule((r) => {
        const {
          class: operatorClass,
          elementChildren,
          package: pkg,
          path,
          start,
        } = v(boundOperators, "bound");

        return r
          .match(boundOperators, {
            class: operatorClass,
            elementChildren,
            package: pkg,
            path,
            start,
          })
          .where(r.ne(elementChildren, CustomOperator.at("arity", operatorClass)))
          .find({ package: pkg, path, reason: ProfileReason.handle("operatorArity"), start });
      })
      .rule((r) => {
        const { package: pkg, path, start } = v(OpenAttribute, "attribute");

        return r
          .match(OpenAttribute, { kind: "qti-custom-operator", package: pkg, path, start })
          .find({ package: pkg, path, reason: ProfileReason.handle("operatorAttribute"), start });
      })
      .rule((r) => {
        const { operator: start, package: pkg, path, rank } = v(misfitOperands, "misfit");

        return r
          .match(misfitOperands, { operator: start, package: pkg, path, rank })
          .find({ package: pkg, path, reason: ProfileReason.handle("operandType"), start });
      })
      .rule((r) => {
        const { package: pkg, path, rank, start } = v(operandSlots, "slot");

        return r
          .match(operandSlots, { package: pkg, path, rank, start })
          .where(r.not(OperandOf, { operator: start, package: pkg, path, rank }))
          .find({ package: pkg, path, reason: ProfileReason.handle("operandType"), start });
      })
      .rule((r) => {
        const {
          package: pkg,
          path,
          reason,
          start,
        } = v(unfilled("essay", essayOperands, "essayOperand"), "essay");

        return r
          .match(unfilled("essay", essayOperands, "essayOperand"), {
            package: pkg,
            path,
            reason,
            start,
          })
          .find({ package: pkg, path, reason, start });
      })
      .rule((r) => {
        const {
          package: pkg,
          path,
          reason,
          start,
        } = v(unfilled("default", defaultOperands, "defaultOperand"), "default");

        return r
          .match(unfilled("default", defaultOperands, "defaultOperand"), {
            package: pkg,
            path,
            reason,
            start,
          })
          .find({ package: pkg, path, reason, start });
      })
      .rule((r) => {
        const {
          package: pkg,
          path,
          reason,
          start,
        } = v(unfilled("rubric", rubricOperands, "rubricOperand"), "rubric");

        return r
          .match(unfilled("rubric", rubricOperands, "rubricOperand"), {
            package: pkg,
            path,
            reason,
            start,
          })
          .find({ package: pkg, path, reason, start });
      })
      .rule((r) => {
        const { operand, operator, package: pkg, path } = v(fittedOperands, "fitted");
        const { kind, start: member } = v(Node, "member");

        return r
          .match(fittedOperands, { form: "literal", operand, operator, package: pkg, path })
          .match(Node, { kind, package: pkg, parent: operand, path, start: member })
          .match(Expression, { package: pkg, path, start: member })
          .where(r.ne(kind, "qti-base-value"))
          .find({
            package: pkg,
            path,
            reason: ProfileReason.handle("literalOperand"),
            start: operator,
          });
      })
      .rule((r) => {
        const { language, package: pkg, path, start } = v(boundOperators, "bound");

        return r
          .match(boundOperators, { language, package: pkg, path, source: "recorded", start })
          .where(r.ne(language, "response"))
          .find({ package: pkg, path, reason: ProfileReason.handle("recordedPlacement"), start });
      }),
  );

  /**
   * Each bound operator, by its place ({@link boundOperators}): what the grader dispatches on, the
   * operator's class, whose arm evaluates it, and how its value arises; a program's walk reads its
   * custom operators' classes here by key (`#ledger/walks.ts`), so it is stored. An operator of a
   * document outside the profile is bound too; the grader serves no such item for credit ({@link
   * OutsideProfile}).
   */
  const BoundOperator = derived.stored("BoundOperator", boundOperators);

  /**
   * Each application of a recorded class in an item, by its package, its item's document (`path`,
   * the identity the ledger keys an attempt by, SPEC-AUDIT SV-KEY-01) and the operator's place in
   * that document: what a ledger fact of an attempt names.
   */
  const RecordedApplication = derived.stored(
    "RecordedApplication",
    query(RegistryRoster).rule((r) => {
      const { class: operatorClass, package: pkg, path, start } = v(boundOperators, "bound");

      return r
        .match(boundOperators, {
          class: operatorClass,
          package: pkg,
          path,
          source: "recorded",
          start,
        })
        .find({ class: operatorClass, package: pkg, path, start });
    }),
  );

  /**
   * The `rubric-score` grader each item configures, by its natural key, its document and the `id`
   * of the scorer rubric block its applications name (primer's `content_free_response_graders`,
   * keyed by content, never by a minted id): the block's place and use, and the grader version in
   * force, with its model and the SHA-256 of its prompt. The rest of a request is the item's own
   * content (its interaction's prompt, its stimuli, its MAXSCORE) and the attempt's response, so
   * nothing here is stored: a grader version appended to the roster is in force for every item at
   * once, and each fact names the grader version that produced it.
   */
  const RubricGrader = derived(
    "RubricGrader",
    query(RegistryRoster).rule((r) => {
      const { block, operator, package: pkg, path, rubric, use } = v(rubricOperands, "rubric");
      const { class: operatorClass } = v(boundOperators, "bound");
      const { version } = v(InForceGrader, "inForce");
      const { model, prompt } = v(Grader, "registered");

      return r
        .match(rubricOperands, { block, operator, package: pkg, path, rubric, use })
        .match(boundOperators, { class: operatorClass, package: pkg, path, start: operator })
        .match(InForceGrader, { class: operatorClass, version })
        .match(Grader, { model, prompt, version })
        .find({ block, grader: version, model, package: pkg, path, prompt, rubric, use });
    }),
  );

  /**
   * Each `rubric-score` application of an item, by its package, its item's document and the
   * operator's place there, with the rubric group it scores: the `id` of the scorer rubric block
   * its rubric operand names ({@link rubricOperands}, never restated). An item's applications that
   * name one rubric are one group, the group a person's value answers (the ledger's
   * `HumanOperatorValue`) when every application of it declined.
   */
  const RubricApplication = derived.stored(
    "RubricApplication",
    query(RegistryRoster).rule((r) => {
      const { operator, package: pkg, path, rubric } = v(rubricOperands, "rubric");

      return r
        .match(rubricOperands, { operator, package: pkg, path, rubric })
        .find({ package: pkg, path, rubric, start: operator });
    }),
  );

  /**
   * Each recorded application's `essay` operand, by its package, its item's document, the
   * operator's place there and the response the operand names (an {@link essayOperands} operand's
   * `qti-variable`, its conditions never restated): the response whose value the application's
   * request reads, so an attempt that leaves it NULL makes no request of it (`rubric-score`,
   * `#registry/operators.ts`: "NULL iff the response is NULL (no request is made)"), which the
   * Delivery level's `PendingApplication` reads.
   */
  const ApplicationResponse = derived(
    "ApplicationResponse",
    query(RegistryRoster).rule((r) => {
      const { operator, package: pkg, path, rank } = v(essayOperands, "essay");
      const { operand } = v(fittedOperands, "essayOperand");
      const { identifier } = v(VariableRef, "essayReference");

      return r
        .match(essayOperands, { operator, package: pkg, path, rank })
        .match(fittedOperands, { form: "essay", operand, operator, package: pkg, path, rank })
        .match(VariableRef, {
          attribute: "identifier",
          identifier,
          package: pkg,
          path,
          start: operand,
        })
        .match(boundOperators, { package: pkg, path, source: "recorded", start: operator })
        .find({ identifier, package: pkg, path, start: operator });
    }),
  );

  /**
   * Each bound operator's `default` operands, by its package, its item's document, the operator's
   * place and the operand's rank (its class's slot, `OperatorOperand`), with the outcome each names
   * (a {@link defaultOperands} operand's `qti-default`, its conditions never restated): what an
   * evaluator's request reads as the operand's value, the outcome's default in force.
   */
  const ApplicationDefault = derived.stored(
    "ApplicationDefault",
    query(RegistryRoster).rule((r) => {
      const { operator, package: pkg, path, rank } = v(defaultOperands, "default");
      const { operand } = v(fittedOperands, "defaultOperand");
      const { identifier } = v(VariableRef, "defaultReference");

      return r
        .match(defaultOperands, { operator, package: pkg, path, rank })
        .match(fittedOperands, { form: "default", operand, operator, package: pkg, path, rank })
        .match(VariableRef, {
          attribute: "identifier",
          identifier,
          package: pkg,
          path,
          start: operand,
        })
        .find({ identifier, operator, package: pkg, path, rank });
    }),
  );

  /**
   * Each bound operator's `literal` operands written as a `qti-base-value`, by the operator's place
   * and the operand's rank, with the value's text, pantry's `Literal`, which its base type's
   * lexical space holds (a `qti-null` literal has no row: NULL). A literal is a fact of the
   * content, so it is read here once, never per attempt.
   */
  const ApplicationLiteral = derived(
    "ApplicationLiteral",
    query(RegistryRoster).rule((r) => {
      const { operand, operator, package: pkg, path, rank } = v(fittedOperands, "literalOperand");
      const { text } = v(Literal, "literalText");

      return r
        .match(fittedOperands, { form: "literal", operand, operator, package: pkg, path, rank })
        .match(Literal, { package: pkg, path, start: operand, text })
        .find({ operator, package: pkg, path, rank, text });
    }),
  );

  const Registry = schema.extend(
    [RegistryRoster],
    "Registry",
    [
      OutsideProfile,
      BoundOperator,
      RecordedApplication,
      RubricGrader,
      RubricApplication,
      ApplicationResponse,
      ApplicationDefault,
      ApplicationLiteral,
    ],
    [],
  );

  return { Registry, RegistryRoster };
};

/**
 * The registry level, the level the ledger is built over.
 */
export type RegistryLevel = ReturnType<typeof registryOf>["Registry"];
