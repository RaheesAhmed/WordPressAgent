# wpAgent 🚀

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/WordPress-AI-21759B?style=for-the-badge&logo=wordpress&logoColor=white" alt="WordPress" />
  <img src="https://img.shields.io/badge/LangGraph-AI-FF6B6B?style=for-the-badge" alt="LangGraph" />
</div>

<div align="center">
  <h3>AI-Powered WordPress Site Management with Natural Language</h3>
  <p>Manage your WordPress sites like a professional developer - through simple conversations. No technical knowledge required.</p>
</div>

---

## 🎥 Demo Video

<div align="center">
  <video width="100%" controls>
    <source src="./assests/Wordpress Agnet.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
  <p><em>Watch wpAgent in action - managing WordPress sites through natural language</em></p>
</div>

---

## 🌟 What is wpAgent?

**wpAgent** is an intelligent AI assistant that gives you complete control over WordPress sites through natural language conversations. Just describe what you want to do, and wpAgent handles all the technical complexity - from content management to database operations, theme customization to WooCommerce management.

### 💡 The Power of Natural Language

Instead of navigating through WordPress admin panels, learning complex APIs, or writing code, you simply tell wpAgent what you need:

```
"Create a blog post about AI and publish it with a featured image"
"Set up WooCommerce with 10 products in the Technology category"
"Create a child theme and customize the header styling"
"Back up my entire site and optimize the database"
```

wpAgent understands your intent and executes professional-grade WordPress operations instantly.

---

## 🎯 Key Capabilities

### ✅ **Content Management**
- Create, edit, and publish posts & pages
- Manage media library and featured images
- Bulk operations for efficient content handling
- Schedule posts for future publication
- Manage users, comments, and categories

### ✅ **File System Access**
- Read and write theme files (CSS, PHP, JS)
- Modify plugin files safely with automatic backups
- Create and edit custom templates
- Manage uploads directory

### ✅ **Theme Customization**
- Create child themes automatically
- Modify styles and templates
- Customize block themes (FSE)
- Update theme.json configuration
- Manage global styles and patterns

### ✅ **Plugin Control**
- Activate/deactivate plugins
- Read and modify plugin files
- Check plugin status and compatibility
- Install and configure plugins

### ✅ **Menu Management**
- Create navigation menus
- Add items (pages, posts, custom links)
- Assign menus to theme locations
- Reorder and organize menu structure

### ✅ **Custom Content Types**
- Manage custom post types
- Handle taxonomies and terms
- Create and organize categories/tags
- Work with advanced content structures

### ✅ **Shortcodes & Automation**
- Execute WordPress shortcodes
- Schedule automated tasks (cron jobs)
- Manage recurring operations
- Custom automation workflows

### ✅ **Widget System**
- Manage sidebars and widget areas
- Add, update, and remove widgets
- Configure widget settings
- Organize site layout

### ✅ **Database Operations**
- Execute safe SQL queries
- Inspect database tables
- Manage WordPress options
- View table structures and data
- Database optimization and cleanup

### ✅ **WooCommerce Integration**
- Manage products, orders, and inventory
- Handle customer data
- Create and manage coupons
- Configure payment gateways
- Set up shipping zones
- Generate sales reports
- Track top-selling products

### ✅ **Gutenberg Blocks**
- Work with block types and patterns
- Create and manage reusable blocks
- Customize block templates
- Configure block editor settings
- Search WordPress block directory

### ✅ **Advanced SEO**
- Generate XML sitemaps
- Manage robots.txt
- Create 301/302 redirects
- Set up Open Graph and Twitter Cards
- Add schema markup (JSON-LD)
- Optimize meta descriptions
- Analyze on-page SEO

### ✅ **Security Monitoring**
- Check site health status
- Monitor failed login attempts
- Verify core file integrity
- Scan file permissions
- Review debug logs
- Check for available updates
- Security vulnerability detection

### ✅ **Performance Optimization**
- Clear all caches (page, object, transients)
- Optimize database tables
- Clean up revisions and spam
- Regenerate image thumbnails
- Compress and optimize images
- Convert images to WebP format
- Monitor performance metrics
- Enable maintenance mode

### ✅ **Backup & Migration**
- Full site backups (files + database)
- Database-only backups
- Files-only backups
- Restore from backups
- Export/import content (XML)
- Clone to staging environments
- Schedule automatic backups
- Manage backup storage

### ✅ **User Roles & Permissions**
- Create custom user roles
- Manage capabilities
- Assign roles to users
- Check user permissions
- Control access levels

### ✅ **Complete Security**
- Multi-layer input validation
- Automatic backups before changes
- File permission checks
- Malware pattern detection
- PHP syntax validation
- Secure file operations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- WordPress site with REST API enabled
- WordPress Application Password (Settings → Security)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/RaheesAhmed/wpAgent.git
cd wpAgent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Create a `.env.local` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# WordPress Configuration
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=your_app_password_here

# Application Configuration
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to start managing WordPress with AI.

---

## 📖 Usage Examples

### Content Management

```
"Create a blog post titled 'Getting Started with WordPress' and publish it"

"Upload these 5 images and create a gallery post"

"Search for all draft posts and publish them"

"Create a new page called 'Services' with a contact form"
```

### Theme Customization

```
"Create a child theme of Twenty Twenty-Five"

"Change the primary color to #FF6B6B in my theme"

"Add custom CSS to make the header sticky"

"Read the functions.php file from my active theme"
```

### WooCommerce Operations

```
"Create 10 products in the Electronics category with prices between $50-$500"

"Update inventory for all products in the Clothing category"

"Show me today's sales report"

"Create a 20% off coupon code for Black Friday"
```

### Database & Optimization

```
"Optimize all database tables"

"Clear all caches and regenerate thumbnails"

"Show me the 10 largest database tables"

"Clean up old post revisions and spam comments"
```

### SEO & Performance

```
"Generate an XML sitemap for my site"

"Create a 301 redirect from old-url to new-url"

"Add Open Graph tags to all my blog posts"

"Analyze SEO for post ID 123"
```

### Security & Maintenance

```
"Check site health and show me any warnings"

"Create a full backup of my site"

"Verify WordPress core file integrity"

"Show me all failed login attempts from the last 24 hours"
```

### Plugin & Theme Management

```
"Activate the WooCommerce plugin"

"List all installed themes"

"Deactivate all inactive plugins"

"Check if Contact Form 7 is installed"
```

---

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS v4 with shadcn/ui
- **AI Engine**: LangGraph with OpenAI GPT-4
- **WordPress Integration**: REST API + Custom Tools
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Type Safety**: TypeScript 5+ (strict mode)

### Project Structure

```
wpAgent/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── artifacts/         # Artifact system
│   ├── chat/             # Chat interface
│   └── ui/               # UI components
├── lib/                  # Core utilities
│   ├── agents/           # AI agent definitions
│   └── utils.ts         # Helper functions
├── hooks/               # Custom React hooks
└── public/              # Static assets
```

---

## 🔧 Advanced Features

### 190+ WordPress Tools

wpAgent has access to **190 specialized tools** covering every aspect of WordPress:

- **Posts**: 15 tools for complete post management
- **Pages**: 4 tools for page operations
- **Media**: 10 tools for media library management
- **Users**: 4 tools for user management
- **Categories & Tags**: 6 tools for taxonomy management
- **Comments**: 4 tools for comment moderation
- **Settings**: 4 tools for site configuration
- **File System**: 8 tools for file operations
- **Themes**: 15 tools for theme management
- **Plugins**: 10 tools for plugin control
- **Menus**: 9 tools for navigation management
- **Custom Types**: 8 tools for post types & taxonomies
- **Shortcodes**: 3 tools for shortcode execution
- **Cron Jobs**: 5 tools for scheduled tasks
- **Widgets**: 6 tools for widget management
- **Database**: 6 tools for database operations
- **WooCommerce**: 16 tools for e-commerce
- **Gutenberg**: 12 tools for block editor
- **Security**: 7 tools for security monitoring
- **Performance**: 8 tools for optimization
- **SEO**: 11 tools for search optimization
- **Backup**: 10 tools for backup & migration
- **User Roles**: 8 tools for permissions management

### Intelligent Context Understanding

wpAgent understands complex requests and breaks them down into actionable steps:

```
"Set up a complete blog with categories, sample posts, and a custom theme"

wpAgent will:
1. Create categories (Technology, Lifestyle, Business)
2. Generate sample blog posts with content
3. Create a child theme
4. Customize the theme styling
5. Set up a blog homepage
6. Configure permalinks
7. Add navigation menu
```

### Safe Operations

- **Automatic Backups**: Before modifying files
- **Validation**: Input sanitization and validation
- **Permission Checks**: WordPress capability verification
- **Rollback Support**: Restore previous versions
- **Error Handling**: Graceful failure recovery

---

## 🎨 User Interface

### Professional Chat Interface

- **Real-time Streaming**: See responses as they're generated
- **Artifact Display**: Visual representation of WordPress operations
- **Code Highlighting**: Syntax highlighting for code snippets
- **History Management**: Track all conversations
- **Multi-Site Support**: Manage multiple WordPress sites

### Responsive Design

- **Desktop Optimized**: 40/60 chat-to-content ratio
- **Mobile Friendly**: Adaptive layouts
- **Dark Mode**: Eye-friendly theme switching
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🔐 Security & Privacy

### Data Protection

- **No Data Storage**: WordPress credentials stored locally only
- **Encrypted Connections**: HTTPS for all API calls
- **Secure Authentication**: WordPress Application Passwords
- **Permission-Based**: Respects WordPress user capabilities

### Safe Operations

- **Read-Only Mode**: Available for sensitive operations
- **Approval Workflows**: Confirm critical changes
- **Audit Logging**: Track all operations
- **Rollback Support**: Undo capability for major changes

---

## 📊 Use Cases

### For Agencies

```
- Manage multiple client sites from one interface
- Bulk content creation and updates
- Standardized theme and plugin management
- Automated backup and maintenance
```

### For Developers

```
- Rapid theme and plugin development
- Database query and optimization
- File system operations
- Advanced debugging and monitoring
```

### For Content Creators

```
- Bulk post creation and scheduling
- Media library organization
- SEO optimization automation
- Content migration and backup
```

### For E-commerce

```
- Product catalog management
- Inventory updates
- Order processing automation
- Sales reporting and analytics
```

### For Site Owners

```
- Simple site maintenance
- Security monitoring
- Performance optimization
- Backup management
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

```bash
# Fork and clone
git clone https://github.com/yourusername/wpAgent.git
cd wpAgent

# Create feature branch
git checkout -b feature/amazing-feature

# Install dependencies
npm install

# Make changes and test
npm run dev

# Commit and push
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

### Contribution Guidelines

1. **Code Quality**: Follow TypeScript strict mode
2. **Testing**: Add tests for new features
3. **Documentation**: Update README and add comments
4. **Security**: Ensure secure WordPress operations
5. **Performance**: Maintain fast response times

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **WordPress**: For the amazing CMS platform
- **LangGraph**: For powerful AI agent capabilities
- **OpenAI**: For GPT-4 language models
- **Vercel**: For hosting and deployment
- **shadcn/ui**: For beautiful UI components

---

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/RaheesAhmed/wpAgent/issues)
- **Documentation**: [Comprehensive guides](https://github.com/RaheesAhmed/wpAgent/wiki)
- **Community**: Join our discussions for help

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/RaheesAhmed">Rahees Ahmed</a></p>
  <p>⭐ Star this repository if you find it helpful!</p>
  <p><strong>Manage WordPress Like Never Before - With the Power of AI</strong></p>
</div>
