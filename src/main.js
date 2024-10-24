import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
const api = '6021301-359a47a130e708641e07d8eef';
const form = document.getElementById('search-form');
const searchbox = document.getElementById('searchbox');
const fetchButton = document.querySelector('.fetch-button');
const loader = document.querySelector('.loader');
const loaderAlt = document.querySelector('.loader-alt');
const containerGallery = document.querySelector('.portfolio-list');
let searchString = '';
let searchStringProcessed = '';
let page = 1;
let perPage = 20;

searchbox.addEventListener('input', evt => {
  searchString = evt.target.value.trim();
});

const galleryLightbox = new SimpleLightbox('.list-item-sp a', {
  scrollZoom: false,
  captionsData: 'alt',
  captionDelay: 250,
});

const resetImages = () => {
  page = 1;
  const imagesToRemove = document.querySelectorAll('.list-item-sp');
  if (imagesToRemove.length > 0) {
    imagesToRemove.forEach(imageToRemove => {
      imageToRemove.remove();
    });
  }
};

const updateStatus = totalHits => {
  if (totalHits <= perPage * page) {
    iziToast.error({
      title: 'Error',
      message: 'We are sorry, but you have reached the end of search results.!',
    });
  }
  page++;
};

const updateInterface = () => {
  loader.classList.add('hidden');
  loaderAlt.classList.add('hidden');
};

// const rows = () => {
//   let total = 0;
//   if (window.screen.width >= 1200) {
//     total = Math.ceil(perPage / 3);
//   } else if (window.screen.width >= 768 && window.screen.width < 1199) {
//     total = Math.ceil(perPage / 2);
//   } else {
//     total = perPage;
//   }
//   return total;
// };

form.addEventListener('submit', evt => {
  evt.preventDefault();
  if (searchString.length > 1) {
    resetImages();
    loader.classList.remove('hidden');
    searchStringProcessed = searchString.replaceAll(' ', '+');

    fetchImages()
      .then(images => {
        updateInterface();
        if (images.hits.length > 0) {
          updateStatus(images.totalHits);
          renderPosts(images.hits, true);
        } else {
          iziToast.error({
            title: 'Error',
            message:
              'Sorry, there are no images matching your search query. Please try again!',
          });
        }
      })
      .catch(error => {
        updateInterface();
        console.log(error);
      });
  } else {
    iziToast.error({
      title: 'Error',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
  }
});

fetchButton.addEventListener('click', evt => {
  evt.preventDefault();
  loaderAlt.classList.remove('hidden');
  fetchButton.classList.add('hidden');
  fetchImages()
    .then(images => {
      updateInterface();
      if (images.hits.length > 0) {
        updateStatus(images.totalHits);
        renderPosts(images.hits);
      } else {
        iziToast.error({
          title: 'Error',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
      }
    })
    .catch(error => {
      updateInterface();
      console.log(error);
    });
});

const fetchImages = async () => {
  const response = await axios.get(
    `https://pixabay.com/api/?key=${api}&q=${searchStringProcessed}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
  );
  return response.data;
};

function renderPosts(images, firstTime = false) {
  const htmlString = images
    .map(
      ({
        previewURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="list-item-sp"><a class="link" href="${largeImageURL}"><div class="card-image"><img src="${previewURL}" alt="${tags}" width="360" height="300"/></div><div class="info-data"><ul class="list details-list"><li class="image-detail"><span>Likes</span><br><span>${likes}</span></li><li class="image-detail"><span>Comments</span><br><span>${comments}</span></li><li class="image-detail"><span>Views</span><br><span>${views}</span></li><li class="image-detail"><span>Downloads</span><br><span>${downloads}</span></div></li></ul></div></a></li>`;
      }
    )
    .join('');

  if (firstTime) {
    containerGallery.innerHTML = htmlString;
  } else containerGallery.insertAdjacentHTML('beforeend', htmlString);
  galleryLightbox.refresh();
  fetchButton.classList.remove('hidden');
  // const nodes = document.querySelectorAll('.list-item-sp');
  // console.log(nodes[nodes.length - 1].getBoundingClientRect().y);

  window.scrollTo(0, containerGallery.getBoundingClientRect().height);
}
