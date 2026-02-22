"use client"

import {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

const ModalsContext = createContext();

export const ModalsProvider = ({ children }) => {
  const [curt, setIsCurt] =
    useState([]);
  const [isModalOpen, setIsModalOpen] =
    useState(null);
  const [isProdModalId, setIsProdModalId] =
    useState(null);
  const [isProd, setIsProd] = useState(null);

  const [activeModalRef, setActiveModalRef] =
    useState(null);

  const registerModalRef = (ref) =>
    setActiveModalRef(ref);
  const clearModalRef = () =>
    setActiveModalRef(null);

  useEffect(() => {
    const body = document.body;
    const stickyHeader = document.querySelector(
      ".header-bottom.sticky",
    );

    const skip = ["language"];

    const shouldLock =
      isModalOpen !== null &&
      !skip.includes(isModalOpen);

    if (shouldLock) {
      const scrollBarWidth =
        window.innerWidth -
        document.documentElement.clientWidth;

      body.style.overflow = "hidden";
      body.style.paddingRight = `${scrollBarWidth}px`;

      if (stickyHeader) {
        stickyHeader.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      body.style.overflow = "";
      body.style.paddingRight = "";

      if (stickyHeader) {
        stickyHeader.style.paddingRight = "";
      }
    }

    return () => {
      body.style.overflow = "";
      body.style.paddingRight = "";

      if (stickyHeader) {
        stickyHeader.style.paddingRight = "";
      }
    };
  }, [isModalOpen]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape")
        setIsModalOpen(null);
    };

    document.addEventListener("keydown", onEsc);
    return () =>
      document.removeEventListener(
        "keydown",
        onEsc,
      );
  }, []);

  return (
    <ModalsContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        isProd,
        setIsProd,
        isProdModalId,
        setIsProdModalId,

        activeModalRef,
        registerModalRef,
        clearModalRef, curt, setIsCurt
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
};

export const useModals = () =>
  useContext(ModalsContext);
