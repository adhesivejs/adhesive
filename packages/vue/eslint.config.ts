import base from "../../eslint.config.js";

export default base.append({
  rules: {
    "vue/no-undef-directives": "off",
  },
});
