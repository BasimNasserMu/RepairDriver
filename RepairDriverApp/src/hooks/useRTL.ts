import { I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export function useRTL() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  }, [isRTL]);

  return { isRTL };
}
