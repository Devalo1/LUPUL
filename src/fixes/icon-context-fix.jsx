// Acest fișier oferă o soluție alternativă pentru problema 'Cannot access e before initialization'
// din react-icons/iconContext.mjs

/**
 * Această soluție implică pre-încărcarea pachetelor de iconuri pentru a evita
 * inițializarea tardivă care cauzează eroarea în producție
 */
import { IconContext } from "react-icons";

// Exportăm contextul de iconuri pentru a forța încărcarea lui înainte de utilizare
export const IconProvider = IconContext.Provider;

// Exportăm valori implicite pentru IconContext
export const defaultIconContext = {
  color: "currentColor",
  size: "1em",
  className: "",
  style: {},
  attr: {}
};

// Wrapper pentru a utiliza în aplicație
export function withIconContext(Component, contextValue = defaultIconContext) {
  return function IconWrappedComponent(props) {
    return (
      <IconProvider value={contextValue}>
        <Component {...props} />
      </IconProvider>
    );
  };
}

export default IconContext;
