import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import { useEffect, useState } from "react";

/* The component used to display Google Maps */

const MyMapComponent = (props) => {
  const [defaultLat, setDefaultLat] = useState(props.lat);
  const [defaultLng, setDefaultLng] = useState(props.lng);

  //Starts by setting coordinates passed from component using the map
  useEffect(() => {
    localStorage.setItem("LAT", defaultLat);
    localStorage.setItem("LNG", defaultLng);
  }, []);

  //One version for the user choosing coordinates,
  //another just for viewing them
  if (props.isDraggable) {
    return (
      <GoogleMap
        defaultZoom={11}
        defaultCenter={{ lat: defaultLat, lng: defaultLng }}
      >
        {
          <Marker
            position={{ lat: defaultLat, lng: defaultLng }}
            draggable={true}
            onDragEnd={initMarker}
          />
        }
      </GoogleMap>
    );
  } else {
    return (
      <GoogleMap
        defaultZoom={11}
        defaultCenter={{ lat: defaultLat, lng: defaultLng }}
      >
        {
          <Marker
            position={{ lat: defaultLat, lng: defaultLng }}
            draggable={false}
          />
        }
      </GoogleMap>
    );
  }

  /**
   * Setting the default value for LAT and LNG
   */
  function initMarker() {
    setDefaultLat(this.internalPosition.lat());
    setDefaultLng(this.internalPosition.lng());
    localStorage.setItem("LAT", this.internalPosition.lat());
    localStorage.setItem("LNG", this.internalPosition.lng());
  }

};

export default withScriptjs(withGoogleMap(MyMapComponent));
