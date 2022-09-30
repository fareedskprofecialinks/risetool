import React, { useState, useEffect, useRef } from "react";
import "./../App.css";
import GoogleLogin from "react-google-login";
import { gapi } from "gapi-script";
import Recaptcha from "react-recaptcha";
import Modal from "react-bootstrap/Modal";
import FacebookLogin from "./../components/FacebookLogin";
import config from "./../config/config";
import i18n from "./../utils/i18n";
import ClientCaptcha from "react-client-captcha";
import "react-client-captcha/dist/index.css";
import ReactTooltip from "react-tooltip";

import { fetchLoginService } from "./../services/webServices";

const Login = (props) => {
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [state, setState] = useState({
    userName: "",
    password: "",
    userNameError: true,
    passwordError: true,
    invalidUser: false,
    captchaCode: "",
    enteredCaptchaCode: "",
    enteredCaptchaCodeError: false,
    guestUser: "",
  });
  const [position, setPosition] = useState([0, 0]);
  const idleTimer = useRef(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setPosition([position.coords.latitude, position.coords.longitude]);
    });
    localStorage.removeItem("LoginData");
    let lang = localStorage.getItem("language");
    setLanguage(lang?.toLowerCase());
  }, []);
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId:
          "727972302056-05ansi6oci79ra6tvr9c493fs0linftc.apps.googleusercontent.com",
        scope: "email",
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  const responseGoogle = (e) => {
   // console.log(e);
    if (e.profileObj && e.profileObj.email) {
      let payload = {
        email: e.profileObj && e.profileObj.email,
        name: e.profileObj && e.profileObj.givenName,
        family_name: e.profileObj && e.profileObj.familyName,
        oauth_type: "google",
      };
      fetchLoginService(payload, (CB) => {
        if (CB.status === "Success") {
          config.setLoginData(CB.data);         
          if (CB.data.score) {
            props.history.replace({
              pathname: "dashboard",
              state: {
                pastResultData: CB.data.score
                  ? JSON.parse(CB.data.score)
                  : {
                      PSSI: 0,
                      SDRI: 0,
                      risk_value: 0,
                    },
                pastHazardResultData: CB.data.score
                  ? JSON.parse(CB.data.score)
                  : {
                      PSSI: 0,
                      SDRI: 0,
                      risk_value: 0,
                    },
                pastResultData: CB.data.score
                  ? JSON.parse(CB.data.score)
                  : null,
                pastHazardResultData: CB.data.score
                  ? JSON.parse(CB.data.score)
                  : null,
                userId: CB.data.user_id,
                position: CB.data.latitude
                  ? [CB.data.latitude, CB.data.longitude]
                  : position,
                assesment_type: CB.data.assesment_type,
              },
            });
          } else {
            props.history.replace({
              pathname: "questionnaire",
              state: { userId: CB.data.user_id },
            });
          }
        }
      });
    } else {
      // alert('Please try later' + JSON.stringify(e))
    }
  };

  const responseFacebook = (e) => {
    let payload = {
      email: e.email ? e.email : e.id,
      name: e.name ? e.name : "",
      oauth_type: "facebook",
    };
    fetchLoginService(payload, (CB) => {
      if (CB.status == "Success") {
        props.history.replace({
          pathname: "dashboard",
          state: {
            resultData: CB.data.score
              ? JSON.parse(CB.data.score)
              : {
                  PSSI: 0,
                  SDRI: 0,
                  risk_value: 0,
                },
            userId: CB.data.user_id,
            position,
            assesment_type: CB.data.assesment_type,
          },
        });
      }
    });
  };

  const changePassword = (e) => {
    const val = e.target.value;
    const passwordReg =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (passwordReg.test(val)) {
      setState((prevState) => {
        return {
          ...prevState,
          password: val,
          passwordError: false,
          invalidUser: false,
        };
      });
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          password: val,
          passwordError: "invalidPassword",
          invalidUser: false,
        };
      });
    }
  };

  const changeEmail = (e) => {
    const val = e.target.value;
    setState((prevState) => {
      return {
        ...prevState,
        userName: val,
        userNameError: false,
        invalidUser: false,
      };
    });
  };

  const changeCaptcha = (e) => {
    let val = e.target.value;
    if (val === "") {
      setState((prevState) => {
        return {
          ...prevState,
          enteredCaptchaCode: val,
          enteredCaptchaCodeError: true,
        };
      });
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          enteredCaptchaCode: val,
          enteredCaptchaCodeError: false,
        };
      });
    }
  };

  const setCode = (captchaCode) => {
    setState((prevState) => {
      return {
        ...prevState,
        captchaCode: captchaCode,
        enteredCaptchaCode: "",
        enteredCaptchaCodeError: false,
      };
    });
  };

  const submitForm = (e) => {
    e.preventDefault();

    setSubmit(true);

    let emailError = false,
      passwordError = state.passwordError;
    let filter =
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    // debugger
    if (state.captchaCode === state.enteredCaptchaCode) {
      if (filter.test(state.userName)) {
        setState((prevState) => {
          return { ...prevState, userNameError: false };
        });
      } else {
        emailError = true;
        setState((prevState) => {
          return { ...prevState, userNameError: true };
        });
      }

      if (
        !state.password &&
        state.password.length < 8 &&
        state.password.length > 0
      ) {
        passwordError = true;
        setState((prevState) => {
          return { ...prevState, passwordError: "passwordlengtherror" };
        });
      }

      if (!passwordError && !emailError) {
        let payload = {
          email: state.userName,
          password: state.password,
        };

        fetchLoginService(payload, (CB) => {
          if (CB.status === "Success") {
            config.setLoginData(CB.data);
            localStorage.setItem("userId", CB.data.user_id);           
            let resdata = JSON.parse(CB.data.score);
            if (resdata.PSSI > 0 && resdata.SDRI > 0) {
              props.history.replace({
                pathname: "dashboard",
                state: {
                  pastResultData: CB.data.score
                    ? JSON.parse(CB.data.score)
                    : {
                        PSSI: 0,
                        SDRI: 0,
                        risk_value: 0,
                      },
                  pastHazardResultData: CB.data.score
                    ? JSON.parse(CB.data.score)
                    : {
                        PSSI: 0,
                        SDRI: 0,
                        risk_value: 0,
                      },
                  userId: CB.data.user_id,
                  position,
                },
              });
            } else {
              props.history.replace({
                pathname: "questionnaire",
                state: {
                  pastResultData: CB.data.score
                    ? JSON.parse(CB.data.score)
                    : {
                        PSSI: 0,
                        SDRI: 0,
                        risk_value: 0,
                      },
                  pastHazardResultData: CB.data.score
                    ? JSON.parse(CB.data.score)
                    : {
                        PSSI: 0,
                        SDRI: 0,
                        risk_value: 0,
                      },
                  userId: CB.data.user_id,
                  position,
                },
              });
            }
          } else if (CB.status === "Error") {
            if (CB.code === "400") {
              alert(CB.message);
            } else {
              setState((prevState) => {
                return { ...prevState, invalidUser: true };
              });
            }
          }
        });
      }
    } else {
      setState((prevState) => {
        return { ...prevState, enteredCaptchaCodeError: true };
      });
    }
  };

  const captchaLoaded = () => {
    console.log("captcha laoded");
  };

  return (
    <section className="bg-img">
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        backdrop="static"
        centered
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title style={{ fontFamily: "Roboto" }}>
            {i18n[language === "en" ? "en" : "sp"].login.guestLogin}
            {/* {
                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).guestLogin : ''
                        } */}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontFamily: "Roboto" }}>
            {i18n[language === "en" ? "en" : "sp"].login.guestLoginData}

            {/* {
                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).guestLoginData : ''
                        } */}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <div
            className="col-md-12"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              onClick={() => {
                setShow(false);
              }}
              style={{ backgroundColor: "#b91c26", borderColor: "#b91c26" }}
              className="btn btn-primary"
              variant="primary"
            >
              {i18n[language === "en" ? "en" : "sp"].login.cancel}
              {/* {
                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).cancel : ''
                            } */}
            </button>

            <button
              style={{ backgroundColor: "#b91c26", borderColor: "#b91c26" }}
              onClick={() => {
                setShow(false);
                config.setLoginData({
                  userId: null,
                });
                props.history.replace({
                  pathname: "questionnaire",
                  state: { guestUser: true, userId: null },
                });
              }}
              className="btn btn-primary"
              variant="primary"
            >
              {i18n[language === "en" ? "en" : "sp"].login.Proceed}

              {localStorage.getItem(`LangDataFor${language}`)
                ? JSON.parse(localStorage.getItem(`LangDataFor${language}`))
                    .Proceed
                : ""}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
      <div
        className="container-fluid"
        style={{ borderBottom: "3px solid #dedede" }}
      >
        <div className="row head-img">
          <div className="col-md-12 ">
            <div className="row tabmargin" style={{ marginRight: "0px" }}>
              <div className="col-md-6 col-6 d-flex">
                <a target="_blank" href="https://www.cdri.world/">
                  <img
                    alt="cdri logo"
                    style={{
                      marginTop: "20px",
                      marginLeft: "2vw",
                      width: "150px",
                    }}
                    src={require("./../assets/img/images/cdri-logo.png")}
                    className="img-fluid"
                  />
                </a>
                <a target="_blank" href="https://rikaindia.com/">
                  <img
                    alt="UNDRR logo"
                    style={{
                      marginTop: "20px",
                      marginLeft: "2vw",
                      width: "140px",
                    }}
                    src={require("./../assets/img/images/rikalogo.png")}
                    className="img-fluid"
                  />
                </a>
                <a target="_blank" href="https://www.keio.ac.jp/en/">
                  <img
                    alt="UNDRR logo"
                    style={{
                      marginTop: "20px",
                      marginLeft: "2vw",
                      width: "85px",
                    }}
                    src={require("./../assets/img/images/keio.jpg")}
                    className="img-fluid"
                  />
                </a>
              </div>

              <div className="col-md-5 col-5" />
              {/* <div className="col-md-4 col-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <img
                                    onClick={() => props.history.replace({
                                        pathname: '/',
                                    })
                                    }
                                    alt="logo-covid-response"
                                    src={(window.orientation == 90 || window.orientation == 270) && window.innerWidth < 850 ? require('./../assets/img/images/logo-covid-response.png') : require('./../assets/img/images/logo-covid-response1.png')} style={{ width: '85%' }} className="img-fluid hederside_logo" />
                            </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid loginback">
        <div className="row alignLoginCard">
          <div className=" loginCard">
            <div className=" fullscreenGrad">
              <div className="col-md-6 padd-0 welcomeClass">
                {language == "sp" ? (
                  <img
                    style={{
                      margin: "auto",
                      display: "block",
                      height: "100%",
                      width: "100%",
                    }}
                    alt="Login-box-bgsp"
                    className="img-responsive"
                    src={require("./../assets/img/images/login/Login-box-bgsp.jpg")}
                  />
                ) : (
                  <img
                    style={{
                      margin: "auto",
                      display: "block",
                      height: "100%",
                      width: "100%",
                    }}
                    alt="Login-box-bg"
                    className="img-responsive"
                    src={require("./../assets/img/images/login/Login-box-bg.jpg")}
                  />
                )}
              </div>
              <div className="col-md-6 col-12">
                <p
                  style={{
                    fontSize: 25,
                    textAlign: "center",
                    color: "#002a4a",
                    marginBottom: "0.5rem",
                    fontFamily: "Roboto",
                    width: "90%",
                    padding: "10px",
                    borderBottom: "1px solid #002a4a",
                  }}
                >
                  {i18n[language === "en" ? "en" : "sp"].login.login}
                  {/* {
                                        localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).login : ''
                                    } */}
                </p>
                <form action="" onSubmit={submitForm}>
                  {state.invalidUser ? (
                    <p
                      style={{
                        fontSize: 14,
                        textAlign: "center",
                        color: "#002a4a",
                        border: "0.5px solid red",
                        backgroundColor: "#f5d5d2",
                        fontFamily: "Roboto",
                        width: "90%",
                        padding: "5px",
                        margin: 0,
                      }}
                    >
                      {i18n[language === "en" ? "en" : "sp"].login.errormsg}
                      {/* {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).errormsg : ''
                                                } */}
                    </p>
                  ) : null}
                  <div
                    className="row"
                    style={{ padding: "10px", width: "100%" }}
                  >
                    <div
                      className={"col-md-12 col-12"}
                      style={{ padding: "5px", width: "80%" }}
                    >
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <div className="input-group-prepend">
                          <span className="input-group-text" id="basic-addon1">
                            <img
                              className="img-responsive"
                              alt="mail"
                              src={require("./../assets/img/images/login/mail.png")}
                            />
                          </span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          aria-label={"email"}
                          aria-required="true"
                          maxLength={50}
                          autoComplete="off"
                          placeholder={
                            i18n[language === "en" ? "en" : "sp"].login.email
                          }
                          onChange={changeEmail}
                          aria-describedby="basic-addon1"
                        />
                      </div>
                      {submit && state.userNameError ? (
                        <p
                          style={{
                            paddingLeft: 10,
                            color: "red",
                            margin: 0,
                            fontSize: 12,
                            fontFamily: "Roboto",
                          }}
                        >
                          {
                            i18n[language === "en" ? "en" : "sp"].login
                              .erroremail
                          }
                        </p>
                      ) : null}
                    </div>
                    <div
                      className={"col-md-12 col-12"}
                      style={{ padding: "5px", marginTop: "10px" }}
                    >
                      <ReactTooltip />
                      <div className="input-group " style={{ marginBottom: 0 }}>
                        <div className="input-group-prepend">
                          <span className="input-group-text" id="basic-addon2">
                            <img
                              className="img-responsive"
                              alt="password"
                              src={require("./../assets/img/images/login/password.png")}
                            />
                          </span>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          aria-label={"password"}
                          autoComplete="off"
                          aria-required="true"
                          className="form-control"
                          maxLength={50}
                          placeholder={
                            i18n[language === "en" ? "en" : "sp"].login
                              .enterPassword
                          }
                          autocomplete="off"
                          onChange={changePassword}
                          data-html={true}
                          data-tip="&amp;#8226; Use atleast 8 characters.<br />
                                                    &amp;#8226; Include both lowercase and uppercase characters.<br />
                                                    &amp;#8226; Include atleast one number or symbol.<br />
                                                    &amp;#8226; Password should not be based on any personal information such as user id, family name, pet, birthday, friends, co-workers, addresses, phone numbers, etc."
                          aria-describedby="basic-addon2"
                        />
                        <div
                          class="input-group-append"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span class="input-group-text">
                            {showPassword ? (
                              <img
                                className="img-responsive"
                                alt="invisible"
                                src={require("./../assets/img/images/login/invisible.png")}
                              />
                            ) : (
                              <img
                                className="img-responsive"
                                alt="eye"
                                src={require("./../assets/img/images/login/eye.png")}
                              />
                            )}
                          </span>
                        </div>
                      </div>
                      {state.passwordError === "invalidPassword" ? (
                        <p
                          style={{
                            paddingLeft: 10,
                            color: "red",
                            margin: 0,
                            fontSize: 12,
                            fontFamily: "Roboto",
                          }}
                        >
                          {
                            "Use atleast 8 characters. Include both lowercase and uppercase characters. Include atleast one number or symbol"
                          }
                        </p>
                      ) : null}
                      {submit && state.passwordError === true ? (
                        <p
                          style={{
                            paddingLeft: 10,
                            color: "red",
                            margin: 0,
                            fontSize: 12,
                            fontFamily: "Roboto",
                          }}
                        >
                          {i18n[language === "en" ? "en" : "sp"].login.password}
                          {/* {
                                                        localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).password : ''
                                                    } */}
                        </p>
                      ) : null}
                      {submit &&
                      state.passwordError === "passwordlengtherror" ? (
                        <p
                          style={{
                            paddingLeft: 10,
                            color: "red",
                            margin: 0,
                            fontSize: 12,
                            fontFamily: "Roboto",
                          }}
                        >
                          {
                            i18n[language === "en" ? "en" : "sp"].login
                              .invalidpassword
                          }
                          {/* {
                                                        localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).invalidpassword : ''
                                                    } */}
                        </p>
                      ) : null}
                    </div>
                    <p
                      onClick={() => {
                        props.history.replace({
                          pathname: "forgot",
                        });
                      }}
                      style={{
                        fontSize: 15,
                        textDecoration: "underline",
                        width: "100%",
                        marginBottom: "0.3rem",
                        textAlign: "right",
                        cursor: "pointer",
                      }}
                    >
                      <a style={{ color: "#002a4a" }}>
                        {
                          i18n[language === "en" ? "en" : "sp"].login
                            .forgotpassword
                        }
                        {/* {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).forgotpassword : ''
                                                } */}
                      </a>
                    </p>
                    <div
                      className={"col-md-12 col-12 d-flex"}
                      style={{ padding: "5px", width: "100%" }}
                    >
                      <ClientCaptcha
                        charsCount={6}
                        captchaClassName="CaptchaClass"
                        width={200}
                        captchaCode={setCode}
                        retryIcon={require("./../assets/img/reload.png")}
                      />
                    </div>
                    <div
                      className={"col-md-12 col-12"}
                      style={{ padding: "5px", width: "80%" }}
                    >
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          className="form-control"
                          aria-label={"Captcha"}
                          aria-required="true"
                          maxLength={6}
                          placeholder={
                            localStorage.getItem(`LangDataFor${language}`)
                              ? JSON.parse(
                                  localStorage.getItem(`LangDataFor${language}`)
                                ).codeInImage
                              : "What code is in image?"
                          }
                          value={state.enteredCaptchaCode}
                          // aria-label="Captcha"
                          onChange={changeCaptcha}
                          aria-describedby="basic-addon1"
                        />
                      </div>
                      {submit && state.enteredCaptchaCodeError ? (
                        <p
                          style={{
                            paddingLeft: 10,
                            color: "red",
                            margin: 0,
                            fontSize: 12,
                            fontFamily: "Roboto",
                          }}
                        >
                          {localStorage.getItem(`LangDataFor${language}`)
                            ? JSON.parse(
                                localStorage.getItem(`LangDataFor${language}`)
                              ).invalidCaptcha
                            : "Invalid Captcha"}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className="row"
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        justifyContent: "center",
                        marginLeft: "0px",
                        marginRight: "0px",
                      }}
                    >
                      <input
                        type="submit"
                        value={
                          i18n[language === "en" ? "en" : "sp"].login.login
                        }
                        style={{
                          width: "100%",
                          borderRadius: 5,
                          padding: "5px",
                          color: "#fff",
                          backgroundColor: "#b91c26",
                        }}
                        className="btn "
                      />
                    </div>
                    <div
                      className="row"
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        justifyContent: "center",
                        marginLeft: "0px",
                        marginRight: "0px",
                      }}
                    >
                      <button
                        onClick={() => {
                          window.history.back();
                        }}
                        style={{ width: "100%" }}
                        type="button"
                        class="btn btn-light"
                      >
                        {i18n[language === "en" ? "en" : "sp"].login.cancel}
                        {/* {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).cancel : ''
                                                } */}
                      </button>
                    </div>
                    {/* <Recaptcha
                                            sitekey="6Leb1BIbAAAAAO9PdMjd6-jXcs0yJBR5Sz8Ro0ju"
                                            render="explicit"
                                            onloadCallback={captchaLoaded}
                                        /> */}
                  </div>
                </form>
                {/* <div
                  className="row"
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span 
                    style={{
                      color: "#002a4a",
                      fontFamily: "Roboto",
                      fontSize: 16,
                      marginRight: "10px",
                    }}
                  >
                    {i18n[language === "en" ? "en" : "sp"].login.loginWith}
                    {
                                         ///   localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).loginWith : ''
                                        }
                  </span>
                  <GoogleLogin
                    clientId="968386318566-q29k8j7vst4haa8i5usjje9vj6a7q2t3.apps.googleusercontent.com"
                    render={(renderProps) => (
                      <div
                        onClick={renderProps.onClick}
                        style={{
                          borderRadius: 5,
                          padding: "5px",
                          backgroundColor: "#ffffff",
                          marginRight: "10px",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          className="img-responsive"
                          alt="google"
                          style={{
                            height: 30,
                            width: 30,
                            borderRadius: 15,
                            boxShadow:
                              "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                          }}
                          src={require("./../assets/img/images/login/google.png")}
                        />
                      </div>
                    )}
                    buttonText="Login"
                    onSuccess={(e) => {
                      responseGoogle(e);
                    }}
                    onFailure={(e) => {
                      responseGoogle(e);
                    }}
                  />
                  <div style={{ height: 10 }} />
                </div> */}
                <div style={{padding:'10px'}}>
                  <span
                    onClick={() => {
                      props.history.replace({
                        pathname: "registration",
                      });
                    }}
                    style={{
                      fontSize: 14,
                      textAlign: "center",
                      marginBottom: "0.3rem",
                      color: "#002a4a",
                    }}
                  >
                    {i18n[language === "en" ? "en" : "sp"].login.dontaccount}
                    {/* {
                                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).dontaccount : ''
                                        } */}
                    <a type="button"
                      style={{ fontWeight:700,fontSize:'14px', textDecoration: "underline", color: "#002a4a" }}
                    >
                      {i18n[language === "en" ? "en" : "sp"].login.signup}
                      {/* {
                                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).signup : ''
                                            } */}
                    </a>
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      marginRight: 10,
                      color: "#002a4a",
                    }}
                  >
                    /
                  </span>
                  <span
                    onClick={() => setShow(true)}
                    style={{
                      color: "#000000",
                      fontFamily: "Roboto",
                      fontSize: 14,
                      color: "#002a4a",
                    }}
                  >
                    <a style={{fontWeight:700,fontSize:'14px', color: "#002a4a" }} href="#">
                      {i18n[language === "en" ? "en" : "sp"].login.guest}
                      {/* {
                                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).guest : ''
                                            } */}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-12 col-12">
          {/* <p
                        style={{ fontSize: 10, textAlign: 'center', color: '#002a4a', marginBottom: '0.5rem', fontFamily: 'Roboto', width: '90%', padding: '10px', borderBottom: '1px solid #002a4a' }}>
                        Unauthorized access to this United Nations Computer System is prohibited by ST/SGB/2004/15 (''Use of information and communication technology resources and data" of 29 November 2004). Authorized users shall ensure that their use of Information and Communication Technology (ICT) resources and ICT data is consistent with their obligations as staff members or such other obligations as may apply to them. All use of ICT resources and ICT data is subject to monitoring and investigation as set forth in ST/SGB/2004/15. Use of this system by any user, authorized or unauthorized, constitutes consent to the applicable UN regulations and rules.
                    </p> */}
        </div>
      </div>
    </section>
  );
};

export default Login;
