import { View , StyleSheet} from "react-native";
import { useDrawerViewModel } from '../../ModelView/DrawerViewModel';

const UserProfile =()=>{
    const { user } = useDrawerViewModel();
return(
 

   
      <View style={styles.userProfile}>
        <Image
          source={{ uri: user?.photoURL }} // User profile image
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.displayName}</Text>
        <TouchableOpacity onPress={onEditProfile} style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
)

}
const styles = StyleSheet.create({
   
    userProfile: {
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#fff',
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 10,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    editProfileButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#ddd',
      borderRadius: 5,
    },
    editProfileText: {
      fontSize: 16,
    },
  
  });
export default UserProfile;