![Aritfy Logo](./public/logo.png)

# Aritfy - Advanced Design Editor & Presentation Tool

A powerful, modern web-based design editor built with Next.js that combines canvas-based design capabilities with comprehensive presentation features. Create stunning graphics, presentations, and export them in multiple formats.

## 🌟 Features

### Design Editor
- **Canvas-based Design**: Intuitive drag-and-drop interface for creating designs
- **Rich Text Editing**: Advanced typography controls and text formatting
- **Shape Tools**: Comprehensive set of drawing and shape tools
- **Layer Management**: Professional-grade layer system with reordering and grouping
- **Image Integration**: Upload, manipulate, and integrate images seamlessly
- **Color Management**: Advanced color picker with material design colors
- **Undo/Redo**: Full history management for all design operations

### Export & Sharing
- **Multiple Formats**: PNG, JPEG, WebP, SVG, PDF, and JSON
- **Bulk Export**: Export all slides or individual pages
- **PDF Presentations**: Generate multi-page presentation PDFs
- **ZIP Archives**: Batch export with organized file structure
- **High-Quality Output**: Lossless export options for professional use

### Collaboration & Storage
- **User Authentication**: Secure login with NextAuth.js
- **Project Management**: Save, load, and organize your designs
- **Cloud Storage**: Reliable project storage with Neon Database
- **Real-time Autosave**: Never lose your work with automatic saving

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- PostgreSQL database (or Neon DB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/aritfy.git
   cd aritfy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # External APIs (optional)
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."

   # File Upload (if using UploadThing)
   UPLOADTHING_SECRET="..."
   UPLOADTHING_APP_ID="..."
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions

### UI Components
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant form handling
- **Sonner** - Toast notifications

### Canvas & Graphics
- **Fabric.js** - Powerful HTML5 canvas library
- **React Color** - Advanced color picker components
- **jsPDF** - Client-side PDF generation
- **JSZip** - ZIP file creation for bulk exports

### Backend & Database
- **Drizzle ORM** - Type-safe SQL toolkit
- **Neon Database** - Serverless PostgreSQL
- **NextAuth.js** - Complete authentication solution
- **Hono** - Fast, lightweight web framework

### State Management
- **Zustand** - Simple, powerful state management
- **TanStack Query** - Data fetching and caching
- **React Use** - Essential React hooks

## 📁 Project Structure

```
aritfy/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── features/
│   │   └── editor/         # Design editor components
│   │       ├── components/ # Editor-specific components
│   │       ├── hooks/      # Editor hooks and logic
│   │       ├── types.ts    # TypeScript definitions
│   │       └── utils.ts    # Utility functions
│   ├── db/                 # Database schema and configuration
│   ├── hooks/              # Global React hooks
│   └── lib/                # Utility libraries and configurations
├── public/                 # Static assets
├── drizzle/               # Database migrations
└── certificates/          # SSL certificates (for HTTPS development)
```

## 🎨 Usage Guide

### Creating Your First Design

1. **Start a New Project**: Click "New Design" from the dashboard
2. **Choose Your Canvas**: Select canvas size or start with a template
3. **Add Elements**: Use the toolbar to add text, shapes, or images
4. **Style Your Design**: Customize colors, fonts, and effects
5. **Save Your Work**: Projects auto-save as you work

### Working with Presentations

3. **Design Each Slide**: Switch between slides and design individually
4. **Organize Slides**: Drag thumbnails to reorder your presentation
5. **Export**: Choose to export individual slides or the entire presentation

### Export Options

- **PNG/JPEG/WebP**: High-quality raster images
- **SVG**: Scalable vector graphics
- **JSON**: Editable project files for later modification

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with HTTPS
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Database Management

```bash
# Generate new migrations after schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Run both generate and migrate
npm run db

# Open database studio
npm run db:studio
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Ensure responsive design compatibility
- Follow the existing code style

## 🆘 Support

- **Issues**: Report bugs on [GitHub Issues](link-to-issues)
- **Discussions**: Join our [Community Discussions](link-to-discussions)
- **Email**: Contact us at support@aritfy.com

## 🚧 Roadmap

### Upcoming Features
- [ ] Slide transitions and animations
- [ ] Collaborative editing
- [ ] Advanced templates library
- [ ] Mobile app companion
- [ ] AI-powered design suggestions
- [ ] PowerPoint import/export
- [ ] Real-time presentation mode
- [ ] Advanced drawing tools

### Version History
- **v0.1.0** - Initial release with core editor and presentation features

---

<div align="center">
  <p>Made with ❤️ by the Me</p>
  <p>
    <a href="https://aritfy.com">Website</a> •
  </p>
</div>
