export type FormTabParamList = {
  Blt: undefined;
  Save: undefined;
};

export type RootStackParamList = {
  'map-tracker/form/form': { screen: keyof FormTabParamList; params?: object } | undefined;
};