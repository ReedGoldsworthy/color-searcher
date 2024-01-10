import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { average } from "color.js";
import arrow from "./arrow.png";

const API_URL = "https://api.unsplash.com/search/photos";
const API_KEY = "YSE8VFKuS-yGHI5Zv821KAI0oGQucMrqY4p2dKEmBx0";
const IMAGES_PER_PAGE = 20;

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRGB(hex) {
  // Remove the hash character if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values to obtain R, G, B components
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
}

function rgbToLab(rgb) {
  const srgb = rgb.map((value) => {
    value /= 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  const xyz = [
    srgb[0] * 0.4124564 + srgb[1] * 0.3575761 + srgb[2] * 0.1804375,
    srgb[0] * 0.2126729 + srgb[1] * 0.7151522 + srgb[2] * 0.072175,
    srgb[0] * 0.0193339 + srgb[1] * 0.119192 + srgb[2] * 0.9503041,
  ];

  const whitePoint = [0.95047, 1.0, 1.08883];
  const lab = xyz.map((value, index) => {
    value /= whitePoint[index];
    return value > 0.008856
      ? Math.pow(value, 1 / 3)
      : (value * 903.3 + 16) / 116;
  });

  const l = Math.max(0, 116 * lab[1] - 16);
  const a = (lab[0] - lab[1]) * 500;
  const b = (lab[1] - lab[2]) * 200;

  return [l, a, b];
}

function App() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const [chosenPhoto1, setPhoto1] = useState(arrow);
  const [chosenPhoto2, setPhoto2] = useState("");
  const [chosenPhoto3, setPhoto3] = useState("");

  const [specialColor1, setSpecialColor1] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );
  const [specialColor2, setSpecialColor2] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );
  const [specialColor3, setSpecialColor3] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  const [chosenPhotoColor1, setChosenPhotoColor1] = useState();
  const [chosenPhotoColor2, setChosenPhotoColor2] = useState();
  const [chosenPhotoColor3, setChosenPhotoColor3] = useState();

  const [score1, setScore1] = useState();
  const [score2, setScore2] = useState();
  const [score3, setScore3] = useState();

  const [score, setScore] = useState(0);

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg("");
        setLoading(true);
        const { data } = await axios.get(
          `${API_URL}?query=${searchInput.current.value}&page=${page}&per_page=${IMAGES_PER_PAGE}&client_id=${API_KEY}`
        );
        setImages(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg("Error fetching images. Try again later.");
      console.log(error);
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const resetSearch = () => {
    setPage(1);
    fetchImages();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    resetSearch();
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    resetSearch();
  };

  // handle when image from search bar is clicked. Displays the dominant color and loads image in left column
  function handleImageClick(im_path) {
    if (counter == 0) {
      setPhoto1(im_path);
      setCounter(counter + 1);

      average(im_path).then((color) => {
        setChosenPhotoColor1(rgbToHex(color[0], color[1], color[2]));
      });

      setPhoto2(arrow);
    } else if (counter == 1) {
      setPhoto2(im_path);
      setCounter(counter + 1);

      average(im_path).then((color) => {
        setChosenPhotoColor2(rgbToHex(color[0], color[1], color[2]));
      });

      setPhoto3(arrow);
    } else if (counter == 2) {
      setPhoto3(im_path);

      setCounter(counter + 1);

      average(im_path).then((color) => {
        setChosenPhotoColor3(rgbToHex(color[0], color[1], color[2]));
      });
    }
  }

  function handleSubmitClick() {
    if (counter !== 3) {
      return;
    }
    console.log("got herer");
    let diff1 = calculateDifferrence(
      hexToRGB(specialColor1),
      hexToRGB(chosenPhotoColor1)
    );
    setScore1(diff1);

    console.log("got here1 ");
    let diff2 = calculateDifferrence(
      hexToRGB(specialColor2),
      hexToRGB(chosenPhotoColor2)
    );
    setScore2(diff2);

    console.log("got here 2 ");

    let diff3 = calculateDifferrence(
      hexToRGB(specialColor3),
      hexToRGB(chosenPhotoColor3)
    );
    setScore3(diff3);

    setScore(diff1 + diff2 + diff3);

    // setPhoto1('')
    // setPhoto2('')
    // setPhoto3('')
  }

  function handleColorClick() {
    setSpecialColor1("#" + Math.floor(Math.random() * 16777215).toString(16));
    setSpecialColor2("#" + Math.floor(Math.random() * 16777215).toString(16));
    setSpecialColor3("#" + Math.floor(Math.random() * 16777215).toString(16));

    setPhoto1("");
    setPhoto2("");
    setPhoto3("");
    setChosenPhotoColor1("");
    setChosenPhotoColor2("");
    setChosenPhotoColor3("");
    setCounter(0);
    setScore(0);
    setScore1();
    setScore2();
    setScore3();

    setPhoto1(arrow);
  }

  function calculateDifferrence(color1, color2) {
    const [l1, a1, b1] = rgbToLab(color1);
    const [l2, a2, b2] = rgbToLab(color2);

    const diff = Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);

    if (diff >= 100) {
      return 0;
    } else {
      return Math.round(100 - diff);
    }
  }

  return (
    <>
      <div className="row">
        <div className="column">
          <div className="left-col">
            <div className="row">
              <div className="tri-column">
                <button className="color-button" onClick={handleColorClick}>
                  {" "}
                  New Colors
                </button>
              </div>

              <div className="tri-column">
                <button className="color-button" onClick={handleSubmitClick}>
                  {" "}
                  Submit
                </button>
              </div>

              <div className="tri-column">
                <h1 className="score-top"> Overall Accuracy: </h1>
                <h1 className="score-bottom">{Math.round(score / 3)}%</h1>
              </div>
            </div>

            <div className="color-row">
              <div className="tri-column">
                <div className="color-container">
                  <h1
                    className="random-color"
                    style={{ backgroundColor: specialColor1 }}
                  >
                    {" "}
                  </h1>

                  <img src={chosenPhoto1} alt="" className="im"></img>

                  <h1
                    className="random-color-box"
                    style={{ backgroundColor: chosenPhotoColor1 }}
                  >
                    {" "}
                    {score1}
                  </h1>
                </div>
              </div>

              <div className="tri-column">
                <div className="color-container">
                  <h1
                    className="random-color"
                    style={{ backgroundColor: specialColor2 }}
                  >
                    {" "}
                  </h1>

                  <img src={chosenPhoto2} alt="" className="im"></img>

                  <h1
                    className="random-color-box"
                    style={{ backgroundColor: chosenPhotoColor2 }}
                  >
                    {" "}
                    {score2}
                  </h1>
                </div>
              </div>

              <div className="tri-column">
                <div className="color-container">
                  <h1
                    className="random-color"
                    style={{ backgroundColor: specialColor3 }}
                  >
                    {" "}
                  </h1>

                  <img src={chosenPhoto3} alt="" className="im"></img>

                  <h1
                    className="random-color-box"
                    style={{ backgroundColor: chosenPhotoColor3 }}
                  >
                    {" "}
                    {score3}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="right-column">
            <div className="container">
              <h1 className="title">Color Searcher</h1>
              <div className="rules">
                <p>
                  {" "}
                  <b>Rules:</b> For each colored square, search and click on an
                  image with a matching dominant color. There is no going back
                  once you select an image so choose carefully. Limit 2 searches
                  per color. Click submit when you have all 3 images. Click New
                  Colors to change the colors.{" "}
                </p>

                <p>
                  {" "}
                  <b>Note:</b> For added difficulty, don't lookup any colors
                  directly (Orange, Lilac, Green, Red , Yellow, etc...){" "}
                </p>
              </div>
              {errorMsg && <p className="error-msg">{errorMsg}</p>}
              <div className="search-section">
                <Form onSubmit={handleSearch}>
                  <Form.Control
                    type="search"
                    placeholder="Type something to search..."
                    className="search-input"
                    ref={searchInput}
                  />
                </Form>
              </div>
              <div className="filters">
                <div onClick={() => handleSelection("nature")}>Nature</div>
                <div onClick={() => handleSelection("birds")}>Birds</div>
                <div onClick={() => handleSelection("cats")}>Cats</div>
                <div onClick={() => handleSelection("shoes")}>Shoes</div>
              </div>
              {loading ? (
                <p className="loading">Loading...</p>
              ) : (
                <>
                  <div className="images">
                    {images.map((image) => (
                      <img
                        key={image.id}
                        src={image.urls.small}
                        alt={image.alt_description}
                        className="image"
                        onClick={() => handleImageClick(image.urls.small)}
                      />
                    ))}
                  </div>
                  <div className="buttons">
                    {page > 1 && (
                      <Button onClick={() => setPage(page - 1)}>
                        Previous
                      </Button>
                    )}
                    {page < totalPages && (
                      <Button onClick={() => setPage(page + 1)}>Next</Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
