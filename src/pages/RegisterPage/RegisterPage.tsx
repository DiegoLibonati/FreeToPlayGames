import { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Wave from "react-wavify";

import type { JSX } from "react";
import type { FormDataRegister } from "@/types/forms";

import Loader from "@/components/Loader/Loader";
import SlideButtonList from "@/components/SlideButtonList/SlideButtonList";
import HeaderPresentation from "@/components/HeaderPresentation/HeaderPresentation";
import InputForm from "@/components/InputForm/InputForm";

import { useSlide } from "@/hooks/useSlide";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useForm } from "@/hooks/useForm";

import { theme } from "@/styles/theme";

import assets from "@/assets/index";

import "@/pages/RegisterPage/RegisterPage.css";

const formData: FormDataRegister = {
  username: "",
  email: "",
  password: "",
  repeatPassword: "",
};

const RegisterPage = (): JSX.Element => {
  const { images, isLoadingImages, handleCreateNewUserWithEmailAndPassword, handleGetImages } =
    useAuthStore();

  const { index, handleSetIndex } = useSlide(images);
  const { formState, onInputChange } = useForm(formData);

  const onSubmitForm: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const email = formState.email.trim();
    const password = formState.password.trim();
    const repeatPassword = formState.repeatPassword.trim();
    const username = formState.username.trim();

    if (!email || !password || !repeatPassword || !username) {
      return void Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You need to complete all the fields",
      });
    }

    if (password !== repeatPassword) {
      return void Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords must be identical to each other",
      });
    }

    handleCreateNewUserWithEmailAndPassword(formState);
  };

  useEffect(() => {
    handleGetImages();
  }, []);

  return (
    <main className="register-page">
      <section className="register-wrapper">
        <article className="register-wrapper__information">
          {isLoadingImages ? (
            <Loader></Loader>
          ) : (
            <Fragment>
              <img src={images[index]} alt="registerimage" className="register-wrapper__img"></img>

              <HeaderPresentation>
                {index === 0
                  ? "The best free games wiki"
                  : index === 1
                    ? "Share with your friends"
                    : "Stay up to date with the latest news"}
              </HeaderPresentation>

              <SlideButtonList index={index} handleSetIndex={handleSetIndex}></SlideButtonList>
            </Fragment>
          )}
        </article>

        <form className="register-wrapper__form" onSubmit={onSubmitForm}>
          <img src={assets.images.LogoPng} alt="logo" className="register-wrapper__logo"></img>

          <InputForm
            type="text"
            placeholder="Your username"
            value={formState.username}
            name="username"
            className="register-wrapper__input"
            onChange={onInputChange}
          ></InputForm>

          <InputForm
            type="email"
            placeholder="Your email"
            value={formState.email}
            name="email"
            className="register-wrapper__input"
            onChange={onInputChange}
          ></InputForm>

          <InputForm
            type="password"
            placeholder="Your password"
            value={formState.password}
            name="password"
            className="register-wrapper__input"
            onChange={onInputChange}
          ></InputForm>

          <InputForm
            type="password"
            placeholder="Repeat your password"
            value={formState.repeatPassword}
            name="repeatPassword"
            className="register-wrapper__input"
            onChange={onInputChange}
          ></InputForm>

          <button type="submit" aria-label="Create account" className="register-wrapper__btn">
            Register
          </button>
          <Link to="/login" aria-label="Go to login page" className="register-wrapper__link">
            Go to Login
          </Link>
        </form>
      </section>

      <Wave
        className="register-wave"
        fill={theme.colors.secondary}
        paused={false}
        options={{
          amplitude: 40,
          speed: 0.15,
          points: 3,
        }}
      />
    </main>
  );
};

export default RegisterPage;
