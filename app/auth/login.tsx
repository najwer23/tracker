import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/spinner/Spinner";
import { queryLogin } from "@/api/login.query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/navigation/Navigation.types";

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();

  const { mutate, isPending, isError, data, error } = useMutation({
    mutationKey: ["queryLogin", "queryLogin"],
    mutationFn: queryLogin,
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  useEffect(() => {
    if (data?.code === "OK") {
      if (redirectTo == "map-tracker") {
        router.replace("/auth/login");
        router.replace("/map-tracker/form/form");
      } else {
        router.push("/");
      }
    }
  }, [data, router]);

  if (isPending) {
    return <Spinner />;
  }

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        defaultValue={"najwer23@gmail.com"}
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            style={[styles.input, errors.email && styles.errorInput]}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && typeof errors.email.message === "string" && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="pass"
        defaultValue={"1"}
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Password"
            style={[styles.input, errors.pass && styles.errorInput]}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.pass && typeof errors.pass.message === "string" && (
        <Text style={styles.errorText}>{errors.pass.message}</Text>
      )}

      <View style={{ width: "100%", height: 70 }}>
        <Button title="Login" onPress={handleSubmit(onSubmit)} />
      </View>

      {isError && (
        <Text style={styles.errorText}>
          The login is not correct or the user does not exist in the database!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    color: "black",
    width: "100%", // make inputs full width inside container
  },
  errorInput: {
    borderColor: "red",
    marginBottom: 0,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    alignSelf: "flex-start", // align error text to left, not center
  },
});
