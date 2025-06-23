import { localize } from "./utils";

export const loginError = (locale: string) => {
  return new Error(
    localize(locale)("Vous devez être identifié", "You must be logged in"),
  );
};

export const bookError = (locale: string) => {
  return new Error(
    localize(locale)(
      "Vous devez sélectionner un livre",
      "You must select a book",
    ),
  );
};

export const noteError = (locale: string) => {
  return new Error(
    localize(locale)(
      "Vous devez sélectionner une citation",
      "You must select a quote",
    ),
  );
};

export const commentError = (locale: string) => {
  return new Error(
    localize(locale)(
      "Vous devez sélectionner un commentaire",
      "You must select a comment",
    ),
  );
};
