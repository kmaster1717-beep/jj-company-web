document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State & Data (Notices & Posts)
    const DEFAULT_NOTICES = [
        {
            id: 1,
            titleKo: "첫번째 공지사항 테스트",
            titleEn: "First Notice Test",
            contentKo: "테스트1입니다.",
            contentEn: "This is test 1.",
            author: "관리자 (Admin)",
            date: "2026-08-17"
        }
    ];

    const DEFAULT_POSTS = [
        {
            id: 1,
            titleKo: "자유게시판 오픈을 축하합니다!",
            titleEn: "Welcome to our Community Board!",
            contentKo: "누구나 비밀번호 없이 자유롭게 의견을 나누실 수 있습니다. JJ컴퍼니에 의견을 남겨주세요.",
            contentEn: "Anyone can freely share thoughts without a password. Leave your ideas for JJ Company here.",
            author: "홍길동 (Gildong)",
            date: "2026-08-17"
        }
    ];

    // Initialize LocalStorage with default data if empty
    if (!localStorage.getItem('jj_notices')) {
        localStorage.setItem('jj_notices', JSON.stringify(DEFAULT_NOTICES));
    }
    if (!localStorage.getItem('jj_posts')) {
        localStorage.setItem('jj_posts', JSON.stringify(DEFAULT_POSTS));
    }

    let notices = JSON.parse(localStorage.getItem('jj_notices'));
    let posts = JSON.parse(localStorage.getItem('jj_posts'));
    let currentLang = 'ko';
    let currentOpenItem = null;
    let currentOpenType = null;

    // 2. DOM Elements
    const views = {
        home: document.getElementById('view-home'),
        notice: document.getElementById('view-notice'),
        board: document.getElementById('view-board'),
        apps: document.getElementById('view-apps')
    };

    const navItems = {
        home: document.getElementById('menu-home'),
        notice: document.getElementById('menu-notice'),
        board: document.getElementById('menu-board'),
        apps: document.getElementById('menu-apps')
    };

    const logoBtn = document.getElementById('logo-btn');
    const goNoticeBtn = document.getElementById('go-notice-btn');
    const goBoardBtn = document.getElementById('go-board-btn');
    const langKrBtn = document.getElementById('lang-kr');
    const langEnBtn = document.getElementById('lang-en');

    // Modals
    const writeModal = document.getElementById('write-modal');
    const postWriteModal = document.getElementById('post-write-modal');
    const detailModal = document.getElementById('detail-modal');

    // Write Notice Elements (Admin Only)
    const adminWriteBtn = document.getElementById('admin-write-btn');
    const writeModalClose = document.getElementById('write-modal-close');
    const writeModalCancel = document.getElementById('write-modal-cancel');
    const writeModalSubmit = document.getElementById('write-modal-submit');
    const inputNoticeTitle = document.getElementById('notice-title');
    const inputNoticeContent = document.getElementById('notice-content');

    // Write Post Elements (Everyone)
    const boardWriteBtn = document.getElementById('board-write-btn');
    const postWriteModalClose = document.getElementById('post-write-modal-close');
    const postWriteModalCancel = document.getElementById('post-write-modal-cancel');
    const postWriteModalSubmit = document.getElementById('post-write-modal-submit');
    const inputPostTitle = document.getElementById('post-title');
    const inputPostAuthor = document.getElementById('post-author');
    const inputPostContent = document.getElementById('post-content');

    // Detail Modal Elements
    const detailModalClose = document.getElementById('detail-modal-close');
    const detailModalConfirm = document.getElementById('detail-modal-confirm');

    // 3. SPA Navigation
    const switchView = (targetView) => {
        // Toggle view containers
        Object.keys(views).forEach(key => {
            if (key === targetView) {
                views[key].classList.remove('hidden');
            } else {
                views[key].classList.add('hidden');
            }
        });

        // Toggle nav items active state
        Object.keys(navItems).forEach(key => {
            if (key === targetView) {
                navItems[key].classList.add('active');
            } else {
                navItems[key].classList.remove('active');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Set nav links click events
    Object.keys(navItems).forEach(key => {
        navItems[key].addEventListener('click', (e) => {
            e.preventDefault();
            switchView(key);
        });
    });

    // Logo clicks returns to Home view
    logoBtn.addEventListener('click', () => switchView('home'));
    
    // More buttons click events
    if (goNoticeBtn) {
        goNoticeBtn.addEventListener('click', () => switchView('notice'));
    }
    if (goBoardBtn) {
        goBoardBtn.addEventListener('click', () => switchView('board'));
    }

    // Trigger "Go Home" buttons in placeholders
    document.querySelectorAll('.go-home-trigger').forEach(btn => {
        btn.addEventListener('click', () => switchView('home'));
    });

    // Home App List item click trigger
    const homeAppCurrencyBtn = document.getElementById('home-app-currency-btn');
    if (homeAppCurrencyBtn) {
        homeAppCurrencyBtn.addEventListener('click', () => switchView('apps'));
    }


    // 4. Render Functions
    const renderNotices = () => {
        const homeList = document.getElementById('home-notice-list');
        const boardTbody = document.getElementById('board-notice-tbody');

        homeList.innerHTML = '';
        boardTbody.innerHTML = '';

        // Render Home View Notice Highlights (Max 2 items)
        const latestNotices = [...notices].reverse().slice(0, 2);
        
        if (latestNotices.length === 0) {
            homeList.innerHTML = `
                <div class="empty-card notice-card-skeleton">
                    <div class="skeleton-content" style="text-align: center; padding: 20px;">
                        <p style="color: #888;">등록된 공지사항이 없습니다.</p>
                    </div>
                </div>`;
        } else {
            latestNotices.forEach(notice => {
                const title = currentLang === 'ko' ? notice.titleKo : notice.titleEn;
                const desc = currentLang === 'ko' ? notice.contentKo : notice.contentEn;
                
                const card = document.createElement('div');
                card.className = 'empty-card notice-card-skeleton';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <div class="skeleton-img">
                        <i class="fa-regular fa-bell"></i>
                    </div>
                    <div class="skeleton-content">
                        <div class="skeleton-tag">NOTICE</div>
                        <div class="skeleton-line title">${title}</div>
                        <div class="skeleton-line desc" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${desc}</div>
                    </div>`;
                
                card.addEventListener('click', () => openDetailModal(notice, 'notice'));
                homeList.appendChild(card);
            });
        }

        // Render Notice Board Full View
        if (notices.length === 0) {
            boardTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #888; padding: 30px;">
                        ${currentLang === 'ko' ? '등록된 공지사항이 없습니다.' : 'No notices registered.'}
                    </td>
                </tr>`;
        } else {
            [...notices].reverse().forEach((notice, idx) => {
                const title = currentLang === 'ko' ? notice.titleKo : notice.titleEn;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${notices.length - idx}</td>
                    <td class="notice-row-title">${title}</td>
                    <td>${notice.author}</td>
                    <td>${notice.date}</td>
                `;
                tr.addEventListener('click', () => openDetailModal(notice, 'notice'));
                boardTbody.appendChild(tr);
            });
        }
    };

    const renderPosts = () => {
        const homeFeatured = document.getElementById('home-featured-board');
        const boardTbody = document.getElementById('board-post-tbody');

        homeFeatured.innerHTML = '';
        boardTbody.innerHTML = '';

        // Home view Center Column Hero (Latest Post Highlight)
        const latestPost = posts.length > 0 ? posts[posts.length - 1] : null;

        if (!latestPost) {
            homeFeatured.innerHTML = `
                <div class="empty-card main-hero-skeleton">
                    <div class="hero-image-placeholder">
                        <i class="fa-regular fa-image"></i>
                        <span data-ko="등록된 게시글 없음" data-en="No Featured Post">${currentLang === 'ko' ? '등록된 게시글 없음' : 'No Featured Post'}</span>
                    </div>
                    <div class="hero-content">
                        <div class="skeleton-tag">BOARD</div>
                        <h3 class="hero-title">${currentLang === 'ko' ? '작성된 게시글이 없습니다.' : 'No posts created.'}</h3>
                        <p class="hero-desc">${currentLang === 'ko' ? '커뮤니티 영역입니다. 자유롭게 의견을 나눠보세요.' : 'Community section. Share your opinions freely.'}</p>
                    </div>
                </div>`;
        } else {
            const title = currentLang === 'ko' ? latestPost.titleKo : latestPost.titleEn;
            const desc = currentLang === 'ko' ? latestPost.contentKo : latestPost.contentEn;
            homeFeatured.innerHTML = `
                <div class="empty-card main-hero-skeleton" style="cursor: pointer;">
                    <div class="hero-image-placeholder" style="background: linear-gradient(135deg, #111 0%, #333 100%); color: #fff;">
                        <i class="fa-regular fa-comments" style="font-size: 52px; color: rgba(255,255,255,0.7);"></i>
                        <span style="letter-spacing: 0.5px; opacity: 0.8; font-size: 13px;">LATEST COMMUNITY POST</span>
                    </div>
                    <div class="hero-content">
                        <div class="skeleton-tag">BOARD</div>
                        <h3 class="hero-title">${title}</h3>
                        <p class="hero-desc">${desc}</p>
                        <div style="margin-top: 15px; font-size: 12px; color: #888; display: flex; gap: 10px;">
                            <span>BY: ${latestPost.author}</span>
                            <span>|</span>
                            <span>DATE: ${latestPost.date}</span>
                        </div>
                    </div>
                </div>`;
            homeFeatured.firstElementChild.addEventListener('click', () => openDetailModal(latestPost, 'board'));
        }

        // Render Community Board Full View
        if (posts.length === 0) {
            boardTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #888; padding: 30px;">
                        ${currentLang === 'ko' ? '등록된 게시글이 없습니다.' : 'No posts registered.'}
                    </td>
                </tr>`;
        } else {
            [...posts].reverse().forEach((post, idx) => {
                const title = currentLang === 'ko' ? post.titleKo : post.titleEn;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${posts.length - idx}</td>
                    <td class="notice-row-title">${title}</td>
                    <td>${post.author}</td>
                    <td>${post.date}</td>
                `;
                tr.addEventListener('click', () => openDetailModal(post, 'board'));
                boardTbody.appendChild(tr);
            });
        }
    };


    // 5. Language Switching Feature
    const setLanguage = (lang) => {
        currentLang = lang;
        if (lang === 'ko') {
            langKrBtn.classList.add('active');
            langEnBtn.classList.remove('active');
            document.title = "JJ컴퍼니";
        } else {
            langKrBtn.classList.remove('active');
            langEnBtn.classList.add('active');
            document.title = "JJ Company";
        }

        // Translate general static content tags
        const elements = document.querySelectorAll('[data-ko], [data-en]');
        elements.forEach(el => {
            const translation = el.getAttribute(`data-${lang}`);
            if (translation) {
                if (translation.includes('&copy;')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Translate input placeholders
        const inputs = document.querySelectorAll('[data-ko-placeholder], [data-en-placeholder]');
        inputs.forEach(input => {
            const translation = input.getAttribute(`data-${lang}-placeholder`);
            if (translation) {
                input.placeholder = translation;
            }
        });

        // Refresh dynamic notice & posts rendering
        renderNotices();
        renderPosts();
    };

    if (langKrBtn && langEnBtn) {
        langKrBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('ko');
        });
        langEnBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('en');
        });
    }


    // 6. Modal Functions (Detail and Write Dialogue)
    const openDetailModal = (item, type) => {
        currentOpenItem = item;
        currentOpenType = type;
        const title = currentLang === 'ko' ? item.titleKo : item.titleEn;
        const content = currentLang === 'ko' ? item.contentKo : item.contentEn;
        const typeBadge = detailModal.querySelector('.skeleton-tag');

        // Update tag type
        if (type === 'notice') {
            typeBadge.textContent = 'NOTICE';
            typeBadge.style.backgroundColor = '#000';
        } else {
            typeBadge.textContent = 'BOARD';
            typeBadge.style.backgroundColor = '#333';
        }

        document.getElementById('detail-title').textContent = title;
        document.getElementById('detail-author').textContent = currentLang === 'ko' ? `작성자: ${item.author}` : `Author: ${item.author}`;
        document.getElementById('detail-date').textContent = currentLang === 'ko' ? `작성일: ${item.date}` : `Date: ${item.date}`;
        document.getElementById('detail-content').textContent = content;

        detailModal.classList.remove('hidden');
    };

    const closeDetailModal = () => {
        detailModal.classList.add('hidden');
        currentOpenItem = null;
        currentOpenType = null;
    };

    detailModalClose.addEventListener('click', closeDetailModal);
    detailModalConfirm.addEventListener('click', closeDetailModal);

    // Delete Action
    const detailModalDelete = document.getElementById('detail-modal-delete');
    if (detailModalDelete) {
        detailModalDelete.addEventListener('click', () => {
            if (!currentOpenItem || !currentOpenType) return;

            if (currentOpenType === 'notice') {
                const password = prompt(currentLang === 'ko' ? "공지사항 삭제를 위해 관리자 비밀번호를 입력해주세요:" : "Please enter the admin password to delete this notice:");
                if (password === '1234') {
                    notices = notices.filter(n => n.id !== currentOpenItem.id);
                    localStorage.setItem('jj_notices', JSON.stringify(notices));
                    closeDetailModal();
                    renderNotices();
                } else {
                    alert(currentLang === 'ko' ? "비밀번호가 올바르지 않습니다." : "Incorrect password.");
                }
            } else if (currentOpenType === 'board') {
                const confirmDelete = confirm(currentLang === 'ko' ? "정말 이 게시글을 삭제하시겠습니까?" : "Are you sure you want to delete this post?");
                if (confirmDelete) {
                    posts = posts.filter(p => p.id !== currentOpenItem.id);
                    localStorage.setItem('jj_posts', JSON.stringify(posts));
                    closeDetailModal();
                    renderPosts();
                }
            }
        });
    }

    // Admin Write Actions (Notices)
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginModalClose = document.getElementById('admin-login-modal-close');

    if (adminLoginModalClose) {
        adminLoginModalClose.addEventListener('click', () => {
            adminLoginModal.classList.add('hidden');
        });
    }

    adminWriteBtn.addEventListener('click', () => {
        adminLoginModal.classList.remove('hidden');
    });

    window.handleCredentialResponse = (response) => {
        if (response.credential) {
            adminLoginModal.classList.add('hidden');
            writeModal.classList.remove('hidden');
        }
    };

    const closeWriteModal = () => {
        writeModal.classList.add('hidden');
        inputNoticeTitle.value = '';
        inputNoticeContent.value = '';
    };

    writeModalClose.addEventListener('click', closeWriteModal);
    writeModalCancel.addEventListener('click', closeWriteModal);

    writeModalSubmit.addEventListener('click', () => {
        const title = inputNoticeTitle.value.trim();
        const content = inputNoticeContent.value.trim();

        if (!title || !content) {
            alert(currentLang === 'ko' ? "제목과 내용을 모두 작성해주세요." : "Please fill in both title and content.");
            return;
        }

        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const newNotice = {
            id: notices.length + 1,
            titleKo: title,
            titleEn: title,
            contentKo: content,
            contentEn: content,
            author: currentLang === 'ko' ? "관리자" : "Admin",
            date: formattedDate
        };

        notices.push(newNotice);
        localStorage.setItem('jj_notices', JSON.stringify(notices));

        renderNotices();
        closeWriteModal();
    });

    // Everyone Write Actions (Posts)
    boardWriteBtn.addEventListener('click', () => {
        postWriteModal.classList.remove('hidden');
    });

    const closePostWriteModal = () => {
        postWriteModal.classList.add('hidden');
        inputPostTitle.value = '';
        inputPostAuthor.value = '';
        inputPostContent.value = '';
    };

    postWriteModalClose.addEventListener('click', closePostWriteModal);
    postWriteModalCancel.addEventListener('click', closePostWriteModal);

    postWriteModalSubmit.addEventListener('click', () => {
        const title = inputPostTitle.value.trim();
        const author = inputPostAuthor.value.trim();
        const content = inputPostContent.value.trim();

        if (!title || !author || !content) {
            alert(currentLang === 'ko' ? "모든 필드를 작성해주세요." : "Please fill in all fields.");
            return;
        }

        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const newPost = {
            id: posts.length + 1,
            titleKo: title,
            titleEn: title,
            contentKo: content,
            contentEn: content,
            author: author,
            date: formattedDate
        };

        posts.push(newPost);
        localStorage.setItem('jj_posts', JSON.stringify(posts));

        renderPosts();
        closePostWriteModal();
    });


    // 7. Simple search box logic
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-box button');

    if (searchInput && searchBtn) {
        const handleSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                if (currentLang === 'ko') {
                    alert(`"${query}" 검색 기능은 준비 중입니다.`);
                } else {
                    alert(`Search functionality for "${query}" is under preparation.`);
                }
            }
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Initialize Renders
    renderNotices();
    renderPosts();
});
