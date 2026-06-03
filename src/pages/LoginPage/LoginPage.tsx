import { Fragment, useEffect } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import Wave from "react-wavify";

import type { JSX } from "react";
import type { FormDataAuth } from "@/types/forms";

import Loader from "@/components/Loader/Loader";
import SlideButtonList from "@/components/SlideButtonList/SlideButtonList";
import HeaderPresentation from "@/components/HeaderPresentation/HeaderPresentation";
import InputForm from "@/components/InputForm/InputForm";

import { useAuthStore } from "@/hooks/useAuthStore";
import { useForm } from "@/hooks/useForm";
import { useSlide } from "@/hooks/useSlide";

import { theme } from "@/styles/theme";

import assets from "@/assets/index";

import "@/pages/LoginPage/LoginPage.css";

const formData: FormDataAuth = {
  email: "",
  password: "",
};

const LoginPage = (): JSX.Element => {
  const {
    images,
    isLoadingImages,
    handleLoginWithEmailAndPassword,
    handleLoginWithGoogle,
    handleGetImages,
  } = useAuthStore();

  const { index, handleSetIndex } = useSlide(images);
  const { formState, onInputChange } = useForm(formData);

  const onSubmitForm: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const email = formState.email.trim();
    const password = formState.password.trim();

    if (!email || !password) {
      return void Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Invalid email or password",
      });
    }

    handleLoginWithEmailAndPassword({
      email: formState.email,
      password: formState.password,
    });
  };

  const onSubmitWithGoogle = (): void => {
    handleLoginWithGoogle();
  };

  useEffect(() => {
    handleGetImages();
  }, []);

  return (
    <main className="main-login">
      <section className="login-wrapper">
        <article className="login-wrapper__information">
          {isLoadingImages ? (
            <Loader></Loader>
          ) : (
            <Fragment>
              <img src={images[index]} alt="loginimage" className="login-wrapper__img"></img>

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

        <form className="login-wrapper__form" onSubmit={onSubmitForm}>
          <img src={assets.images.LogoPng} alt="logo" className="login-wrapper__logo"></img>

          <InputForm
            type="text"
            placeholder="Your email"
            value={formState.email}
            name="email"
            className="login-wrapper__input"
            onChange={onInputChange}
          ></InputForm>

          <InputForm
            type="password"
            placeholder="Your password"
            value={formState.password}
            name="password"
            className="login-wrapper__input"
            onChange={onInputChange}
          ></InputForm>

          <button type="submit" aria-label="Sign in" className="login-wrapper__btn">
            Login
          </button>
          <button
            type="button"
            className="login-wrapper__btn"
            aria-label="Sign in with Google"
            onClick={onSubmitWithGoogle}
          >
            Google
          </button>
          <Link to="/register" aria-label="Go to register page" className="login-wrapper__link">
            Register
          </Link>
        </form>
      </section>

      <Wave
        className="login-wave"
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

export default LoginPage;
