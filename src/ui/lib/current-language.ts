export const getCurrentLanguage = () => {
  const savedLanguage = localStorage.getItem("language");
  const bodyDirection = document.body.dir;

  if (savedLanguage) {
    return savedLanguage === "ar" ? "ar" : "en";
  }

  return bodyDirection === "rtl" ? "ar" : "en";
};
