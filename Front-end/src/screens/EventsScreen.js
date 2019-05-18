import React from "react";
import {
  AsyncStorage,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Share,
  TouchableOpacity,
  TouchableHighlight,
  Modal
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { format } from "date-fns";
//import Modal from 'react-native-modal';
import moment from "moment";

export default class EventsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const{ params } = navigation.state;

    return {
      title: "Events",
      headerTintColor: "white",
      headerTitleStyle: {
        fontWeight: "bold",
        color: "white"
      },
      headerStyle: {
        backgroundColor: "#39CA74"
      },
      headerRight: (
        <Icon
          name='share-alt'
          type='font-awesome'
          color='#fff'
          iconStyle={{ marginRight: 15 }} 
          onPress={() => params.handleModal() }
        />
        )
    }
  };
  

  constructor(props) {
    super(props);

    this.state = {
      eventsData: [],
      categoricalData: [],
      isLoading: false,
      error: null
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true, isModalVisible: false });
    
    this.props.navigation.setParams({ handleModal: this.toggleModal})

    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      try {
        let response = await fetch(
          "http://ec2-54-183-219-162.us-west-1.compute.amazonaws.com:3000/events",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: token
            }
          }
        );

        let response2 = await fetch(
          "http://ec2-54-183-219-162.us-west-1.compute.amazonaws.com:3000/categories",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: token
            }
          }
        );

        response.json().then(result => {
          this.setState({ eventsData: result.data });
          console.log(this.state.eventsData);
        });

        response2.json().then(result => {
          this.setState({ categoricalData: result.data, isLoading: true });
          console.log(this.state.categoricalData);
        });

      } catch (error) {
        this.setState({ response: error });
        console.log(error);
      }
    } catch (e) {
      console.log("AsyncStorage failed to retrieve token:", e);
    }
  }

  toggleModal = () => {
    this.setState((state) => {
      return { isModalVisible: !state.isModalVisible }
    });
  }

  onAddCalendarEvent = async item => {
    try {
      //Prompt the user to provide access to the calendar
      const { status } = await Permissions.askAsync(Permissions.CALENDAR);

      //If permission was granted, create the event
      if (status === "granted") {
        var dateString = item.StartDate.substring(0, 10);

        console.log(dateString + "T" + item.StartTime);
        console.log(dateString + "T" + item.EndTime);

        var eventID = await Calendar.createEventAsync(Calendar.DEFAULT, {
          title: item.Name,
          startDate: new Date(dateString + "T" + item.StartTime),
          endDate: new Date(dateString + "T" + item.EndTime),
          timeZone: Localization.timeZone,
          location: item.LocationName,
          alarms: [{ relativeOffset: -1440 }]
        })
          .then(event => {
            console.log("Created event");
            alert("Event created");
          })
          .catch(error => {
            console.log("Problem creating event: ", error);
            alert("Event could not be created");
          });
      } else {
        //If the user denies permission to edit the calendar, notify the user that they can't create an event
        alert("You must provide access to your calendar to create an event");
        console.log("Permission to edit the calendar was denied");
      }
    } catch (error) {
      console.log(error);
    }
  };

  filterCategories = async (id) => {
    console.log(id)
    try {
      const token = await AsyncStorage.getItem("userToken");
      try {
        let response = await fetch(
          `http://ec2-54-183-219-162.us-west-1.compute.amazonaws.com:3000/events/filter/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: token
            }
          }
        );
        
        response.json().then(result => {
          console.log('hey');
          this.setState({ eventsData: result.events });
          this.toggleModal();
          console.log(result);
        });
      } catch (error ) {
        console.log(error);
      }
    } catch {
      console.log(error)
    }

  }

  _renderHeader = () => {
    return (
      <View style = {styles.flatHeaderContainer} >
        <Text style={styles.flatHeader}>Categories</Text>
      </View> 
    );
  }

  _renderCategories = item => {
    return (
      <TouchableOpacity
        style={styles.catContainer}
        key={item}
        onPress={() => this.filterCategories(item.id)}
        activeOpacity={0.8}
      >
        <View>
            <Image
              source={{uri:"http://"+item.Image}}
              style={styles.imageCatEx}
            />
            <Text style={styles.catNames}>
              {item.Name}
            </Text>
        </View>
      </TouchableOpacity>
    )
  }

  _renderEvents = item => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        key={item}
        onPress={() => this.props.navigation.navigate("detailEvent", { item })}
        activeOpacity={0.8}
      >
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Image
            //source={require("../img/sample_image.jpg")}
            source= {{uri:"http://"+item.Image}}
            style={styles.imageEx}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.titleStyling}>{item.Name}</Text>
            <Text style={{ color: "#333" }}>
              {moment.utc(item.StartDate).format("MMMM DD")}
              {" | "}
              {format("January 01, 2019 " + item.StartTime, "hh:mm a")}
            </Text>
            <Text style={{ color: "#333" }}>{item.LocationName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { eventsData, isLoading, isModalVisible, categoricalData } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <FlatList
            data={eventsData}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => this._renderEvents(item)}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <View style={{ position: "absolute", right: 10, bottom: 30 }}>
          <Button
            title="+"
            titleStyle={{ fontSize: 28 }}
            containerStyle={{}}
            buttonStyle={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#463077"
            }}
            onPress={() => this.props.navigation.navigate("createEvent")}
          />
        </View>
        <Modal animationType="slide"
        transparent={false}
        visible={isModalVisible}
        >
          <View style = {styles.flatListCat}>
            <FlatList
              data={categoricalData}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => this._renderCategories(item)}
              keyExtractor={(item, index) => index.toString()}
              numColumns = {2}
              horizontal = {false}
              directionalLockEnabled = {true}
              ListHeaderComponent={this._renderHeader}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
  },
  flatListCat: {
    backgroundColor: "#f8f8f8",
    justifyContent: 'center',
    alignItems: 'center'
  },
  catNames: {
    textAlign: "center"
  },
  imageEx: {
    width: 150,
    height: 120
  },
  imageCatEx: {
    width: 190,
    height: 130
  },
  buttonContainerStyle: {
    marginTop: 20,
    marginBottom: 30,
    marginLeft: 40
  },
  titleStyling: {
    fontFamily: "Verdana",
    fontSize: 18
  },
  buttonStyling: {
    width: 60,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#39CA74"
  },
  flatHeader: {
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    fontFamily: "Verdana",
    fontSize: 20
  },
  flatHeaderContainer: {
    borderColor: 'lightgrey',
    borderWidth: 1,
    margin: 10,
    height: 50,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 5,
    position: "relative",
    shadowOffset: { width: 3, height: 3 },
    shadowColor: "black",
    shadowOpacity: 0.1
  },
  catContainer: {
    width: 185,
    height: 150,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 5,
    borderColor: "lightgrey",
    position: "relative",
    shadowOffset: { width: 3, height: 3 },
    shadowColor: "black",
    shadowOpacity: 0.1
  },
  cardContainer: {
    flex: 1,
    borderColor: 'lightgrey',
    borderWidth: 1,
    margin: 10,
    height: 150,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 5,
    position: "relative",
    shadowOffset: { width: 3, height: 3 },
    shadowColor: "black",
    shadowOpacity: 0.1
  }
});
