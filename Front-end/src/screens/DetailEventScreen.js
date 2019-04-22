import React from 'react';
import { StyleSheet, Text, View, Button, Share } from 'react-native';

export default class DetailEventScreen extends React.Component {
  static navigationOptions = {
    title: 'Details',
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
      color: 'white',
    },
    headerStyle: {
      backgroundColor: '#39CA74',
    },
  };

  render() {
    return (
      <View style={styles.container}>
        <Button
          title = "test share"
          onPress ={() => Share.share({
            message: 'Event',
            url: 'Deep link',
            title: 'Come to our event!'
          })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
