import { useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { generateRangeDatesFromYearStart } from "../utils/generate-dates-from-year-beginning";
import { api } from "../lib/axios";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";

type SummaryProps = Array<{
  id: string;
  date: string;
  amount: number;
  completed: number;
}>;

const WeekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const datesFromYearBeginning = generateRangeDatesFromYearStart();
const minimumSummaryDatesSizes = 18 * 5;
const amountOfDaysToFill =
  minimumSummaryDatesSizes - datesFromYearBeginning.length;

export function Home() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryProps | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get("/summary");
      setSummary(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />
      <View className="flex-row mt-6 mb-2">
        {WeekDays.map((day, index) => {
          return (
            <Text
              className="text-zinc-400 text-xl font-bold text-center mx-1"
              key={`${day}-${index}`}
              style={{
                width: DAY_SIZE,
              }}
            >
              {day}
            </Text>
          );
        })}
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearBeginning.map((date) => {
              const dayWithHabits = summary.find((day) => {
                return dayjs(date).isSame(day.date, "day");
              });
              return (
                <>
                  <HabitDay
                    onPress={() => {
                      navigate("habit", {
                        date: date.toISOString(),
                      });
                    }}
                    date={date}
                    amountOfHabits={dayWithHabits?.amount}
                    amountCompleted={dayWithHabits?.completed}
                    key={date.toISOString()}
                  />
                </>
              );
            })}
            {amountOfDaysToFill > 0 &&
              Array.from({
                length: amountOfDaysToFill,
              }).map((_, index) => (
                <View
                  key={index}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                  style={{
                    width: DAY_SIZE,
                    height: DAY_SIZE,
                  }}
                ></View>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
