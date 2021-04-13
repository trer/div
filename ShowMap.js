import { React, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Jumbotron, Image, Row, Col, Alert } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router";
import FaButton from "./FaButton.js";
import DeleteModal from "./DeleteModal.js";
import Button from "./Button.js";
import Modal from "./Modal.js";
import MyMapComponent from "./Map.js";

/* This is the detailed description of tasks shown 
    when you click yourself into a task where
    you can sign up for activities etc.
    
    Note that this component is made _very_ complex
    by the fact that we're both using history state and
    hooks to store the task. If we were going to continue
    this project, we should probably change that, 
    but right now everything should work correctly.   */

function ActivityRecommendationDetail({ updateTasks, user, tasks }) {
  const location = useLocation();
  let task = tasks.filter(
    (tasks) => tasks.activity_id == location.state.task.activity_id
  )[0];
  const history = useHistory();
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [show, setShow] = useState(false);

  if (task === undefined) {
    task = location.state.task;
  }

  //Stops the site from crashing if page is reloaded and hooks are cleared
  if (user === null) {
    user = JSON.parse(localStorage.getItem("user"));
  }

  let lat = parseFloat(task.lat);
  let lng = parseFloat(task.lng);

  //Checks whether the heart is supposed to be filled or not
  if (task.who_liked.split(",").includes(user.username)) {
    var userLikeState = true;
    task.who_liked = user.username;
  } else {
    var userLikeState = false;
    task.who_liked = "";
  }

  const [fillState, setFillState] = useState(userLikeState);
  const [cookieToken, setToken] = useCookies(["mytoken"]);
  const [feedback, setFeedback] = useState("");
  const [viewAlert, setViewAlert] = useState(false);

  /**
   * Used for the error message to pop up and dissapear after 2 seconds.
   */

  const handleVisible = () => {
    setViewAlert(true);
    setTimeout(() => {
      setViewAlert(false);
    }, 2000);
  };

  //Updates the view count of the activity

  useEffect(() => {
    seAktivitet();
  }, []);


  //The following renders the actual page
  //with some conditions based on user type
  //and the type of activity, i. e. organized

  return (
    <div id="activity-detail-container">
      <div>
        {user == null ? null : (
          <Jumbotron
            fluid
            style={{ backgroundColor: "#d9ead3" }}
            className="activity-detail"
          >
            <Container fluid id="activityDetailContainer">
              <Row>
                <Col xs="10">
                  <h1>
                    {task.title}

                    {user.status != "Organization" ? (
                      <FaButton
                        faCode={fillString(fillState)}
                        onClick={likAktivitet}
                      ></FaButton>
                    ) : (
                      ""
                    )}
                  </h1>
                </Col>
                {task.creator == user.username || user.status == "" ? (
                  <>
                    <Col xs="1">
                      <Button
                        onClick={() => showModal()}
                        style={{ backgroundColor: "#000045" }}
                        text="Redigere"
                      ></Button>
                    </Col>
                    <Col xs="1">
                      <Button
                        onClick={() => setDeleteAlert(true)}
                        style={{ backgroundColor: "#6D0000" }}
                        text="Slette"
                      ></Button>
                    </Col>
                  </>
                ) : (
                  ""
                )}
              </Row>
              <br /> <br />
              {show ? (
                <Modal
                  show={show}
                  updateTasks={updateTasks}
                  cookie={cookieToken}
                  task={task}
                  onClose={onClose}
                />
              ) : (
                ""
              )}
              {deleteAlert ? (
                <DeleteModal
                  onDelete={onDelete}
                  onAlertClose={onAlertClose}
                  show={deleteAlert}
                  task={task}
                />
              ) : (
                ""
              )}
              <Row>
                <Col>
                  <p style={{ fontSize: "110%" }}>
                    <b>Sted:</b> {task.place}
                  </p>
                </Col>
                {task.activity_type > 0 ? (
                  <Col>
                    <p style={{ fontSize: "110%" }}>
                      <b>Organisert av:</b> {task.creator}
                    </p>
                  </Col>
                ) : (
                  ""
                )}
                {task.activity_type > 0 ? (
                  <>
                    <Col>
                      <p style={{ fontSize: "110%" }}>
                        <b>Fra: </b> kl. {stringifyTime(task.activity_start)},{" "}
                        {stringifyDate(task.activity_start)}
                      </p>
                    </Col>
                    <Col>
                      <p style={{ fontSize: "110%" }}>
                        <b>Til: </b> kl. {stringifyTime(task.activity_end)},{" "}
                        {stringifyDate(task.activity_end)}
                      </p>
                    </Col>
                    <Col
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <p style={{ marginLeft: "auto", fontSize: "110%" }}>
                        <b>Påmeldte: </b>{" "}
                        {finnPåmeldte(task.max_participants, task.participants)}
                        /{task.max_participants}
                      </p>
                    </Col>
                  </>
                ) : (
                  <Col style={{ display: "flex", justifyContent: "flex-end" }}>
                    <p style={{ fontSize: "110%", marginLeft: "auto" }}>
                      <b>Foreslått av:</b> {task.creator}
                    </p>
                  </Col>
                )}
              </Row>
              <br />
              <div id="picture-detail-container">
                <Image src={task.picture} id="activities-detail-picture" />
                {/*task.picture*/}
              </div><br/>
              <MyMapComponent
                id="test"
                key={lat + lng} //Makes the component update when edited on the page
                lat={lat}
                lng={lng}
                isDraggable={false}
                googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBX1-hogWKd9auZ8sfgly3dRumOY8rKMII"
                loadingElement={<div style={{ height: `80%`, width: `80%` }} />}
                containerElement={
                  <div style={{ height: `400px`, width: `50%` }} />
                }
                mapElement={<div style={{ height: `90%` }} />}
              />
              <hr />
              <p style={{ fontSize: "1.2em" }}>
                <b>Kort beskrivelse: </b>
                {task.short_description}
              </p>
              <hr />
              <p style={{ fontSize: "1.2em" }}>
                <b>Full beskrivelse: </b>
                {task.description}
              </p>
              <br />
              {!checkIfPåmeldt(task.participants) &&
              task.activity_type > 0 &&
              user.status != "Organization" &&
              finnPåmeldte(task.max_participants, task.participants) >=
                task.max_participants ? (
                <input
                  type="submit"
                  style={{ backgroundColor: "darkblue" }}
                  onClick={() => null}
                  value="Denne aktiviteten har ikke flere ledige plasser"
                  className="btnn btn-block"
                />
              ) : (
                ""
              )}
              {!checkIfPåmeldt(task.participants) &&
              task.activity_type > 0 &&
              user.status != "Organization" &&
              finnPåmeldte(task.max_participants, task.participants) <
                task.max_participants ? (
                <input
                  type="submit"
                  onClick={() => meldPå()}
                  style={{ backgroundColor: "darkgreen" }}
                  value="Meld deg på"
                  className="btnn btn-block"
                  id="meldpabtn"
                />
              ) : (
                ""
              )}
              {checkIfPåmeldt(task.participants) &&
              task.activity_type > 0 &&
              user.status != "Organization" ? (
                <input
                  type="submit"
                  style={{ backgroundColor: "darkblue" }}
                  onClick={() => meldPå()}
                  value="Du er allerede påmeldt. Melde deg av?"
                  className="btnn btn-block"
                  id="meldavbtn"
                />
              ) : (
                ""
              )}
              {user.status == "Organization" ? (
                <input
                  type="submit"
                  style={{ backgroundColor: "darkblue" }}
                  value="Som organisasjon kan du ikke melde deg på aktiviteter"
                  className="btnn btn-block"
                  id="loginsubmitbutton"
                />
              ) : (
                ""
              )}
            </Container>
          </Jumbotron>
        )}
        {feedback && (
          <Alert show={viewAlert} variant="primary" dismissible>
            {feedback}
          </Alert>
        )}
      </div>
    </div>
  );


  /**
   * @param {Array} participants
   * @returns true if current user is participating in this activity or false if not.
   */

  function checkIfPåmeldt(participants) {
    participants = participants.split(",");

    if (participants.includes(user.username)) {
      return true;
    }

    return false;
  }

  //Closes the modal, updates the changes and 
  //allows you to scroll the background page again

  function onClose() {
    setShow(false);
    updateTasks(cookieToken["mytoken"]);
    document.querySelector("body").style.overflow = "auto";
  }

  /**
   * Set state show to true.
   * @param {int} id
   */
  function showModal(id) {
    setShow(true);
    document.querySelector("body").style.overflow = "hidden";
  }

  //Closes the delete alert
  function onAlertClose() {
    setDeleteAlert(false);
  }

  //Tries to update the unique viewcount of the page on first render
  //Also puts the current task into the history state in case of reload etc.

  function seAktivitet() {
    fetch(`http://localhost:8000/whoViewed/${task.activity_id}/`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${cookieToken["mytoken"]}`,
      },
    })
      .then((result) => {
        if (!result.ok) throw result;
        updateTasks(cookieToken["mytoken"]);
        return result.json();
      })
      .catch((error) => {
        console.log(error);
      });

    history.replace({ pathname: location.pathname, state: { task: task } });
  }

  //Deletes the task and returns the user to the front page

  function onDelete(task) {
    var obj = task;
    setDeleteAlert(false);

    fetch(`http://localhost:8000/editArticles/${task.activity_id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${cookieToken["mytoken"]}`,
      },
      body: JSON.stringify(obj),
    })
      .then((result) => {
        if (!result.ok) throw result;
        updateTasks(cookieToken["mytoken"]);
        history.push("/");
      })
      .catch((error) => {
        console.log(error);
        alert("Du kunne ikke slette denne aktiviteten.");
      });
  }

  /**
   * User liking an activity registered
   * Also updates the history state task in case of reload
   */

  function likAktivitet() {
    setFillState(!fillState);

    fetch(`http://localhost:8000/whoLiked/${task.activity_id}/`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${cookieToken["mytoken"]}`,
      },
    })
      .then((result) => {
        if (!result.ok) throw result;
        updateTasks(cookieToken["mytoken"]);
        return result.json();
      })
      .catch((error) => {
        console.log(error);
      });

    if (task.who_liked.split(",").includes(user.username)) {
      task.who_liked = "";
      userLikeState = true;
    } else {
      task.who_liked = user.username;
      userLikeState = false;
    }

    history.replace({ pathname: location.pathname, state: { task: task } });
  }

  //Updates participants in the history state task
  //if the user signs up or removes themselves from an activity

  function oppdatereHistory() {
    let uname = user.username;

    let parts = task.participants.split(",");

    if (parts.indexOf("None") >= 0) {
      parts.splice(parts.indexOf("None", 0));
    }

    if (parts.indexOf(uname) == -1) {
      parts.push(uname);
    } else {
      parts.splice(parts.indexOf(uname, 0));
    }

    parts = parts.join(",");

    if (parts == "") {
      parts = "None";
    }

    task.participants = parts;

    history.replace({ pathname: location.pathname, state: { task: task } });
  }

  /**
   * User sign up for for event if seat is available
   */
  function meldPå() {
    fetch(`http://localhost:8000/participate/${task.activity_id}/`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${cookieToken["mytoken"]}`,
      },
    })
      .then((result) => {
        if (!result.ok) throw result;
        updateTasks(cookieToken["mytoken"]);
        oppdatereHistory();
        checkIfPåmeldt(task.participants)
          ? setFeedback("Meldt på aktivitet")
          : setFeedback("Meldt av aktivitet");
        handleVisible();
        return result.json();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * return amount of participants
   * @param {*} max
   * @param {str} participants
   * @returns count
   */
  function finnPåmeldte(max, participants) {

    if (participants == "None") {
      return 0;
    } else {
      participants = participants.split(",");
      let count = participants.length;

      return count;
    }
  }

 /**
   * Converts date from activity to a data type
   * that stringifyTime() and stringifyDate() can handle
   */
  function convertTime(time) {
    let d1 = new Date(time * 1);
    return d1.toLocaleString();
  }

  /**
   * Used to stringify the input: date
   */
  function stringifyTime(date) {
    let stringdate = convertTime(date).split(",");
    return stringdate[1];
  }

  /**
   * Used to stringify the input: date
   */
  function stringifyDate(date) {
    let stringdate = convertTime(date).split(",");
    return stringdate[0];
  }

  /**
   * Gets in a state and shows a like button or not.
   */
  function fillString(state) {
    var iconString;
    if (state === true) {
      iconString = "fa fa-heart";
    } else {
      iconString = "fa fa-heart-o";
    }
    return iconString;
  }
}

export default ActivityRecommendationDetail;
