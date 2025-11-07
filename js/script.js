document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

  // Lenis 스무스 스크롤 초기화
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP과 Lenis 연동
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // 섹션 스냅 효과 - 각 섹션에 강하게 고정
  const sections = gsap.utils.toArray("section");
  sections.forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      snap: {
        snapTo: 1,
        duration: 0.8,
        delay: 0,
        ease: "power2.inOut",
      },
      onEnter: () => {
        lenis.scrollTo(section, { offset: 0, duration: 0.8 });
      },
    });
  });

  // banner-section에도 스냅 효과 추가
  const bannerSnapSection = document.querySelector(".banner-section");
  if (bannerSnapSection) {
    ScrollTrigger.create({
      trigger: bannerSnapSection,
      start: "top top",
      end: "bottom top",
      snap: {
        snapTo: 1,
        duration: 0.8,
        delay: 0,
        ease: "power2.inOut",
      },
      onEnter: () => {
        lenis.scrollTo(bannerSnapSection, { offset: 0, duration: 0.8 });
      },
    });
  }

  // 헤더 스크롤 진행률 애니메이션
  const header = document.querySelector(".header");
  const navLinks = document.querySelectorAll(".header .nav a");
  const section3 = document.querySelector(".section3");
  const section4 = document.querySelector(".section4");
  const section5 = document.querySelector(".section5");
  const section6 = document.querySelector(".section6");

  console.log("Sections found:", {
    section3: section3,
    section4: section4,
    section5: section5,
    section6: section6,
  });
  console.log("Nav links:", navLinks.length);

  // About 섹션부터 페이지 끝까지 헤더 항상 보이기
  ScrollTrigger.create({
    trigger: ".section3",
    start: "top bottom",
    end: "max",
    onEnter: () => header.classList.add("visible"),
    onLeaveBack: () => header.classList.remove("visible"),
  });

  // 전체 스크롤 진행률 계산 함수
  function updateHeaderFill() {
    const sections = [section3, section4, section5, section6].filter(
      (s) => s !== null
    );
    const scrollY = window.scrollY;

    navLinks.forEach((link, index) => {
      const currentSection = sections[index];
      if (!currentSection) {
        return;
      }

      const sectionTop = currentSection.offsetTop;
      const sectionBottom = sectionTop + currentSection.offsetHeight;
      let fillPercent = 0;

      if (index === 3 && section5) {
        // Contact 헤더 - section5 끝에서부터 section6 시작까지 점점 채우기
        const section5Bottom = section5.offsetTop + section5.offsetHeight;

        if (scrollY >= sectionTop) {
          // section6 도달 - 100%
          fillPercent = 100;
        } else if (scrollY >= section5Bottom) {
          // section5 끝과 section6 시작 사이 - 점점 채우기
          const rangeHeight = sectionTop - section5Bottom;
          const progressInRange = scrollY - section5Bottom;
          fillPercent = (progressInRange / rangeHeight) * 100;
        } else {
          // section5 내부 - 0%
          fillPercent = 0;
        }
      } else {
        // 나머지 헤더들
        const nextSection = sections[index + 1];

        if (nextSection) {
          const nextSectionTop = nextSection.offsetTop;

          if (scrollY >= nextSectionTop) {
            // 다음 섹션에 도달 - 100% 유지
            fillPercent = 100;
          } else if (scrollY >= sectionTop) {
            // 현재 섹션 내부 - 100% 채움
            fillPercent = 100;
          } else if (index > 0 && sections[index - 1]) {
            // 이전 섹션에서 현재 섹션으로 이동 중
            const prevSection = sections[index - 1];
            const prevTop = prevSection.offsetTop;

            if (scrollY >= prevTop && scrollY < sectionTop) {
              const rangeHeight = sectionTop - prevTop;
              const progressInRange = scrollY - prevTop;
              fillPercent = (progressInRange / rangeHeight) * 100;
            }
          } else if (index === 0) {
            // 첫 번째 링크
            if (scrollY > 0 && scrollY < sectionTop) {
              fillPercent = (scrollY / sectionTop) * 100;
            }
          }
        } else {
          // 다음 섹션이 없는 경우
          if (scrollY >= sectionTop) {
            fillPercent = 100;
          } else if (index > 0 && sections[index - 1]) {
            const prevSection = sections[index - 1];
            const prevTop = prevSection.offsetTop;

            if (scrollY >= prevTop && scrollY < sectionTop) {
              const rangeHeight = sectionTop - prevTop;
              const progressInRange = scrollY - prevTop;
              fillPercent = (progressInRange / rangeHeight) * 100;
            }
          }
        }
      }

      // fillPercent가 100을 넘지 않도록 제한
      fillPercent = Math.min(100, Math.max(0, fillPercent));

      link.style.background = `linear-gradient(to right, #000 ${fillPercent}%, transparent ${fillPercent}%)`;

      const span = link.querySelector("span");
      if (span) {
        span.style.color = fillPercent > 50 ? "#fff" : "#000";
      }
    });
  }

  // 스크롤 이벤트 리스너
  window.addEventListener("scroll", updateHeaderFill);
  // 초기 실행
  updateHeaderFill();

  // 초기 상태 설정: 배경 원형과 내용 요소들 숨기기
  gsap.set(".samsung-bg, .jeju-bg, .orbit-bg", { scale: 0 });
  gsap.set(
    ".samsung-title, .jeju-title, .orbit-title, .samsung-subtitle, .jeju-subtitle, .orbit-subtitle, .samsung-des, .jeju-des, .orbit-des, .samsung-btn, .jeju-btn, .orbit-btn",
    {
      opacity: 0,
      y: 30,
    }
  );

  // Etc Work 섹션 초기 상태 설정
  gsap.set(".graduation-fashion", { opacity: 0, y: 50 });
  gsap.set(".fashion-title", { opacity: 0 });
  gsap.set(".fashion-text", { opacity: 0, y: 20 });
  gsap.set(".toggle-container", { opacity: 0, y: 20 });

  // Contact 섹션 초기 상태 설정
  gsap.set(".contect-title", { opacity: 0 });

  // 첫 번째 슬라이드 (삼성) 초기 애니메이션
  setTimeout(() => {
    const firstSlide = document.querySelector(".swiper-slide:first-child");
    if (firstSlide) {
      const timeline = gsap.timeline();

      // 배경 원형 먼저
      timeline.to(firstSlide.querySelector(".samsung-bg"), {
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      });

      // 내용 요소들 순차적으로
      timeline
        .to(
          firstSlide.querySelector(".samsung-title"),
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .to(
          firstSlide.querySelector(".samsung-subtitle"),
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          firstSlide.querySelector(".samsung-des"),
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2"
        )
        .to(
          firstSlide.querySelector(".samsung-btn"),
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.1"
        )
        .call(() => {
          // 바 애니메이션 실행
          const titleElement = firstSlide.querySelector(".samsung-title");
          if (titleElement) {
            titleElement.classList.add("animate-bar");
          }
        });
    }
  }, 500); // 페이지 로드 후 0.5초 대기

  // Lenis는 상단에서 이미 초기화됨

  gsap.set(".image-motion", {
    transform: "scaleY(0)",
  });

  gsap.to(".image-motion", {
    transform: "scaleY(1)",
    scrollTrigger: {
      trigger: ".section2",
      start: "top 100%",
      end: "top 0%",
      scrub: 2,
      // markers: true,
    },
  });

  // 웹사이트 작업 슬라이더
  const swiper = new Swiper(".website-slider", {
    // Optional parameters
    direction: "horizontal",
    loop: true,

    // If we need pagination
    pagination: {
      el: ".website-slider-wrap .swiper-pagination",
    },

    // Navigation arrows
    navigation: {
      nextEl: ".website-slider-wrap .button-next",
      prevEl: ".website-slider-wrap .button-prev",
    },

    // 슬라이드 변경 시 순차적 애니메이션 (배경 원형 → 내용)
    on: {
      slideChangeTransitionStart: function () {
        // 슬라이드 전환 시작할 때 모든 요소 숨기기
        const activeSlide = document.querySelector(".swiper-slide-active");
        if (activeSlide) {
          // 배경 원형 축소
          const bgElements = activeSlide.querySelectorAll(
            ".samsung-bg, .jeju-bg, .orbit-bg"
          );
          bgElements.forEach((el) => {
            gsap.set(el, { scale: 0 });
          });

          // 내용 요소들 숨기기
          const contentElements = activeSlide.querySelectorAll(
            ".samsung-title, .jeju-title, .orbit-title, .samsung-subtitle, .jeju-subtitle, .orbit-subtitle, .samsung-des, .jeju-des, .orbit-des, .samsung-btn, .jeju-btn, .orbit-btn"
          );
          contentElements.forEach((el) => {
            gsap.set(el, { opacity: 0, y: 30 });
            el.classList.remove("animate-bar", "hide-bar");
          });
        }
      },

      slideChangeTransitionEnd: function () {
        // 슬라이드 전환 완료 후 순차적 애니메이션 실행
        const activeSlide = document.querySelector(".swiper-slide-active");
        if (activeSlide) {
          const timeline = gsap.timeline();

          // 1단계: 배경 원형 확대
          const bgElements = activeSlide.querySelectorAll(
            ".samsung-bg, .jeju-bg, .orbit-bg"
          );
          timeline.to(bgElements, {
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
          });

          // 2단계: 내용 요소들 순차적으로 나타내기
          const titleElements = activeSlide.querySelectorAll(
            ".samsung-title, .jeju-title, .orbit-title"
          );
          const subtitleElements = activeSlide.querySelectorAll(
            ".samsung-subtitle, .jeju-subtitle, .orbit-subtitle"
          );
          const descElements = activeSlide.querySelectorAll(
            ".samsung-des, .jeju-des, .orbit-des"
          );
          const btnElements = activeSlide.querySelectorAll(
            ".samsung-btn, .jeju-btn, .orbit-btn"
          );

          timeline
            .to(
              titleElements,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
              },
              "-=0.4"
            )
            .to(
              subtitleElements,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.3"
            )
            .to(
              descElements,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.2"
            )
            .to(
              btnElements,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.1"
            )
            .call(() => {
              // 마지막에 바 애니메이션 실행
              titleElements.forEach((el) => {
                el.classList.add("animate-bar");
              });
            });
        }
      },
    },
  });

  // 섹션별로 마스크 애니메이션 적용

  // 섹션1 - myMask (motion-path와 함께 타임라인으로 처리되므로 여기서는 설정만)
  const maskPaths1 = document.querySelectorAll("#myMask path");
  gsap.set(maskPaths1, { drawSVG: "0% 0%" });

  // 섹션3 - myMask2 (About)
  const maskPaths2 = document.querySelectorAll("#myMask2 path");
  gsap.set(maskPaths2, { drawSVG: "0% 0%" });
  gsap.to(maskPaths2, {
    drawSVG: "0% 100%",
    duration: 0.8,
    stagger: 0.2,
    stroke: "#fff",
    strokeWidth: 80,
    scrollTrigger: {
      trigger: ".about-title .wrap",
      start: "top 80%",
      toggleActions: "play none none reverse",
      // markers: true,
    },
  });

  // 섹션4 - Project 애니메이션 (스크롤할 때마다 재생)
  function createProjectAnimation() {
    console.log("Creating Project animation");

    // 요소 존재 확인
    const samsungProject = document.querySelector(".samsung-project");
    const bgElements = document.querySelectorAll(
      ".samsung-bg, .jeju-bg, .orbit-bg"
    );

    if (!samsungProject || bgElements.length === 0) {
      console.error("Project elements not found:", {
        samsungProject: !!samsungProject,
        bgElements: bgElements.length,
      });
      return;
    }

    const projectTimeline = gsap.timeline();

    // 초기 상태로 리셋
    gsap.set(samsungProject, { scale: 1 });
    gsap.set(bgElements, { scale: 0 });

    // 모든 바 애니메이션 클래스 제거
    document
      .querySelectorAll(".samsung-title, .jeju-title, .orbit-title")
      .forEach((el) => {
        el.classList.remove("animate-bar", "hide-bar");
      });

    // 애니메이션 실행
    projectTimeline
      .to(
        samsungProject,
        {
          scale: 0.615,
          duration: 2,
          ease: "power2.out",
        },
        0
      )
      .to(
        bgElements,
        {
          scale: 1,
          duration: 2,
          ease: "power2.out",
        },
        0
      )
      .call(
        () => {
          console.log("Starting bar animations");
          // 현재 활성 슬라이드의 바만 애니메이션
          const activeSlide = document.querySelector(".swiper-slide-active");
          if (activeSlide) {
            const currentTitleElements = activeSlide.querySelectorAll(
              ".samsung-title, .jeju-title, .orbit-title"
            );

            currentTitleElements.forEach((el) => {
              el.classList.remove("hide-bar");
              el.classList.add("animate-bar");
            });
          }
        },
        [],
        1.5
      );

    return projectTimeline;
  }

  // ScrollTrigger로 섹션에 들어올 때마다 애니메이션 재생
  ScrollTrigger.create({
    trigger: ".section4",
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => {
      console.log("Section4 entered - starting animation");
      createProjectAnimation();
    },
    onEnterBack: () => {
      console.log("Section4 entered back - restarting animation");
      createProjectAnimation();
    },
    // markers: true,
  });

  gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

  // 섹션5 - Etc Work 애니메이션 (스크롤할 때마다 재생)
  function createEtcWorkAnimation() {
    console.log("Creating Etc Work animation");

    // 요소 존재 확인
    const etcTitle = document.querySelector(".etc-work-title");
    const graduationFashion = document.querySelector(".graduation-fashion");
    const fashionTitle = document.querySelector(".fashion-title");

    if (!etcTitle || !graduationFashion || !fashionTitle) {
      console.error("Etc Work elements not found:", {
        etcTitle: !!etcTitle,
        graduationFashion: !!graduationFashion,
        fashionTitle: !!fashionTitle,
      });
      return;
    }

    const etcWorkTimeline = gsap.timeline();

    // 초기 상태로 리셋
    gsap.set(etcTitle, { scale: 1 });
    gsap.set(graduationFashion, { opacity: 0, y: 50 });
    gsap.set(fashionTitle, { opacity: 0 });
    gsap.set(".fashion-text", { opacity: 0, y: 20 });
    gsap.set(".toggle-container", { opacity: 0, y: 20 });

    // 애니메이션 실행
    etcWorkTimeline
      .to(
        etcTitle,
        {
          scale: 0.615,
          duration: 2,
          ease: "power2.out",
        },
        0
      )
      .fromTo(
        graduationFashion,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
        },
        1.5
      )
      .call(
        () => {
          console.log(
            "Gallery animation completed, showing text with scramble effect"
          );
          const fashionTitle = document.querySelector(".fashion-title");
          if (fashionTitle) {
            // 먼저 텍스트를 보이게 하면서 스크램블 시작
            gsap.to(fashionTitle, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            });

            // fashion-title 스크램블 완료 후 fashion-text와 toggle-container 함께 나타내기
            // (runScramble에서 복구가 완료되면 원본 텍스트가 보이므로, 여기서는 약간의 딜레이를 준다)
            setTimeout(() => {
              const fashionText = document.querySelector(".fashion-text");
              const toggleContainer =
                document.querySelector(".toggle-container");

              if (fashionText && toggleContainer) {
                const textTimeline = gsap.timeline();
                textTimeline.to([fashionText, toggleContainer], {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  stagger: 0.1,
                });
              }
            }, 300);
          }
        },
        [],
        3.5
      );

    return etcWorkTimeline;
  }

  // ScrollTrigger로 섹션에 들어올 때마다 애니메이션 재생
  ScrollTrigger.create({
    trigger: ".section5",
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => {
      console.log("Section5 entered - starting animation");
      createEtcWorkAnimation();
    },
    onEnterBack: () => {
      console.log("Section5 entered back - restarting animation");
      createEtcWorkAnimation();
    },
    // markers: true,
  });

  // motion-path 애니메이션
  const motionPathTimeline = gsap.timeline();

  motionPathTimeline.from("#motion-path", {
    delay: 2,
    duration: 0.8,
    ease: "power2.inOut",
    drawSVG: 0,
  });

  // motion-path 후에 maskPaths1 실행
  motionPathTimeline.to(
    "#myMask path",
    {
      drawSVG: "0% 100%",
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.inOut",
      stroke: "#fff",
      strokeWidth: 50,
    },
    "+=0.5"
  ); // motion-path 끝나고 0.5초 후 시작

  // 이미지 모달 기능 - 강화된 초기화
  function initializeModal() {
    console.log("Attempting to initialize modal...");

    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const modalClose = document.getElementById("modalClose");
    const modalOverlay = document.querySelector(".modal-overlay");
    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");
    const thumbnails = document.querySelectorAll(".thumbnail");

    console.log("Modal elements check:", {
      modal: !!modal,
      modalImage: !!modalImage,
      modalClose: !!modalClose,
      modalOverlay: !!modalOverlay,
      modalPrev: !!modalPrev,
      modalNext: !!modalNext,
      thumbnails: thumbnails.length,
    });

    if (!modal) {
      console.error("Modal not found!");
      return;
    }

    if (!modalImage) {
      console.error("Modal image not found!");
      return;
    }

    if (thumbnails.length === 0) {
      console.error("No thumbnails found!");
      return;
    }

    // 이미 초기화되었는지 확인
    if (modal.dataset.initialized === "true") {
      console.log("Modal already initialized");
      return;
    }

    console.log("Initializing modal with", thumbnails.length, "thumbnails");

    // 전역 변수로 선언하여 모든 이벤트 리스너에서 접근 가능
    let currentImageIndex = 0;
    const imageList = Array.from(thumbnails).map(
      (thumb) => thumb.dataset.image
    );

    console.log("Image list:", imageList);

    // 이미지 업데이트 함수
    function updateModalImage() {
      console.log(
        "Updating image to index:",
        currentImageIndex,
        "Image:",
        imageList[currentImageIndex]
      );
      modalImage.src = imageList[currentImageIndex];
    }

    // 썸네일 클릭 이벤트
    thumbnails.forEach((thumbnail, index) => {
      console.log(
        "Adding event listener to thumbnail",
        index,
        thumbnail.dataset.image
      );

      // 기존 이벤트 리스너 제거 (중복 방지)
      thumbnail.removeEventListener("click", thumbnail._modalClickHandler);

      // 새 이벤트 핸들러 생성
      thumbnail._modalClickHandler = (e) => {
        console.log("Thumbnail clicked:", index, thumbnail.dataset.image);
        e.preventDefault();
        e.stopPropagation();

        currentImageIndex = index;
        updateModalImage();
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      };

      // 이벤트 리스너 추가
      thumbnail.addEventListener("click", thumbnail._modalClickHandler);

      // 썸네일에 포인터 커서 스타일 추가
      thumbnail.style.cursor = "pointer";
    });

    // 초기화 완료 표시
    modal.dataset.initialized = "true";
    console.log("Modal initialization completed successfully!"); // 모달 닫기
    function closeModal() {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", closeModal);
    }

    // 이전/다음 이미지 네비게이션
    if (modalPrev && modalNext) {
      modalPrev.addEventListener("click", (e) => {
        console.log(
          "Previous button clicked, current index:",
          currentImageIndex
        );
        e.preventDefault();
        e.stopPropagation();
        currentImageIndex =
          currentImageIndex > 0 ? currentImageIndex - 1 : imageList.length - 1;
        updateModalImage();
      });

      modalNext.addEventListener("click", (e) => {
        console.log("Next button clicked, current index:", currentImageIndex);
        e.preventDefault();
        e.stopPropagation();
        currentImageIndex =
          currentImageIndex < imageList.length - 1 ? currentImageIndex + 1 : 0;
        updateModalImage();
      });

      // 버튼에 시각적 피드백 추가
      modalPrev.style.cursor = "pointer";
      modalNext.style.cursor = "pointer";

      console.log("Navigation buttons initialized successfully");
    } else {
      console.error("Modal navigation buttons not found:", {
        modalPrev: !!modalPrev,
        modalNext: !!modalNext,
      });
    }

    // 키보드 이벤트
    document.addEventListener("keydown", (e) => {
      if (modal && modal.classList.contains("active")) {
        if (e.key === "Escape") {
          closeModal();
        } else if (e.key === "ArrowLeft") {
          console.log("Left arrow pressed");
          currentImageIndex =
            currentImageIndex > 0
              ? currentImageIndex - 1
              : imageList.length - 1;
          updateModalImage();
        } else if (e.key === "ArrowRight") {
          console.log("Right arrow pressed");
          currentImageIndex =
            currentImageIndex < imageList.length - 1
              ? currentImageIndex + 1
              : 0;
          updateModalImage();
        }
      }
    });
  }

  // 모달 초기화를 여러 번 시도
  setTimeout(initializeModal, 500);
  setTimeout(initializeModal, 1000);
  setTimeout(initializeModal, 2000);

  // 텍스트 스크램블 효과 초기화 (SplitText 없이 구현)
  function initTextScramble() {
    const fashionTitle = document.querySelector(".fashion-title");
    if (!fashionTitle) {
      console.log("Fashion title not found");
      return;
    }

    console.log("Fashion title found:", fashionTitle.textContent);

    const originalText = fashionTitle.textContent;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let isScrambling = false;

    function scrambleText() {
      if (isScrambling) return;
      isScrambling = true;
      console.log("Starting scramble effect (via runScramble)");

      // 사용한 공용 함수로 스크램블 수행
      if (typeof runScramble === "function") {
        runScramble(fashionTitle);
        // runScramble는 자체적으로 복구를 수행하므로, 상태 플래그는 타임아웃으로 해제
        setTimeout(() => {
          isScrambling = false;
          console.log("Scramble effect completed (via runScramble)");
        }, 50 * 20 + 20);
      } else {
        isScrambling = false;
      }
    }

    console.log(
      "Text scramble effect initialized - will be triggered by timeline"
    );
  }

  // 공용 스크램블 함수: 중복 실행 방지 및 확실한 복구 보장
  function runScramble(el, maxIterations = 20, intervalMs = 50) {
    if (!el) return;
    // 기존 인터벌이 있으면 제거
    if (el._scrambleInterval) {
      clearInterval(el._scrambleInterval);
      el._scrambleInterval = null;
    }

    const originalText = el.textContent;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let iterations = 0;

    el._scrambleInterval = setInterval(() => {
      el.textContent = originalText
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";

          if (iterations < maxIterations - 5) {
            return letters[Math.floor(Math.random() * letters.length)];
          } else {
            const revealIndex =
              (iterations - (maxIterations - 5)) * (originalText.length / 5);
            if (index < revealIndex) {
              return originalText[index];
            } else {
              return letters[Math.floor(Math.random() * letters.length)];
            }
          }
        })
        .join("");

      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(el._scrambleInterval);
        el._scrambleInterval = null;
        // 확실하게 원본 텍스트 복구 (약간의 지연을 두고 재할당)
        setTimeout(() => {
          el.textContent = originalText;
        }, 10);
      }
    }, intervalMs);
  }

  // 토글 스위치 기능 초기화
  function initToggleSwitch() {
    const toggle = document.getElementById("fashionToggle");
    const toggleText = document.querySelector(".toggle-text");
    const fashionDescription = document.querySelector(".fashion-description");

    console.log("InitToggleSwitch called");
    console.log("Toggle element:", toggle);
    console.log("Toggle text:", toggleText);
    console.log("Fashion description:", fashionDescription);

    if (toggle && toggleText && fashionDescription) {
      console.log("Toggle switch initialized - all elements found");

      // 초기 상태 설정 (흑백 모드)
      const images = document.querySelectorAll(
        ".fashion-gallery img, .fashion-gallery video, .graduation-fashion img, .graduation-fashion video, .thumbnail-row img"
      );
      console.log("Found images for toggle:", images.length);
      images.forEach((img, index) => {
        console.log(`Setting initial grayscale for image ${index}:`, img);
        img.classList.remove("color-filter");
        img.classList.add("grayscale-filter");
      });

      // 토글 텍스트 초기값 설정
      // toggleText.textContent = "Color Mode";

      toggle.addEventListener("change", (e) => {
        const images = document.querySelectorAll(
          ".fashion-gallery img, .fashion-gallery video, .graduation-fashion img, .graduation-fashion video, .thumbnail-row img"
        );

        console.log(
          "Toggle changed:",
          e.target.checked,
          "Images found:",
          images.length
        );

        if (e.target.checked) {
          // 컬러 모드
          // toggleText.textContent = "Grayscale Mode";
          images.forEach((img, index) => {
            console.log(`Switching to color mode for image ${index}:`, img);
            img.classList.remove("grayscale-filter");
            img.classList.add("color-filter");
            img.style.filter = "grayscale(0%)";
          });
        } else {
          // 흑백 모드
          // toggleText.textContent = "Color Mode";
          images.forEach((img, index) => {
            console.log(`Switching to grayscale mode for image ${index}:`, img);
            img.classList.remove("color-filter");
            img.classList.add("grayscale-filter");
            img.style.filter = "grayscale(100%)";
          });
        }
      });
    } else {
      console.error("Toggle switch elements not found");
    }
  }

  // 텍스트 스크램블 효과를 더 일찍 초기화
  setTimeout(() => {
    initTextScramble();
    initToggleSwitch();
  }, 500);

  // 추가 디버깅: 페이지 로드 후에도 한번 더 확인
  window.addEventListener("load", () => {
    console.log("Window loaded, checking thumbnails again...");
    const thumbnails = document.querySelectorAll(".thumbnail");
    console.log("Found thumbnails after window load:", thumbnails.length);

    // 텍스트 스크램블 효과 다시 시도
  });

  // 간단하고 직접적인 모달 구현
  console.log("Setting up simple modal...");

  // 썸네일 요소들에 시각적 표시 추가
  setTimeout(() => {
    const thumbnails = document.querySelectorAll(".thumbnail");
    console.log("Found thumbnails for modal:", thumbnails.length);

    thumbnails.forEach((thumb, index) => {
      // 썸네일 스타일 설정
      thumb.style.cursor = "pointer";
      thumb.title = `Click to open image ${index + 1}`;

      console.log(`Thumbnail ${index}:`, thumb.dataset.image);
    });
  }, 1000);

  // 모든 썸네일에 직접 이벤트 추가 (이벤트 위임)
  document.addEventListener("click", function (e) {
    console.log("Click detected on:", e.target);

    const thumbnail = e.target.closest(".thumbnail");
    if (thumbnail) {
      console.log("Thumbnail direct click detected!", thumbnail);
      e.preventDefault();
      e.stopPropagation();

      const modal = document.getElementById("imageModal");
      const modalImage = document.getElementById("modalImage");

      if (modal && modalImage) {
        const imageSrc =
          thumbnail.dataset.image || thumbnail.querySelector("img")?.src;
        console.log("Opening modal with image:", imageSrc);

        modalImage.src = imageSrc;
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      } else {
        console.error("Modal elements not found:", {
          modal: !!modal,
          modalImage: !!modalImage,
        });
      }
    }
  });

  // 모달 닫기 이벤트
  document.addEventListener("click", function (e) {
    const modal = document.getElementById("imageModal");
    const modalClose = document.getElementById("modalClose");
    const modalOverlay = e.target.classList.contains("modal-overlay");

    if (e.target === modalClose || modalOverlay) {
      console.log("Closing modal");
      modal?.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("imageModal");
      modal?.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // Banner Carousel 기능
  const bannerData = [
    {
      title: "HARIBO",
      description: "HARIBO Banner Design",
      color: "#FFD700",
    },
    {
      title: "STARBUCKS",
      description: "Banner Design",
      color: "#00704A",
    },
    {
      title: "YES24 X 여기어때",
      description: "Banner Design",
      color: "#6bb502",
    },
    {
      title: "홈 포장마차",
      description: "Banner Design",
      color: "#ec6e3c",
    },
    {
      title: "MEGABOX",
      description: " MEGABOX X GS 칼텍스 Banner Design",
      color: "#0171bb",
    },
    {
      title: "OldFerryDount",
      description: "OldFerryDount X Starbucks Banner Design",
      color: "#3cb6aa",
    },
    {
      title: "OldFerryDount(2)",
      description: "OldFerryDount X Starbucks Banner Design",
      color: "#e104b5",
    },
    {
      title: "MineCraft",
      description: "MineCraft X 동물의 숲 Banner Design",
      color: "#42af53",
    },
    {
      title: "MapleStory",
      description: "MapleStory X SANRIO Banner Design",
      color: "#3814cd",
    },
    {
      title: "BattleGround",
      description: "BattleGround X HYUNDEI Banner Design",
      color: "#dcac18",
    },
    {
      title: "프로젝트 11",
      description: "설명 11",
      color: "#32CD32",
    },
    {
      title: "프로젝트 12",
      description: "설명 12",
      color: "#FF4500",
    },
  ];

  const bannerCards = document.querySelectorAll(".banner-card");
  const bannerDots = document.querySelectorAll(".banner-dots .dot");
  const bannerTitle = document.querySelector(".banner-title");
  const bannerDescription = document.querySelector(".banner-description");
  const upArrow = document.querySelector(".banner-section .nav-arrow.up");
  const downArrow = document.querySelector(".banner-section .nav-arrow.down");
  const bannerContainer = document.querySelector(".banner-container");
  const detailPanel = document.querySelector(".detail-panel");

  let currentBannerIndex = 0;
  let isBannerAnimating = false;

  function updateBannerClasses() {
    const totalCards = bannerCards.length;

    bannerCards.forEach((card, index) => {
      card.classList.remove(
        "active",
        "prev-1",
        "prev-2",
        "next-1",
        "next-2",
        "hidden"
      );

      const diff = (index - currentBannerIndex + totalCards) % totalCards;

      if (diff === 0) {
        card.classList.add("active");
      } else if (diff === totalCards - 1) {
        card.classList.add("prev-1");
      } else if (diff === totalCards - 2) {
        card.classList.add("prev-2");
      } else if (diff === 1) {
        card.classList.add("next-1");
      } else if (diff === 2) {
        card.classList.add("next-2");
      } else {
        card.classList.add("hidden");
      }
    });

    // Update dots
    bannerDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentBannerIndex);
    });

    // Update text with animation
    if (bannerTitle && bannerDescription) {
      bannerTitle.style.opacity = "0";
      bannerDescription.style.opacity = "0";

      setTimeout(() => {
        bannerTitle.textContent = bannerData[currentBannerIndex].title;
        bannerDescription.textContent =
          bannerData[currentBannerIndex].description;

        // 배너마다 다른 색상의 밑줄 적용
        const color = bannerData[currentBannerIndex].color;
        bannerTitle.style.setProperty("--underline-color", color);

        bannerTitle.style.opacity = "1";
        bannerDescription.style.opacity = "1";
      }, 150);
    }
  }

  function nextBanner() {
    if (isBannerAnimating) return;
    isBannerAnimating = true;
    currentBannerIndex = (currentBannerIndex + 1) % bannerCards.length;
    updateBannerClasses();
    setTimeout(() => {
      isBannerAnimating = false;
    }, 500);
  }

  function prevBanner() {
    if (isBannerAnimating) return;
    isBannerAnimating = true;
    currentBannerIndex =
      (currentBannerIndex - 1 + bannerCards.length) % bannerCards.length;
    updateBannerClasses();
    setTimeout(() => {
      isBannerAnimating = false;
    }, 500);
  }

  if (upArrow) {
    upArrow.addEventListener("click", prevBanner);
  }

  if (downArrow) {
    downArrow.addEventListener("click", nextBanner);
  }

  if (bannerDots.length > 0) {
    bannerDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        if (isBannerAnimating || index === currentBannerIndex) return;
        isBannerAnimating = true;
        currentBannerIndex = index;
        updateBannerClasses();
        setTimeout(() => {
          isBannerAnimating = false;
        }, 500);
      });
    });
  }

  // 배너 컨테이너에서 마우스 휠로 카드 전환
  if (bannerContainer) {
    let wheelTimeout;
    bannerContainer.addEventListener(
      "wheel",
      (e) => {
        // 디테일 패널이 열려있으면 배너 휠 이벤트 무시
        if (detailPanel && detailPanel.classList.contains("active")) {
          return;
        }

        // 활성 카드 영역 위에서만 휠로 카드 전환
        const activeCard = document.querySelector(".banner-card.active");
        if (activeCard) {
          const rect = activeCard.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // 마우스가 활성 카드 영역 안에 있는지 확인
          const isInsideCard =
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom;

          if (isInsideCard) {
            // 카드 영역 안: 페이지 스크롤 방지, 카드만 전환
            e.preventDefault();
            e.stopPropagation();

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
              if (e.deltaY > 0) {
                nextBanner();
              } else if (e.deltaY < 0) {
                prevBanner();
              }
            }, 50);
          }
          // 카드 영역 밖: 아무것도 하지 않음 (페이지 스크롤 허용)
        }
      },
      { passive: false }
    );
  }

  // 초기 상태 설정
  if (bannerCards.length > 0) {
    updateBannerClasses();
  }

  // Detail Panel 기능
  const detailClose = document.querySelector(".detail-close");
  const detailImagesContainer = document.querySelector(".detail-images");

  // 배너별 디테일 이미지
  const detailData = [
    // [0] 배너 1: "HARIBO" - HARIBO Banner Design
    {
      images: [
        "./banner/haribo1.png", // 로컬 이미지 경로 예시
        "./banner/haribo2.png",
        "./banner/haribo3.png",
      ],
    },

    // [1] 배너 2: 스타벅스
    {
      images: [
        "./banner/star01.png",
        "./banner/star02.png",
        "./banner/star03.png",
      ],
    },

    // [2] 배너 3: yes24
    {
      images: ["./banner/yes02.png", "./banner/yes03.png"],
    },

    // [3] 배너 4: 홈포장마차
    {
      images: [
        "./banner/home1.png",
        "./banner/home2.png",
        "./banner/home3.png",
      ],
    },

    // [4] 배너 5: gs
    {
      images: ["./banner/gs1.png", "../banner/gs2.png", "./banner/gs3.png"],
    },

    // [5] 배너 6: 올드페리도넛 1
    {
      images: ["./banner/old1.png", "./banner/old2.png", "./banner/old3.png"],
    },

    // [6] 배너 7: 올드페리도넛 1
    {
      images: [
        "./banner/old01.png",
        "./banner/old02.png",
        "./banner/old03.png",
      ],
    },

    // [7] 배너 8: "프로젝트 8" - 설명 8
    {
      images: [
        "./banner/nin01.png",
        "./banner/nin02.png",
        "./banner/nin03.png",
      ],
    },

    // [8] 배너 9: 메이플스토리
    {
      images: [
        "./banner/maple01.png",
        "./banner/maple02.png",
        "./banner/maple03.png",
      ],
    },

    // [9] 배너 10: 배틀그라운드
    {
      images: ["./banner/bg1.png", "./banner/bg2.png", "./banner/bg3.png"],
    },

    // [10] 배너 11: "프로젝트 11" - 설명 11
    {
      images: ["./pic/project11_1.jpg", "./pic/project11_2.jpg"],
    },

    // [11] 배너 12: "프로젝트 12" - 설명 12
    {
      images: ["./pic/project12_1.jpg", "./pic/project12_2.jpg"],
    },
  ];

  // 활성 카드 클릭 시 detail panel 열기
  bannerCards.forEach((card, index) => {
    card.addEventListener("click", (e) => {
      if (!card.classList.contains("active")) return;

      e.stopPropagation(); // 배너 섹션 클릭 이벤트로 전파 방지

      // Update detail panel content
      const data = detailData[index];

      // Clear existing images
      detailImagesContainer.innerHTML = "";

      // Add new images dynamically
      data.images.forEach((imgSrc, imgIndex) => {
        const detailImageDiv = document.createElement("div");
        detailImageDiv.className = "detail-image";
        detailImageDiv.style.animationDelay = `${(imgIndex + 1) * 0.1}s`;

        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = `Detail ${imgIndex + 1}`;

        detailImageDiv.appendChild(img);
        detailImagesContainer.appendChild(detailImageDiv);
      });

      // Show detail panel
      bannerContainer.classList.add("detail-view");
      detailPanel.classList.add("active");
    });
  });

  // Detail panel 닫기
  if (detailClose) {
    detailClose.addEventListener("click", () => {
      bannerContainer.classList.remove("detail-view");
      detailPanel.classList.remove("active");
    });
  }

  // Detail panel 내에서 마우스 휠 스크롤 허용
  if (detailPanel) {
    detailPanel.addEventListener("wheel", (e) => {
      e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
    });

    // 디테일 패널 클릭은 이벤트 전파 중단 (패널 자체 클릭 시 닫히지 않도록)
    detailPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // 배너 섹션 클릭 시 디테일 패널 닫기 (패널 외부 클릭)
  const bannerSection = document.querySelector(".banner-section");
  if (bannerSection) {
    bannerSection.addEventListener("click", (e) => {
      if (detailPanel && detailPanel.classList.contains("active")) {
        // 패널이 열려있을 때만 닫기
        bannerContainer.classList.remove("detail-view");
        detailPanel.classList.remove("active");
      }
    });
  }

  // Banner Section Title 축소 애니메이션
  const bannerSectionTitle = document.querySelector(".banner-section-title");

  ScrollTrigger.create({
    trigger: ".banner-section",
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => {
      if (bannerSectionTitle) {
        bannerSectionTitle.classList.add("shrink");
      }
    },
    onLeaveBack: () => {
      if (bannerSectionTitle) {
        bannerSectionTitle.classList.remove("shrink");
      }
    },
    // markers: true,
  });

  // ESC 키로 detail panel 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailPanel.classList.contains("active")) {
      bannerContainer.classList.remove("detail-view");
      detailPanel.classList.remove("active");
    }
  });

  // Skill bar 애니메이션
  const skillItems = document.querySelectorAll(".skill-item");

  ScrollTrigger.create({
    trigger: ".skill",
    start: "top 80%",
    onEnter: () => {
      skillItems.forEach((item) => {
        item.classList.add("animate");
      });
    },
    onLeaveBack: () => {
      skillItems.forEach((item) => {
        item.classList.remove("animate");
      });
    },
  });

  ScrollTrigger.create({
    trigger: ".contect-section",
    start: "top 80%",
    onEnter: () => {},
    onLeaveBack: () => {
      if (contectTitle) {
        gsap.to(contectTitle, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
  });

  // Contact section dt 바 애니메이션
  const contectDts = document.querySelectorAll(".contect-info dl dt");

  ScrollTrigger.create({
    trigger: ".contect-section",
    start: "top 80%",
    onEnter: () => {
      contectDts.forEach((dt) => {
        dt.classList.add("animate");
      });
    },
    onLeaveBack: () => {
      contectDts.forEach((dt) => {
        dt.classList.remove("animate");
      });
    },
  });

  // 모든 ScrollTrigger 새로고침 (Lenis와 스냅 효과 적용 후)
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);

  // CONTACT 섹션 반짝반짝 효과 동적 생성
  function createContactSparkle() {
    const contactSection = document.querySelector(".contect-section");
    if (!contactSection) return;

    // 이미 sparkle-bg가 있으면 중복 생성 방지
    if (contactSection.querySelector(".sparkle-bg")) return;

    const sparkleBg = document.createElement("div");
    sparkleBg.className = "sparkle-bg";
    contactSection.appendChild(sparkleBg);

    // 랜덤 위치에 여러 개의 sparkle-dot 생성
    for (let i = 0; i < 12; i++) {
      const dot = document.createElement("div");
      dot.className = "sparkle-dot";
      // 랜덤 위치/크기/애니메이션 딜레이
      dot.style.top = Math.random() * 90 + "%";
      dot.style.left = Math.random() * 95 + "%";
      dot.style.width = dot.style.height = Math.random() * 0.4 + 0.2 + "px";
      dot.style.animationDelay = Math.random() * 2.5 + "s";
      sparkleBg.appendChild(dot);
    }
  }

  createContactSparkle();
});
