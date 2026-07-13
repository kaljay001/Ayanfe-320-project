// ============================================
// THEME MANAGEMENT
// ============================================

class ThemeManager {
    constructor() {
        this.darkTheme = 'dark-theme';
        this.lightTheme = 'light-theme';
        this.themeKey = 'theme-preference';
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.themeKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? this.darkTheme : this.lightTheme);
        this.setTheme(theme);
        this.attachEventListeners();
    }

    setTheme(theme) {
        document.body.classList.remove(this.darkTheme, this.lightTheme);
        document.body.classList.add(theme);
        localStorage.setItem(this.themeKey, theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains(this.darkTheme) 
            ? this.darkTheme 
            : this.lightTheme;
        const newTheme = currentTheme === this.darkTheme ? this.lightTheme : this.darkTheme;
        this.setTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.classList.remove('fa-moon', 'fa-sun');
            icon.classList.add(theme === this.darkTheme ? 'fa-sun' : 'fa-moon');
        }
    }

    attachEventListeners() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// ============================================
// NAVIGATION MANAGEMENT
// ============================================

class NavigationManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.updateActiveLink(link);
                this.closeMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav') && this.navMenu?.classList.contains('active')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.navMenu) {
            this.navMenu.classList.toggle('active');
        }
    }

    closeMenu() {
        if (this.navMenu) {
            this.navMenu.classList.remove('active');
        }
    }

    updateActiveLink(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
}

// ============================================
// AUTHENTICATION MANAGER
// ============================================

class AuthManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.init();
    }

    init() {
        if (this.currentUser) {
            this.updateUIForLoggedInUser();
        }
    }

    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    loadCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    register(userData) {
        // Check if email already exists
        if (this.users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create user with hashed password
        const user = {
            id: Date.now(),
            ...userData,
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            complaints: [],
            notifications: []
        };

        this.users.push(user);
        this.saveUsers();
        return { success: true, message: 'Registration successful', user };
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Invalid password' };
        }

        this.saveCurrentUser(user);
        return { success: true, message: 'Login successful', user };
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = '../index.html';
    }

    hashPassword(password) {
        // Simple hash function (use proper hashing in production)
        return btoa(password);
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUIForLoggedInUser() {
        const navBtn = document.querySelector('.signup-btn');
        if (navBtn) {
            navBtn.textContent = `${this.currentUser.firstName} (${this.currentUser.role})`;
            navBtn.href = '#';
        }
    }
}

// ============================================
// COMPLAINT MANAGER
// ============================================

class ComplaintManager {
    constructor() {
        this.complaints = this.loadComplaints();
    }

    loadComplaints() {
        const complaints = localStorage.getItem('complaints');
        return complaints ? JSON.parse(complaints) : [];
    }

    saveComplaints() {
        localStorage.setItem('complaints', JSON.stringify(this.complaints));
    }

    createComplaint(complaintData, author) {
        const complaint = {
            id: `CMP-${Date.now()}`,
            ...complaintData,
            authorId: author.id,
            author: `${author.firstName} ${author.lastName}`,
            status: 'submitted',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            replies: [],
            attachments: []
        };

        this.complaints.push(complaint);
        this.saveComplaints();
        return complaint;
    }

    getComplaintsByUser(userId) {
        return this.complaints.filter(c => c.authorId === userId);
    }

    getComplaintById(id) {
        return this.complaints.find(c => c.id === id);
    }

    updateComplaintStatus(id, status) {
        const complaint = this.getComplaintById(id);
        if (complaint) {
            complaint.status = status;
            complaint.updatedAt = new Date().toISOString();
            this.saveComplaints();
            return true;
        }
        return false;
    }

    addReply(complaintId, reply) {
        const complaint = this.getComplaintById(complaintId);
        if (complaint) {
            complaint.replies.push({
                id: Date.now(),
                ...reply,
                createdAt: new Date().toISOString()
            });
            this.saveComplaints();
            return true;
        }
        return false;
    }

    getAllComplaints() {
        return this.complaints;
    }

    getComplaintsByStatus(status) {
        return this.complaints.filter(c => c.status === status);
    }

    getComplaintsByCategory(category) {
        return this.complaints.filter(c => c.category === category);
    }

    getComplaintsByDepartment(department) {
        return this.complaints.filter(c => c.department === department);
    }
}

// ============================================
// NOTIFICATION MANAGER
// ============================================

class NotificationManager {
    constructor() {
        this.notifications = this.loadNotifications();
    }

    loadNotifications() {
        const notifications = localStorage.getItem('notifications');
        return notifications ? JSON.parse(notifications) : [];
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    createNotification(userId, notification) {
        const notif = {
            id: Date.now(),
            userId,
            ...notification,
            read: false,
            createdAt: new Date().toISOString()
        };

        this.notifications.push(notif);
        this.saveNotifications();
        this.displayToast(notification.message, notification.type);
        return notif;
    }

    getNotificationsByUser(userId) {
        return this.notifications.filter(n => n.userId === userId);
    }

    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            this.saveNotifications();
        }
    }

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
    }

    displayToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ============================================
// FORM VALIDATION
// ============================================

class FormValidator {
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validatePhone(phone) {
        const regex = /^[0-9]{10,}$/;
        return regex.test(phone.replace(/\D/g, ''));
    }

    static validateForm(formData, rules) {
        const errors = {};

        for (const [field, value] of Object.entries(formData)) {
            if (rules[field]) {
                const fieldErrors = [];

                if (rules[field].required && !value) {
                    fieldErrors.push(`${field} is required`);
                }

                if (rules[field].email && value && !this.validateEmail(value)) {
                    fieldErrors.push('Invalid email format');
                }

                if (rules[field].minLength && value && value.length < rules[field].minLength) {
                    fieldErrors.push(`${field} must be at least ${rules[field].minLength} characters`);
                }

                if (fieldErrors.length) {
                    errors[field] = fieldErrors;
                }
            }
        }

        return Object.keys(errors).length === 0 ? null : errors;
    }
}

// ============================================
// UTILITIES
// ============================================

class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getTimeAgo(date) {
        const now = new Date();
        const time = new Date(date);
        const diff = Math.floor((now - time) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        
        return this.formatDate(date);
    }

    static generateId() {
        return `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Initialize managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.navigationManager = new NavigationManager();
    window.authManager = new AuthManager();
    window.complaintManager = new ComplaintManager();
    window.notificationManager = new NotificationManager();
});
