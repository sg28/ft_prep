import React from "react";
import { useState } from "react";

export default function TabComponent() {
  let [header, setHeader] = useState("");

  function loadContent(content_header) {
    setHeader(content_header);
  }

  return (
    <div>
      <div>
        <div onClick={() => loadContent("account")}> account </div>
        <div onClick={() => loadContent("profile")}> profile </div>
        <div onClick={() => loadContent("design")}> design </div>
      </div>
      <div>
        {header === "account" ? (
          <div>
            Account: It is a long established fact that a reader will be
            distracted by the readable content of a page when looking at its
            layout. The point of using Lorem Ipsum is that it has a more-or-less
            normal distribution of letters, as opposed to using 'Content here,
            content here', making it look like readable English. Many desktop
            publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will
            uncover many web sites still in their infancy. Various versions have
            evolved over the years, sometimes by accident, sometimes on purpose
            (injected humour and the like).
          </div>
        ) : (
          ""
        )}
        {header === "profile" ? (
          <div>
            Profile: It is a long established fact that a reader will be
            distracted by the readable content of a page when looking at its
            layout. The point of using Lorem Ipsum is that it has a more-or-less
            normal distribution of letters, as opposed to using 'Content here,
            content here', making it look like readable English. Many desktop
            publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will
            uncover many web sites still in their infancy. Various versions have
            evolved over the years, sometimes by accident, sometimes on purpose
            (injected humour and the like).
          </div>
        ) : (
          ""
        )}
        {header === "design" ? (
          <div>
            Design: It is a long established fact that a reader will be
            distracted by the readable content of a page when looking at its
            layout. The point of using Lorem Ipsum is that it has a more-or-less
            normal distribution of letters, as opposed to using 'Content here,
            content here', making it look like readable English. Many desktop
            publishing packages and web page editors now use Lorem Ipsum as
            their default model text, and a search for 'lorem ipsum' will
            uncover many web sites still in their infancy. Various versions have
            evolved over the years, sometimes by accident, sometimes on purpose
            (injected humour and the like).
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
} 
