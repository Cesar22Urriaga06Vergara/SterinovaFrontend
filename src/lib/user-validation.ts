export type UserFormErrors = Partial<
  Record<"nombre" | "email" | "email_contacto" | "password", string>
>;

type UserFormValues = {
  nombre: string;
  email: string;
  email_contacto?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 10;

export function getPasswordValidationError(password: string): string {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return "";
}

export function validateUserForm(
  form: UserFormValues,
  editing: boolean,
): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!form.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio.";
  }

  const email = form.email.trim();
  if (!email) {
    errors.email = "El correo de acceso es obligatorio.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Ingresa un correo de acceso válido.";
  }

  const contactEmail = form.email_contacto?.trim() ?? "";
  if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) {
    errors.email_contacto = "Ingresa un correo de contacto válido.";
  }

  if (!editing) {
    const passwordError = getPasswordValidationError(form.password ?? "");
    if (passwordError) errors.password = passwordError;
  }

  return errors;
}
