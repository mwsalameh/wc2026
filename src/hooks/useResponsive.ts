import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  return {
    isSmallPhone: width < 375,
    isTablet: width >= 768,
    screenWidth: width,
    screenHeight: height,
  };
};
