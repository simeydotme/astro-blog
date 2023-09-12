export const imageZoom = () => {

  let $images:NodeListOf<HTMLImageElement> | null = document.querySelectorAll('.prose img');

  $images.forEach(($image:HTMLImageElement) => {

    $image.classList.add('zoomer');
    $image.addEventListener( 'click', () => {

      let $zoomedImage:HTMLImageElement = document.createElement('img');
      let $zoomedContainer:HTMLDivElement = document.createElement('div');
      let $zoomedContainerBackground:HTMLDivElement = document.createElement('div');
      let $zoomedContainerClose:HTMLButtonElement = document.createElement('button');

      $zoomedImage.src = $image.src;
      $zoomedImage.alt = $image.alt;
      $zoomedImage.classList.add('zoomed-image');
      $zoomedContainer.classList.add('zoomed-container');
      if ( $image.width <= (document.body.clientWidth - 100) ) {
        $zoomedContainer.classList.add('bottom');
      }
      $zoomedContainerBackground.classList.add('zoomed-container-background');
      $zoomedContainerClose.classList.add('zoomed-container-close');
      $zoomedContainerClose.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="m12 14.121l5.303 5.304a1.5 1.5 0 0 0 2.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 1 0-2.122-2.121L12 9.879L6.697 4.576a1.5 1.5 0 1 0-2.122 2.12L9.88 12l-5.304 5.303a1.5 1.5 0 1 0 2.122 2.122L12 14.12Z"/></g></svg>';

      $zoomedContainer.appendChild($zoomedImage);
      $zoomedContainer.appendChild($zoomedContainerBackground);

      document.body.appendChild($zoomedContainer);
      document.body.appendChild($zoomedContainerClose);
      document.body.classList.add('zoomed');
      document.body.parentElement?.classList.add('zoomed');

      const closeZoomedImage = () => {
        $zoomedContainer.remove();
        $zoomedContainerClose.remove();
        document.body.classList.remove('zoomed');
        document.body.parentElement?.classList.remove('zoomed');
        $zoomedContainer.removeEventListener( 'click', closeZoomedImage );
      }

      $zoomedContainer.addEventListener( 'click', closeZoomedImage );

    });

  });

};

imageZoom();