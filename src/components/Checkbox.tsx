import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
} from "react-aria-components";

import styles from "./checkbox.module.scss";

function Checkbox({ children, ...props }: CheckboxFieldProps) {
  return (
    <CheckboxField {...props}>
      <CheckboxButton className={styles.checkboxButton}>
        {({ isIndeterminate }) => (
          <>
            <div className={styles.indicator}>
              <svg
                viewBox="0 0 18 18"
                aria-hidden="true"
                key={isIndeterminate ? "indeterminate" : "check"}
              >
                {isIndeterminate ? (
                  <rect x={1} y={7.5} width={16} height={3} />
                ) : (
                  <polyline points="2 9 7 14 16 4" />
                )}
              </svg>
            </div>
            {children}
          </>
        )}
      </CheckboxButton>
    </CheckboxField>
  );
}

export default Checkbox;