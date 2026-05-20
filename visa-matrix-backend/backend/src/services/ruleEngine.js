const SUPPORTED_OPERATORS = new Set([
  ">",
  ">=",
  "<",
  "<=",
  "=",
  "!=",
  "includes",
]);

const getRuleField = (rule) => {
  return rule.field ?? rule.field_name ?? rule.application_field;
};

const getApplicationValue = (application, field) => {
  if (!field) {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(application, field)) {
    return application[field];
  }

  return field.split(".").reduce((value, key) => value?.[key], application);
};

const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeComparableValues = (applicationValue, ruleValue) => {
  const applicationNumber = toNumber(applicationValue);
  const ruleNumber = toNumber(ruleValue);

  if (applicationNumber !== null && ruleNumber !== null) {
    return [applicationNumber, ruleNumber];
  }

  return [String(applicationValue ?? ""), String(ruleValue ?? "")];
};

const compareValues = (applicationValue, operator, ruleValue) => {
  if (!SUPPORTED_OPERATORS.has(operator)) {
    return false;
  }

  if (operator === "includes") {
    if (Array.isArray(applicationValue)) {
      return applicationValue?.includes(ruleValue) ?? false;
    }

    return applicationValue?.toString?.().includes(String(ruleValue)) ?? false;
  }

  const [left, right] = normalizeComparableValues(applicationValue, ruleValue);

  switch (operator) {
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "=":
      return left === right;
    case "!=":
      return left !== right;
    default:
      return false;
  }
};

const getRuleMessage = (rule, field, operator, value) => {
  return (
    rule.message ??
    rule.error_message ??
    rule.warning_message ??
    `${field || "Field"} must satisfy rule: ${operator} ${value ?? ""}`.trim()
  );
};

const getRiskScore = (errors, warnings) => {
  return Math.max(0, 100 - errors.length * 20 - warnings.length * 10);
};

const getDecision = (riskScore) => {
  if (riskScore > 80) {
    return "APPROVE";
  }

  if (riskScore >= 50) {
    return "REVIEW";
  }

  return "HIGH_RISK";
};

const getApprovalProbability = (risk_score) => {
  if (risk_score >= 80) return 90;
  if (risk_score >= 60) return 70;
  if (risk_score >= 40) return 50;
  if (risk_score >= 20) return 30;
  return 10;
};

const generateSuggestion = (error) => {
  const e = error.toLowerCase();

  const suggestionMap = [
    {
      keywords: ["bank balance"],
      suggestion:
        "Increase your bank balance and maintain consistency for at least 3-6 months.",
    },
    {
      keywords: ["passport valid"],
      suggestion: "Renew your passport to ensure at least 6 months validity.",
    },
    {
      keywords: ["blank pages"],
      suggestion: "Ensure your passport has at least 2 blank pages.",
    },
    {
      keywords: ["travel history"],
      suggestion: "Build travel history by visiting 1-2 countries before applying.",
    },
    {
      keywords: ["employment"],
      suggestion: "Provide strong employment or financial proof.",
    },
    {
      keywords: ["itr"],
      suggestion: "Submit ITR documents for the last 3 years.",
    },
    {
      keywords: ["bank statement"],
      suggestion: "Maintain a stable bank statement for at least 6 months.",
    },
  ];

  for (const rule of suggestionMap) {
    if (rule.keywords.some((keyword) => e.includes(keyword))) {
      return rule.suggestion;
    }
  }

  return `Resolve: ${error}`;
};

export const evaluateRules = (application, rules = []) => {
  const result = {
    errors: [],
    warnings: [],
  };

  for (const rule of rules ?? []) {
    const field = getRuleField(rule);
    const operator = rule.operator;
    const ruleValue = rule.value;
    const applicationValue = getApplicationValue(application, field);
    const passed = compareValues(applicationValue, operator, ruleValue);

    if (passed) {
      continue;
    }

    const severity = String(rule.severity ?? "error").toLowerCase();
    const message = getRuleMessage(rule, field, operator, ruleValue);

    if (severity === "warning") {
      result.warnings.push(message);
      continue;
    }

    result.errors.push(message);
  }

  const errors = result.errors;
  const warnings = result.warnings;
  const risk_score = getRiskScore(errors, warnings);
  const decision = getDecision(risk_score);
  const approval_probability = getApprovalProbability(risk_score);
  const suggestions = errors.map((error) => generateSuggestion(error));

  return {
    errors,
    warnings,
    risk_score,
    decision,
    approval_probability,
    suggestions,
  };
};

export default evaluateRules;
