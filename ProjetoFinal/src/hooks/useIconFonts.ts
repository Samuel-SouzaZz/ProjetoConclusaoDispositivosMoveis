import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export const useIconFonts = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialIcons.font,
          ...FontAwesome5.font,
        });
      } catch (error) {
        console.warn("Falha ao carregar fontes de ícones", error);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };

    loadFonts();

    return () => {
      mounted = false;
    };
  }, []);

  return ready;
};

