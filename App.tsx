import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, SetStateAction } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsExports from './src/aws-exports';

import { createTodo } from './src/graphql/mutations';
import { listTodos } from './src/graphql/queries';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

Amplify.configure(awsExports);

const initialState = { name:'', description: ''}

export default function App() {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([]);

  const setInput = (key:any, value:any):any => {
    setFormState({ ...formState, [key]: value})
  }

  const fetchTodos = async(): Promise<any> => {
    try {
      
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items;
      setTodos(todos)
    } catch (error) {
      console.log('error fetching todos')
    }
  }

  const addTodo = async(): Promise<any> => {
    try {
      if(!formState.name || !formState.description)
      return; 
        const todo = { ...formState }
        setTodos([ ...todos, todo] as SetStateAction<never[]>)
        setFormState(initialState)
        await API.graphql(graphqlOperation(createTodo, {
          input: todo }))
    } catch (error) {
      console.log('error creating todo:', error)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <View style={styles.container}>
      <h2>Amplify Todos</h2>
      <TextInput 
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={formState.name}
        placeholder='Name'
      />
      <TextInput 
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={formState.description}
        placeholder='Description'
      />

      <Button 
        style={styles.button} 
        title='Create Todo' 
        onPress={addTodo} 
      />

      {
        todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{todo.description}</Text>
          </View>
        ))
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 20,
  },
  todo: {  
    marginBottom: 15 
  },
  input: { 
    border: 'none', 
    backgroundColor: '#ddd', 
    marginBottom: 10, 
    padding: 8, 
    fontSize: 18 
  },
  todoName: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  todoDescription: { 
    marginBottom: 0 
  },
  button: { 
    backgroundColor: 'black', 
    color: 'white',  
    outline: 'none', 
    fontSize: 18, 
    padding: '12px 0px' 
  }
});
