import tw from "tailwind-react-native-classnames";
import {
  atom,
  RecoilRoot,
  useRecoilState,
  useSetRecoilState,
  useRecoilValue,
  DefaultValue,
  useRecoilValueLoadable,
} from "recoil";
import React, { useState } from "react";
import { View, Text, FlatList } from "react-native";
import Constants from "expo-constants";
import { TextInput, Button, Checkbox } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AsyncStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    setSelf(
      AsyncStorage.getItem(key).then(
        (savedValue) =>
          savedValue != null ? JSON.parse(savedValue) : new DefaultValue() // Abort initialization if no value was stored
      )
    );

    onSet((newValue) => {
      AsyncStorage.setItem(key, JSON.stringify(newValue));
    });
  };

const todosAtom = atom({
  key: "todos",
  default: [
    { id: 1, title: "제목1", checked: false },
    { id: 2, title: "제목2", checked: false },
    { id: 3, title: "제목3", checked: false },
  ],
  effects_UNSTABLE: [AsyncStorageEffect("todos")],
});

export default function App() {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<Text>Loading</Text>}>
        <Main />
      </React.Suspense>
    </RecoilRoot>
  );
}

const NewTodoForm = () => {
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [todos, setTodos] = useRecoilState(todosAtom);

  return (
    <View style={tw`flex flex-row px-3 mt-3`}>
      <TextInput
        value={newTodoTitle}
        onChangeText={(text) => setNewTodoTitle(text)}
        placeholder="할일을 입력해주세요.!!"
        style={tw`flex-grow`}
        right={<TextInput.Affix text="/100" />}
      />
      <Button
        onPress={() => {
          setTodos([
            ...todos,
            { id: todos.length + 1, title: newTodoTitle, checked: false },
          ]);
          setNewTodoTitle("");
        }}
        style={tw`ml-2 flex justify-center`}
        mode="contained"
      >
        추가
      </Button>
    </View>
  );
};

const TodoList = () => {
  const [todos, setTodos] = useRecoilState(todosAtom);

  return (
    <FlatList
      data={todos}
      keyExtractor={(todo) => todo.id.toString()}
      renderItem={({ item }) => (
        <View style={tw`p-3 flex-row items-center`}>
          <Checkbox
            status={item.checked ? "checked" : "unchecked"}
            value={item}
            onPress={() => {
              setTodos(
                todos.map((_todo) =>
                  _todo.id != item.id
                    ? _todo
                    : { ..._todo, checked: !_todo.checked }
                )
              );
            }}
          />
          <Text style={tw`w-10 ml-2`}>{item.id}</Text>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
};

const Main = () => {
  return (
    <View
      style={tw.style("flex-grow", {
        paddingTop: Constants.statusBarHeight,
      })}
    >
      <NewTodoForm />
      <TodoList />
    </View>
  );
};
