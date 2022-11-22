import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Suggestion.scss";

import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Navigate } from "react-router-dom";

import Contract from "../Class/Contract";
import UnionABI from "./UnionABI";
import Swal from "sweetalert2";
//component preview

const FactorPreview = ({ setTitle, setDescription, title, description }) => {
  return (
    <>
      <div className="text">
        <label for="Title">Title</label>
        <input
          type="text"
          value={title}
          id="Title"
          size={100}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <label for="Description">Description(optional)</label>
        <textarea
          id="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </div>
    </>
  );
};

const Preview = ({ title, description }) => {
  return (
    <>
      <div className="preview_text">
        <h1>{title}</h1>
        <h3>{description}</h3>
      </div>
    </>
  );
};

const Suggestion = () => {
  const navigate = useNavigate();
  const { contractAddress } = useParams();
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const unionCA = new Contract(UnionABI, contractAddress);
  const boolPreview = () => {
    setPreview(!preview);
  };

  const createSuggestion = async () => {
    const reg = /[^\w\sㄱ-힣]|[\_]/g;
    const regReplace = (str) => {
      return str.replace(reg, ``);
    };

    const result = await unionCA.createSuggestion(
      regReplace(title),
      contractAddress
    );
    if (result > 0) {
      return navigate(-1);
    } else {
      Swal.fire({
        title: "Error",
        icon: "error",
      }).then(() => {
        return navigate(-1);
      });
    }
  };

  return (
    <div className="suggestionMain">
      <div className="suggestionBox">
        <div className="backIcon">
          <span
            onClick={() => {
              navigate(-1);
            }}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
            <FontAwesomeIcon icon={faAnglesLeft} />
          </span>
        </div>
        <div className="flex">
          <div className="suggestionText">
            {preview ? (
              <Preview title={title} description={description} />
            ) : (
              <FactorPreview
                setTitle={setTitle}
                setDescription={setDescription}
                title={title}
                description={description}
              />
            )}
          </div>
          <div className="previewSideBox">
            <div className="previewBox">
              <div className="preview" onClick={boolPreview}>
                {preview ? "편집" : "미리보기"}
              </div>
              <div className="createSuggestion" onClick={createSuggestion}>
                생성
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestion;
